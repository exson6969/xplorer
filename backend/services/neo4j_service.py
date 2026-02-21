import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load environment variables
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(_BACKEND_DIR, ".env"))

driver = GraphDatabase.driver(

    os.getenv("NEO4J_URI"), 
    auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
)

def query_graph(query_type, params):
    try:
        with driver.session() as session:
            if query_type == "find_places":
                # Find places matching user interests
                res = session.run("""
                    MATCH (p:Place) WHERE p.category IN $interests 
                    RETURN p LIMIT 5
                """, {"interests": params.get('interests', [])})
                return [dict(record['p']) for record in res]
                
            elif query_type == "find_hotels":
                # Find hotels, optionally filter by max price or amenities
                max_price = params.get('max_price', 100000)
                amenity = params.get('amenity', None)
                
                query = """
                    MATCH (h:Hotel)-[:HAS_ROOM]->(r:Room)
                    WHERE r.price <= $max_price
                """
                if amenity:
                    query += " AND $amenity IN r.amenities "
                
                query += " RETURN h.id AS hotel_id, h.name AS name, h.location AS location, h.description AS description, collect({room_type: r.type, price: r.price, amenities: r.amenities}) AS rooms LIMIT 5"
                
                res = session.run(query, {"max_price": max_price, "amenity": amenity})
                return [record.data() for record in res]
                
            elif query_type == "find_cabs":
                # Find transport agencies and their vehicles
                max_price = params.get('max_price', 100000)
                vehicle_type = params.get('vehicle_type', None) # e.g., Sedan, SUV
                
                query = """
                    MATCH (a:Agency)-[:OWNS_VEHICLE]->(v:Vehicle)
                    WHERE v.price <= $max_price
                """
                if vehicle_type:
                    query += " AND v.type = $vehicle_type "
                
                query += " RETURN a.id AS agency_id, a.name AS name, a.rating AS rating, collect({vehicle_id: v.id, model: v.model, type: v.type, price: v.price}) AS vehicles LIMIT 5"
                
                res = session.run(query, {"max_price": max_price, "vehicle_type": vehicle_type})
                return [record.data() for record in res]

            elif query_type == "calculate_itinerary":
                # Use the Road Time logic from the previous prompt
                res = session.run("""
                    MATCH (h:Hotel)-[r1:NEARBY_PLACE]->(p1:Place)
                    MATCH (p1)-[r2:CONNECTED_TO]->(p2:Place)
                    RETURN p1.name AS place1, p2.name AS place2, (r1.road_time_mins + r2.road_time_mins) as total_time
                    ORDER BY total_time ASC LIMIT 1
                """)
                record = res.single()
                return record.data() if record else None
                
        return None
    except Exception as e:
        print(f"⚠️  Neo4j query failed: {e}")
        return {"error": f"Database temporarily unavailable. The AI will use its own knowledge instead. ({type(e).__name__})"}


def calculate_optimal_route(place_names: list, hotel_name: str = None):
    """
    Given a list of place names from a confirmed itinerary,
    query the Neo4j graph for CONNECTED_TO edges with road_time_mins
    and compute a greedy nearest-neighbor loop (TSP-lite).
    
    Returns: {
        "ordered_route": ["Hotel", "Place A", "Place B", ...],
        "legs": [{"from": ..., "to": ..., "road_time_mins": ...}, ...],
        "total_road_time_mins": 120,
        "places_detail": [...],
        "hotels_detail": [...],
        "transport_options": [...]
    }
    """
    try:
        with driver.session() as session:
            # 1. Get all road times between places
            edges_result = session.run("""
                MATCH (p1:Place)-[r:CONNECTED_TO]->(p2:Place)
                WHERE p1.name IN $names AND p2.name IN $names
                RETURN p1.name AS from_place, p2.name AS to_place, r.road_time_mins AS road_time
            """, {"names": place_names})
            
            edges = {}
            for record in edges_result:
                key = (record["from_place"], record["to_place"])
                edges[key] = record["road_time"]
                # Also store reverse (treat as undirected for route planning)
                edges[(record["to_place"], record["from_place"])] = record["road_time"]
            
            # 2. If we have hotel, get hotel-to-place distances
            if hotel_name:
                hotel_edges_result = session.run("""
                    MATCH (h:Hotel)-[r:NEARBY_PLACE]->(p:Place)
                    WHERE h.name = $hotel AND p.name IN $names
                    RETURN p.name AS place, r.road_time_mins AS road_time
                """, {"hotel": hotel_name, "names": place_names})
                
                for record in hotel_edges_result:
                    edges[(hotel_name, record["place"])] = record["road_time"]
                    edges[(record["place"], hotel_name)] = record["road_time"]
            
            # 3. Greedy Nearest-Neighbor TSP
            start = hotel_name if hotel_name else (place_names[0] if place_names else None)
            if not start:
                return {"error": "No places provided"}
            
            unvisited = set(place_names)
            if start in unvisited:
                unvisited.remove(start)
            
            route = [start]
            total_time = 0
            legs = []
            
            current = start
            while unvisited:
                # Find nearest unvisited place
                best = None
                best_time = float('inf')
                for place in unvisited:
                    t = edges.get((current, place), 9999)
                    if t < best_time:
                        best_time = t
                        best = place
                
                if best:
                    legs.append({"from": current, "to": best, "road_time_mins": best_time if best_time < 9999 else None})
                    total_time += best_time if best_time < 9999 else 30  # default 30 min if unknown
                    route.append(best)
                    unvisited.remove(best)
                    current = best
                else:
                    break
            
            # Return to start (loop)
            if hotel_name and route[-1] != hotel_name:
                return_time = edges.get((current, hotel_name), 30)
                legs.append({"from": current, "to": hotel_name, "road_time_mins": return_time if return_time < 9999 else None})
                total_time += return_time if return_time < 9999 else 30
                route.append(hotel_name)
            
            # 4. Get place details
            places_result = session.run("""
                MATCH (p:Place) WHERE p.name IN $names
                RETURN p.name AS name, p.category AS category, 
                       p.description AS description, p.location AS location,
                       p.latitude AS lat, p.longitude AS lng,
                       p.rating AS rating
            """, {"names": place_names})
            places_detail = [record.data() for record in places_result]
            
            # 5. Get hotel details
            hotels_detail = []
            if hotel_name:
                hotel_result = session.run("""
                    MATCH (h:Hotel)-[:HAS_ROOM]->(r:Room)
                    WHERE h.name = $hotel
                    RETURN h.name AS name, h.location AS location, h.description AS description,
                           h.latitude AS lat, h.longitude AS lng,
                           collect({room_type: r.type, price: r.price, amenities: r.amenities}) AS rooms
                """, {"hotel": hotel_name})
                hotels_detail = [record.data() for record in hotel_result]
            
            # 6. Get transport options
            transport_result = session.run("""
                MATCH (a:Agency)-[:OWNS_VEHICLE]->(v:Vehicle)
                RETURN a.name AS agency, a.rating AS rating,
                       v.model AS model, v.type AS type, v.price AS price
                ORDER BY v.price ASC LIMIT 10
            """)
            transport_options = [record.data() for record in transport_result]
            
            return {
                "ordered_route": route,
                "legs": legs,
                "total_road_time_mins": total_time,
                "places_detail": places_detail,
                "hotels_detail": hotels_detail,
                "transport_options": transport_options
            }
    except Exception as e:
        print(f"⚠️  Route optimization failed: {e}")
        return {
            "error": str(e),
            "ordered_route": place_names,
            "legs": [],
            "total_road_time_mins": None,
            "places_detail": [],
            "hotels_detail": [],
            "transport_options": []
        }
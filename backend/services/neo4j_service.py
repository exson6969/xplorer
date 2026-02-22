import os
from neo4j import GraphDatabase
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

# Load environment variables
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(_BACKEND_DIR, ".env"))

driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"), 
    auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
)

# Initialize embedding model lazily
_encoder = None
def get_encoder():
    global _encoder
    if _encoder is None:
        print("Loading SentenceTransformer model...")
        _encoder = SentenceTransformer('all-MiniLM-L6-v2')
    return _encoder

def query_graph(query_type, params):
    try:
        with driver.session() as session:
            if query_type == "find_places":
                # Find places matching user interests (Graph Search)
                res = session.run("""
                    MATCH (p:Place) WHERE p.category IN $interests 
                    RETURN p LIMIT 5
                """, {"interests": params.get('interests', [])})
                return [dict(record['p']) for record in res]
            
            elif query_type == "vector_search":
                # Semantic Search (Vector RAG)
                user_query = params.get('query', '')
                if not user_query: return []
                
                embedding = get_encoder().encode(user_query).tolist()
                
                # Search Places
                place_res = session.run("""
                    CALL db.index.vector.queryNodes('place_desc_index', 5, $embedding)
                    YIELD node, score
                    RETURN node.name AS name, node.category AS category, node.description AS description, score
                """, {"embedding": embedding})
                
                # Search Hotels
                hotel_res = session.run("""
                    CALL db.index.vector.queryNodes('hotel_desc_index', 3, $embedding)
                    YIELD node, score
                    RETURN node.name AS name, 'hotel' AS category, node.description AS description, score
                """, {"embedding": embedding})
                
                results = [record.data() for record in place_res] + [record.data() for record in hotel_res]
                # Sort by score descending
                results.sort(key=lambda x: x['score'], reverse=True)
                return results

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


def calculate_optimal_route(input_data: list, hotel_name: str = None, is_multiday: bool = False):
    """
    Optimizes travel routes. 
    If is_multiday is True, input_data is List[List[str]] (places per day).
    Otherwise, it's a flat List[str].
    """
    try:
        # 1. Normalize Structure
        days_list = input_data if is_multiday else [input_data]
        hotel_name = hotel_name.strip() if hotel_name else None
        
        all_unique_names = set()
        if hotel_name: all_unique_names.add(hotel_name)
        for day in days_list:
            for p in day: 
                if p: all_unique_names.add(p.strip())
        
        lower_names = [n.lower() for n in all_unique_names]

        with driver.session() as session:
            # 2. Pre-fetch All Road Times (Case-Insensitive)
            edges_result = session.run("""
                MATCH (n)-[r]-(m)
                WHERE type(r) IN ['CONNECTED_TO', 'NEARBY_PLACE']
                AND toLower(n.name) IN $names AND toLower(m.name) IN $names
                RETURN n.name AS from_node, m.name AS to_node, r.road_time_mins AS road_time
            """, {"names": lower_names})
            
            edges = {}
            for record in edges_result:
                edges[(record["from_node"], record["to_node"])] = record["road_time"]
                edges[(record["to_node"], record["from_node"])] = record["road_time"]

            # 3. Optimize Each Day
            optimized_days = []
            total_time = 0
            
            for i, day_places in enumerate(days_list):
                day_places = [p.strip() for p in day_places if p and p.strip()]
                if not day_places: continue
                
                # Start/End at hotel if available
                start = hotel_name if hotel_name else day_places[0]
                unvisited = set(day_places)
                if start in unvisited: unvisited.remove(start)
                
                day_route = [start]
                day_legs = []
                current = start
                
                while unvisited:
                    best = None
                    best_time = float('inf')
                    for place in unvisited:
                        t = edges.get((current, place), 30)
                        if t < best_time:
                            best_time = t
                            best = place
                    
                    if best:
                        day_legs.append({"from": current, "to": best, "road_time_mins": best_time})
                        total_time += best_time
                        day_route.append(best)
                        unvisited.remove(best)
                        current = best
                    else: break
                
                # Return to hotel at end of day
                if hotel_name and day_route[-1] != hotel_name:
                    t = edges.get((current, hotel_name), 30)
                    day_legs.append({"from": current, "to": hotel_name, "road_time_mins": t})
                    total_time += t
                    day_route.append(hotel_name)
                
                optimized_days.append({
                    "day_number": i + 1,
                    "route": day_route,
                    "legs": day_legs
                })

            # 4. Fetch Details for UI
            places_result = session.run("""
                MATCH (p:Place) WHERE toLower(p.name) IN $names
                RETURN p.name AS name, p.category AS category, 
                       p.description AS description, p.area AS location,
                       p.lat AS lat, p.lon AS lng,
                       p.rating AS rating
            """, {"names": lower_names})
            places_detail = [record.data() for record in places_result]
            
            # Map lng to lon for frontend consistency if needed
            for p in places_detail:
                if 'lng' not in p and 'lon' in p: p['lng'] = p['lon']

            # Fill missing places
            found_names = {p['name'].lower() for p in places_detail}
            for name in all_unique_names:
                if name.lower() not in found_names and (not hotel_name or name.lower() != hotel_name.lower()):
                    places_detail.append({
                        "name": name, "category": "Point of Interest", "description": "Local spot",
                        "location": "Chennai", "lat": 13.0827, "lng": 80.2707
                    })

            # Hotel Details
            hotels_detail = []
            if hotel_name:
                hotel_result = session.run("""
                    MATCH (h:Hotel)-[:HAS_ROOM]->(r:Room)
                    WHERE ($hotel IS NULL AND h.name IS NULL) OR (toLower(h.name) = toLower($hotel))
                    RETURN h.name AS name, h.area AS location, h.description AS description,
                           h.lat AS lat, h.lon AS lng,
                           collect({room_type: r.type, price: r.price, amenities: r.amenities}) AS rooms
                """, {"hotel": hotel_name})
                hotels_detail = [record.data() for record in hotel_result]
                if hotels_detail:
                    for h_det in hotels_detail: # Ensure all hotel details have 'lng'
                        if 'lng' not in h_det and 'lon' in h_det: h_det['lng'] = h_det['lon']
                else:
                    hotels_detail = [{"name": hotel_name, "location": "Chennai", "lat": 13.0827, "lng": 80.2707, "rooms": []}]

            # Transport
            transport_result = session.run("MATCH (a:Agency)-[:OWNS_VEHICLE]->(v:Vehicle) RETURN a.name AS agency, v.model AS model, v.type AS type, v.price AS price ORDER BY v.price ASC LIMIT 5")
            transport_options = [record.data() for record in transport_result]

            return {
                "days": optimized_days,
                "total_road_time_mins": total_time,
                "places_detail": places_detail,
                "hotels_detail": hotels_detail,
                "transport_options": transport_options,
                # For backward compatibility
                "ordered_route": optimized_days[0]["route"] if optimized_days and optimized_days[0]["route"] else [],
                "legs": optimized_days[0]["legs"] if optimized_days and optimized_days[0]["legs"] else []
            }

    except Exception as e:
        print(f"⚠️  Route optimization failed: {e}")
        return {"error": str(e)}
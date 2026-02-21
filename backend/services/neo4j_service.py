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
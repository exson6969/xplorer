from neo4j import GraphDatabase
import os

driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"), 
    auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
)

def query_graph(query_type, params):
    with driver.session() as session:
        if query_type == "find_places":
            # Example: Find places matching user interests
            res = session.run("""
                MATCH (p:Place) WHERE p.category IN $interests 
                RETURN p LIMIT 5
            """, {"interests": params.get('interests', [])})
            return [record['p'] for record in res]
            
        elif query_type == "calculate_itinerary":
            # Use the Road Time logic from the previous prompt
            res = session.run("""
                MATCH (h:Hotel)-[r1:NEARBY_PLACE]->(p1:Place)
                MATCH (p1)-[r2:CONNECTED_TO]->(p2:Place)
                RETURN p1.name, p2.name, (r1.road_time_mins + r2.road_time_mins) as total_time
                ORDER BY total_time ASC LIMIT 1
            """)
            return res.single()
    return None
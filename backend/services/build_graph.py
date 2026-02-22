import os
import json
import googlemaps
from neo4j import GraphDatabase
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

# Load from the backend folder root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

class XplorerGraphBuilder:
    def __init__(self):
        # API Connections
        self.gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI"), 
            auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
        )
        # Initialize Embedding Model (lightweight)
        print("Loading embedding model...")
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')

    def close(self):
        self.driver.close()

    def query(self, cypher, params=None):
        """Helper to run a query and return data immediately."""
        with self.driver.session() as session:
            result = session.run(cypher, params)
            return result.data()

    def reset_database(self):
        print("Emptying database and setting constraints...")
        self.query("MATCH (n) DETACH DELETE n")
        # Constraints
        self.query("CREATE CONSTRAINT place_id IF NOT EXISTS FOR (p:Place) REQUIRE p.id IS UNIQUE")
        self.query("CREATE CONSTRAINT hotel_id IF NOT EXISTS FOR (h:Hotel) REQUIRE h.id IS UNIQUE")
        self.query("CREATE CONSTRAINT agency_id IF NOT EXISTS FOR (a:Agency) REQUIRE a.id IS UNIQUE")
        
        # Vector Indexes
        print("Creating Vector Indexes...")
        try:
            self.query("""
                CREATE VECTOR INDEX place_desc_index IF NOT EXISTS
                FOR (p:Place) ON (p.embedding)
                OPTIONS {indexConfig: {
                    `vector.dimensions`: 384,
                    `vector.similarity_function`: 'cosine'
                }}
            """)
            self.query("""
                CREATE VECTOR INDEX hotel_desc_index IF NOT EXISTS
                FOR (h:Hotel) ON (h.embedding)
                OPTIONS {indexConfig: {
                    `vector.dimensions`: 384,
                    `vector.similarity_function`: 'cosine'
                }}
            """)
        except Exception as e:
            print(f"Index creation warning (might already exist or version mismatch): {e}")

    def ingest_places(self, data):
        print(f"Ingesting {len(data)} Places...")
        
        # Generate embeddings
        for p in data:
            desc = p.get('description', '') or p.get('name', '')
            p['embedding'] = self.encoder.encode(desc).tolist()

        cypher = """
        UNWIND $data AS p
        MERGE (place:Place {id: p.id})
        SET place.name = p.name,
            place.category = p.category,
            place.sub_category = p.sub_category,
            place.description = p.description,
            place.embedding = p.embedding,
            place.lat = toFloat(p.location.latitude),
            place.lon = toFloat(p.location.longitude),
            place.area = p.location.area,
            place.city = p.location.city,
            place.open_time = p.timings.opening_time,
            place.close_time = p.timings.closing_time,
            place.duration = p.visit.recommended_duration_minutes,
            place.ideal_blocks = p.visit.ideal_time_blocks,
            place.best_visit_time = p.best_visit_time,
            place.weather_sensitive = p.visit.weather_sensitive,
            place.crowd_level = p.crowd.average_level,
            place.seasonal_peak_months = p.crowd.seasonal_peak_months,
            place.entry_fee = p.pricing.entry_fee,
            place.ticket_required = p.pricing.ticket_required,
            place.wait_time = p.pricing.average_wait_time_minutes,
            place.dress_code_required = p.rules.dress_code_required,
            place.experience_tags = p.experience.tags,
            place.suitable_for = p.experience.suitable_for,
            place.indoor_outdoor = p.experience.indoor_outdoor,
            place.heritage_score = p.scores.heritage,
            place.instagrammability_score = p.scores.instagrammability,
            place.popularity_index = p.scores.popularity_index,
            place.rating = p.scores.user_rating,
            place.travel_priority = p.scores.travel_priority
        
        MERGE (city:City {name: 'Chennai'})
        MERGE (place)-[:LOCATED_IN]->(city)
        
        WITH place, p
        FOREACH (rev IN coalesce(p.reviews, []) |
            MERGE (r:Review {text: rev.review_text, date: rev.date_time, rating: rev.rating})
            MERGE (place)-[:HAS_REVIEW]->(r)
        )
        """
        self.query(cypher, {"data": data})

    def ingest_hotels(self, data):
        print(f"Ingesting {len(data)} Hotels...")
        processed_hotels = []
        for h in data:
            # Flatten the 'location' if it's a map/dict
            area = h.get('location', 'Chennai')
            if isinstance(area, dict): area = area.get('area', 'Chennai')
            
            desc = h.get("description", "") or h.get("name", "")
            embedding = self.encoder.encode(desc).tolist()

            processed_hotels.append({
                "id": h["hotel_id"], 
                "name": h["name"], 
                "lat": float(h["latitude"]),
                "lon": float(h["longitude"]), 
                "area": area, 
                "description": h.get("description", ""),
                "embedding": embedding,
                "rooms": h.get("rooms", []),
                "reviews": h.get("reviews", [])
            })
        
        cypher = """
        UNWIND $data AS h
        MERGE (hotel:Hotel {id: h.id})
        SET hotel.name = h.name, 
            hotel.lat = h.lat, 
            hotel.lon = h.lon, 
            hotel.area = h.area,
            hotel.description = h.description,
            hotel.embedding = h.embedding
            
        MERGE (city:City {name: 'Chennai'})
        MERGE (hotel)-[:LOCATED_IN]->(city)
        
        WITH hotel, h
        FOREACH (rev IN coalesce(h.reviews, []) |
            MERGE (r:Review {text: rev.review_text, date: rev.date_time, rating: rev.rating})
            MERGE (hotel)-[:HAS_REVIEW]->(r)
        )
        
        WITH hotel, h.rooms as rooms
        UNWIND rooms as r
        MERGE (room:Room {id: r.room_id})
        SET room.type = r.room_type, 
            room.price = r.price_per_night,
            room.bed_type = r.bed_type,
            room.max_guests = r.max_guests,
            room.total_rooms = r.total_rooms,
            room.available_rooms = r.available_rooms,
            room.amenities = r.amenities
        MERGE (hotel)-[:HAS_ROOM]->(room)
        """
        self.query(cypher, {"data": processed_hotels})

    def ingest_transport(self, data):
        print("Ingesting Transport...")
        agencies = data.get("transport_agencies", [])
        processed = []
        for a in agencies:
            # Clean up the location map
            loc = a.get('location', {})
            a['map_url_str'] = loc.get('map_url', '') if isinstance(loc, dict) else ""
            processed.append(a)

        cypher = """
        UNWIND $data AS a
        MERGE (agency:Agency {id: a.agency_id})
        SET agency.name = a.agency_name, 
            agency.contact_number = a.contact_number,
            agency.rating = a.overall_rating, 
            agency.description = a.agency_description,
            agency.detailed_review = a.detailed_review,
            agency.map_url = a.map_url_str
        
        MERGE (city:City {name: 'Chennai'})
        MERGE (agency)-[:OPERATES_IN]->(city)

        WITH agency, a
        FOREACH (d IN a.drivers |
            MERGE (dr:Driver {id: d.driver_id}) 
            SET dr.status = d.availability_status,
                dr.review_text = d.driver_review.review_text,
                dr.rating = d.driver_review.rating 
            MERGE (agency)-[:EMPLOYS]->(dr)
        )
        FOREACH (v IN a.fleet |
            MERGE (veh:Vehicle {id: v.vehicle_id}) 
            SET veh.category = v.vehicle_category,
                veh.type = v.vehicle_type,
                veh.model = v.model,
                veh.passenger_seats = v.seating_capacity.passenger_seats,
                veh.price = v.day_package.fixed_price,
                veh.included_km = v.day_package.included_km,
                veh.extra_km_charge = v.day_package.extra_km_charge,
                veh.status = v.availability_status,
                veh.assigned_driver_id = v.assigned_driver_id
            MERGE (agency)-[:OWNS_VEHICLE]->(veh)
        )
        FOREACH (rev IN coalesce(a.reviews, []) |
            MERGE (r:Review {text: rev.review_text, date: rev.date_time, rating: rev.rating})
            MERGE (agency)-[:HAS_REVIEW]->(r)
        )
        """
        self.query(cypher, {"data": processed})

    def build_spatial_connections(self):
        print("Building spatial connections...")
        # 1. Connect everything within 20km via Math
        self.query("""
            MATCH (h:Hotel), (p:Place)
            WHERE point.distance(
                point({latitude: h.lat, longitude: h.lon}), 
                point({latitude: p.lat, longitude: p.lon})
            ) < 20000
            MERGE (h)-[:NEARBY_PLACE]->(p)
        """)
        self.query("""
            MATCH (p1:Place), (p2:Place)
            WHERE p1.id < p2.id AND point.distance(
                point({latitude: p1.lat, longitude: p1.lon}), 
                point({latitude: p2.lat, longitude: p2.lon})
            ) < 20000
            MERGE (p1)-[:CONNECTED_TO]->(p2)
        """)

        # 2. Refine with Google Maps for road traffic time
        for rel in ["NEARBY_PLACE", "CONNECTED_TO"]:
            print(f"Refining {rel} with Google Maps data...")
            batch = self.query(f"""
                MATCH (n)-[r:{rel}]->(m) 
                WHERE r.road_time_mins IS NULL 
                RETURN n.id as id1, n.lat as lat1, n.lon as lon1, 
                       m.id as id2, m.lat as lat2, m.lon as lon2 
                LIMIT 50
            """)

            for rec in batch:
                try:
                    matrix = self.gmaps.distance_matrix(
                        origins=(rec['lat1'], rec['lon1']),
                        destinations=(rec['lat2'], rec['lon2']),
                        mode="driving", departure_time="now"
                    )
                    res = matrix['rows'][0]['elements'][0]
                    if res['status'] == 'OK':
                        dist = res['distance']['value'] / 1000
                        time = res['duration_in_traffic']['value'] / 60
                        self.query(f"""
                            MATCH (n {{id: $id1}})-[r:{rel}]->(m {{id: $id2}})
                            SET r.road_dist_km = $d, r.road_time_mins = $t
                        """, {"id1": rec['id1'], "id2": rec['id2'], "d": dist, "t": time})
                except Exception as e:
                    print(f"  Google API Error: {e}")

# --- EXECUTION ---
if __name__ == "__main__":
    builder = XplorerGraphBuilder()
    
    # 1. Start Fresh
    builder.reset_database()
    
    # 2. Paths to your JSON files (assuming they are in the root or services folder)
    # Update these paths based on where you saved the JSON content I gave you
    def get_path(filename):
        return os.path.join(os.path.dirname(__file__), filename)

    try:
        with open(get_path('data/places.json')) as f: builder.ingest_places(json.load(f))
        with open(get_path('data/hotels.json')) as f: builder.ingest_hotels(json.load(f))
        with open(get_path('data/transport.json')) as f: builder.ingest_transport(json.load(f))
        
        # 3. Connect the map
        builder.build_spatial_connections()
        print("\n✅ Knowledge Graph Built Successfully!")
        
    except FileNotFoundError as e:
        print(f"Error: Could not find JSON file. {e}")
    finally:
        builder.close()
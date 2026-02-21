import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USER")
password = os.getenv("NEO4J_PASSWORD")

print(f"Connecting to {uri} as {user}...")

try:
    driver = GraphDatabase.driver(uri, auth=(user, password))
    with driver.session() as session:
        result = session.run("RETURN 1 AS num")
        record = result.single()
        print(f"Connection successful! Result: {record['num']}")
    driver.close()
except Exception as e:
    print(f"Connection failed: {e}")

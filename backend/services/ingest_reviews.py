import os
import json
import time
from pinecone import Pinecone, ServerlessSpec
from langchain_community.embeddings import SentenceTransformerEmbeddings # Correct import
from dotenv import load_dotenv

load_dotenv()

# 1. Initialize Pinecone & Embeddings
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = os.getenv("PINECONE_INDEX_NAME")
# Use HuggingFace model
embeddings = SentenceTransformerEmbeddings(model_name="all-mpnet-base-v2") 

# 2. Manage Index (Delete and Recreate if dimension mismatch)
DIMENSION = 768 # Dimension for 'all-mpnet-base-v2'

existing_indexes = pc.list_indexes().names()
if index_name in existing_indexes:
    index_description = pc.describe_index(index_name)
    if index_description.dimension != DIMENSION:
        print(f"Index '{index_name}' has dimension {index_description.dimension}, but we need {DIMENSION}. Recreating...")
        pc.delete_index(index_name)
        # Wait for deletion to propagate
        while index_name in pc.list_indexes().names():
            time.sleep(1)
        existing_indexes = pc.list_indexes().names()

if index_name not in existing_indexes:
    print(f"Creating Pinecone index '{index_name}' with dimension {DIMENSION}...")
    pc.create_index(
        name=index_name,
        dimension=DIMENSION,
        metric='cosine',
        spec=ServerlessSpec(cloud='aws', region='us-east-1')
    )
    # Wait for index to be ready
    while not pc.describe_index(index_name).status['ready']:
        time.sleep(1)

index = pc.Index(index_name)

def ingest_reviews_from_file(file_path, entity_type):
    """
    entity_type: 'Place', 'Hotel', 'Agency'
    """
    print(f"Ingesting reviews for {entity_type}s from {file_path}...")
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Handle the structure of transport.json (it's a dict with transport_agencies list)
    if isinstance(data, dict) and "transport_agencies" in data:
        items = data["transport_agencies"]
    else:
        items = data

    vectors = []
    for item in items:
        # Resolve ID
        item_id = str(item.get('id') or item.get('hotel_id') or item.get('agency_id'))
        name = item.get('name') or item.get('agency_name')
        
        reviews = item.get('reviews', [])
        
        # Also include specific fields as "virtual reviews" or descriptions
        desc = item.get('description') or item.get('agency_description')
        if desc:
            reviews.append({"review_text": desc, "rating": item.get('scores', {}).get('user_rating', 5.0)})

        for i, rev in enumerate(reviews):
            text = rev.get('review_text')
            if not text: continue
            
            # Create a rich text for embedding
            enriched_text = f"[{entity_type}: {name}] {text}"
            
            # Embed
            emb = embeddings.embed_query(enriched_text)
            
            vectors.append({
                "id": f"{entity_type}_{item_id}_{i}",
                "values": emb,
                "metadata": {
                    "parent_id": item_id,
                    "parent_name": name,
                    "type": entity_type,
                    "text": text,
                    "rating": float(rev.get('rating', 0))
                }
            })
            
            # Batch upsert (Pinecone recommends batches of ~100)
            if len(vectors) >= 50:
                index.upsert(vectors=vectors)
                vectors = []

    if vectors:
        index.upsert(vectors=vectors)
    print(f"Finished {entity_type} ingestion.")

if __name__ == "__main__":
    # Ingest from all sources
    base_path = "services/data"
    ingest_reviews_from_file(os.path.join(base_path, 'places.json'), 'Place')
    ingest_reviews_from_file(os.path.join(base_path, 'hotels.json'), 'Hotel')
    ingest_reviews_from_file(os.path.join(base_path, 'transport.json'), 'Agency')
    
    print("✅ All reviews successfully embedded in Pinecone!")

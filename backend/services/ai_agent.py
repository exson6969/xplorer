import os
import json
from pinecone import Pinecone
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.graphs import Neo4jGraph
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage
from langchain_community.embeddings import SentenceTransformerEmbeddings # Use HuggingFace embeddings
from dotenv import load_dotenv

load_dotenv()

class TravelPlannerAI:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", google_api_key=os.getenv("GOOGLE_API_KEY"))
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        self.graph = Neo4jGraph(
            url=os.getenv("NEO4J_URI"),
            username=os.getenv("NEO4J_USER"),
            password=os.getenv("NEO4J_PASSWORD")
        )
        
        # Initialize Pinecone
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.review_index = self.pc.Index(os.getenv("PINECONE_INDEX_NAME"))

    def _get_hybrid_suggestions(self, user_query: str, weight_graph=0.4, weight_reviews=0.6):
        """
        Calculates a hybrid score from Graph (popularity/rating) and Pinecone (vibe/reviews).
        """
        emb = self.embeddings.embed_query(user_query)

        # 1. GRAPH SEARCH (Logical/Structural)
        vector_query = f"""
        CALL db.index.vector.queryNodes('place_index', 10, $embedding)
        YIELD node, score
        RETURN node.name as name, node.description as desc, node.open_time as open, 
               node.close_time as close, node.ideal_blocks as blocks, node.best_visit_time as best_time, node.rating as rating
        """
        emb = self.embeddings.embed_query(user_query)
        places = self.graph.query(vector_query, {"embedding": emb})
        
        # 2. Get some top hotels
        hotels = self.graph.query("MATCH (h:Hotel) RETURN h.name as name, h.area as area LIMIT 3")
        
        # 3. Build the System Prompt
        system_prompt = f"""
        You are Xplorer AI, an expert travel agent for Chennai.
        User Profile: {user_profile}
        
        Available Hybrid Suggestions (Weighted based on Knowledge Graph & User Reviews):
        {json.dumps(suggestions, indent=2)}
        
        Top Hotels:
        {json.dumps(hotels, indent=2)}
        
        Instructions:
        1. When recommending places, MENTION if the suggestion is strongly backed by user reviews (check 'sources').
        2. If user query is vague (e.g. "I want a trip"), ASK for missing info: Dates, Group Size, Interests.
        3. If you have enough info, suggest a logical ITINERARY using the 'road_time_mins' concept.
        4. ALWAYS respond in a helpful, conversational tone.
        5. If data is missing, ask clearly. Do not make up places.
        """

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}")
        ])

        # 3. Format History for LangChain
        chat_history = []
        for h in history[-5:]: # Last 5 turns
            chat_history.append(HumanMessage(content=h['user_input']))
            out = h['ai_generated_output']
            chat_history.append(AIMessage(content=str(out) if isinstance(out, dict) else out))

        chain = prompt | self.llm
        response = chain.invoke({"input": user_input, "history": chat_history})
        
        return response.content

ai_planner = TravelPlannerAI()

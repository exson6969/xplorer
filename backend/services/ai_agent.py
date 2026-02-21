import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.graphs import Neo4jGraph
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage
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

    def _get_context_from_graph(self, user_query: str):
        """Perform a hybrid search: Vector (vibe) + Logic (distance)"""
        # 1. Vector Search for relevant places
        vector_query = f"""
        CALL db.index.vector.queryNodes('place_index', 5, $embedding)
        YIELD node, score
        RETURN node.name as name, node.description as desc, node.open_time as open, 
               node.close_time as close, node.ideal_blocks as blocks, node.rating as rating
        """
        emb = self.embeddings.embed_query(user_query)
        places = self.graph.query(vector_query, {"embedding": emb})
        
        # 2. Get some top hotels
        hotels = self.graph.query("MATCH (h:Hotel) RETURN h.name as name, h.area as area LIMIT 3")
        
        return {"places": places, "hotels": hotels}

    async def get_ai_response(self, user_input: str, history: list, user_profile: dict):
        # 1. Fetch data from Graph
        context = self._get_context_from_graph(user_input)
        
        # 2. Build the System Prompt
        system_prompt = f"""
        You are Xplorer AI, an expert travel agent for Chennai.
        User Profile: {user_profile}
        
        Available Data:
        - Places: {context['places']}
        - Hotels: {context['hotels']}
        
        Instructions:
        1. If user query is vague (e.g. "I want a trip"), ASK for missing info: Dates, Group Size, Interests.
        2. If you have enough info, suggest a logical ITINERARY using the 'road_time_mins' concept.
        3. If the user mentions a specific hotel or cab, offer a MOCK BOOKING.
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
            # Ensure ai_generated_output is string for the prompt
            out = h['ai_generated_output']
            chat_history.append(AIMessage(content=str(out) if isinstance(out, dict) else out))

        chain = prompt | self.llm
        response = chain.invoke({"input": user_input, "history": chat_history})
        
        return response.content

ai_planner = TravelPlannerAI()
import os
import json
import httpx
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from langchain.tools import tool
from services.neo4j_service import query_graph # You will create this
from services.firestore_service import get_user_profile

# Initialize Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-3-flash-preview",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.3
)

# ─── TOOLS FOR THE AI ───

@tool
def search_travel_graph(query_type: str, params: dict):
    """
    Queries the Neo4j Graph. 
    query_type can be: 'find_hotels', 'find_places', 'find_cabs', 'calculate_itinerary'
    params: dictionary of filters (e.g., {"max_price": 5000, "amenity": "Pool View", "vehicle_type": "SUV", "interests": ["beach"]})
    """
    return query_graph(query_type, params)

@tool
async def check_chennai_weather(start_date: str, end_date: str):
    """
    Fetch weather forecast for Chennai. 
    Use this tool when you know the user's travel dates to check for extreme weather before planning the itinerary.
    Format dates as YYYY-MM-DD.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude=13.0827&longitude=80.2707&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&start_date={start_date}&end_date={end_date}&timezone=Asia%2FKolkata"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url)
            if resp.status_code == 200:
                return resp.json().get("daily", {})
            return {"error": "Weather forecast unavailable for these dates."}
        except Exception as e:
            return {"error": f"Failed to fetch weather: {str(e)}"}

class XplorerAI:
    def __init__(self, uid: str):
        self.uid = uid
        self.user_profile = get_user_profile(uid)
        
    async def generate_title(self, user_input: str) -> str:
        """Generates a concise title for the chat session based on the first message."""
        prompt = f"Generate a short, concise 3-5 word title for a travel conversation that starts with this message. Do not use quotes.\nUser: {user_input}"
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return response.content.strip()

    async def process_chat(self, user_input: str, history: dict):
        # 1. Prepare System Prompt with User Context and JSON formatting
        system_prompt = f"""
        You are Xplorer AI, a specialized travel agent for Chennai, India. You will be interacting with users via a VOICE interface, so keep your responses conversational, natural, and concise.
        User Profile Context:
        - Name: {self.user_profile.get('full_name')}
        - Country: {self.user_profile.get('country')}

        YOUR GOALS & RULES:
        1. UNDERSTAND USER INTENT: The user may want to generate a full travel itinerary, ONLY book a hotel, ONLY book a cab, or any combination of these.
        2. CONVERSATIONAL DATA GATHERING: DO NOT make up missing information. If you need dates, number of travelers, or interests, simply ASK the user in a friendly, conversational way.
        3. USE TOOLS: ALWAYS use the `search_travel_graph` tool to find REAL hotels, cabs, or places to suggest based on the user's intent and filters.
        4. WEATHER CHECK: Once you know the user's dates, ALWAYS use the `check_chennai_weather` tool. If the weather is highly unfavorable (e.g., heavy precipitation, extreme heat over 40°C), warn the user conversationally and ask if they still want to proceed BEFORE generating the itinerary.
        5. Once all required info is gathered and weather is deemed acceptable, provide the itinerary using the Travel Graph to suggest REAL places, hotels, and cabs. Format itineraries logically (Morning -> Afternoon -> Evening).
        
        OUTPUT FORMAT:
        You MUST respond ONLY with a valid JSON object matching this schema. The `text` field is what will be spoken to the user via Text-to-Speech, so it must be natural text.
        {{
            "text": "Your conversational reply here (e.g. 'Great! I can help with that. When are you planning to travel?')",
            "itinerary": null // or an object containing structured booking/itinerary data ONLY when the final plan is ready
        }}
        """

        # 2. Build the Message Chain
        messages = [SystemMessage(content=system_prompt)]
        
        # Add History
        past_messages = history.get('messages', [])
        for msg in past_messages:
            messages.append(HumanMessage(content=msg.get('user_input', '')))
            
            ai_out = msg.get('ai_generated_output', '')
            if isinstance(ai_out, dict):
                ai_out = json.dumps(ai_out)
            messages.append(AIMessage(content=ai_out))
            
        # Append current input
        messages.append(HumanMessage(content=user_input))

        # Bind tools to the LLM
        llm_with_tools = llm.bind_tools([search_travel_graph, check_chennai_weather])

        # 3. Call LLM asynchronously
        response = await llm_with_tools.ainvoke(messages)
        
        # If the LLM decided to use a tool, handle it
        if response.tool_calls:
            messages.append(response) # Add the AI's tool call request to history
            for tool_call in response.tool_calls:
                if tool_call["name"] == "search_travel_graph":
                    tool_result = search_travel_graph.invoke(tool_call["args"])
                    messages.append(AIMessage(content=f"[SYSTEM: Tool returned: {json.dumps(tool_result)}]"))
                elif tool_call["name"] == "check_chennai_weather":
                    tool_result = await check_chennai_weather.invoke(tool_call["args"])
                    messages.append(AIMessage(content=f"[SYSTEM: Weather tool returned: {json.dumps(tool_result)}]"))
            
            # Call the LLM again with the tool results so it can generate the final JSON response
            response = await llm_with_tools.ainvoke(messages)

        # 4. Attempt to parse JSON. If the LLM didn't return valid JSON (e.g., markdown block), strip it.
        raw_text = response.content.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3].strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3].strip()
            
        try:
            return json.loads(raw_text)
        except json.JSONDecodeError:
            # Fallback if the AI fails to generate valid JSON
            return {
                "text": raw_text,
                "itinerary": None
            }
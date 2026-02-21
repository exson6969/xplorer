import os
import json
import httpx
from datetime import datetime
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from langchain.tools import tool
from services.neo4j_service import query_graph
from services.firestore_service import get_user_profile

# Initialize Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.3
)

# ─── TOOLS FOR THE AI ───

@tool
def search_travel_graph(query_type: str, params: dict):
    """
    Queries the Neo4j Graph for Chennai travel data. 
    query_type: 'find_hotels', 'find_places', 'find_cabs', 'calculate_itinerary'
    params: filters like {"max_price": 5000, "amenity": "Pool View", "vehicle_type": "SUV", "interests": ["beach"]}
    """
    return query_graph(query_type, params)

@tool
async def check_chennai_weather(start_date: str, end_date: str):
    """
    Fetch weather forecast for Chennai using YYYY-MM-DD dates.
    Use this once travel dates are known to warn about bad weather.
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

@tool
def get_current_date() -> str:
    """
    Fetch today's current date and day of the week dynamically.
    Call this tool whenever the user mentions relative times like 'tomorrow', 'next week', 'today', etc. to calculate the exact dates.
    """
    return datetime.now().strftime("%A, %B %d, %Y")

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
        # Today's reference date for the AI
        today_str = datetime.now().strftime("%A, %B %d, %Y")

        # 1. Prepare System Prompt with strict flow logic
        system_prompt = f"""
        You are Xplorer AI, an expert travel agent for Chennai, India. 
        Current Date: {today_str}.

        USER CONTEXT:
        - Name: {self.user_profile.get('full_name')}
        - Origin: {self.user_profile.get('country')}

        CONVERSATIONAL GUIDELINES:
        - This is a VOICE interface. Be concise, natural, and friendly.
        - DO NOT repeat information the user has already provided.
        - DO NOT ask redundant questions. 
            * If the user specifies a vehicle type (e.g., "SUV"), do NOT ask how many people are traveling for the cab.
            * If the user mentions relative dates like "tomorrow" or "next Friday", calculate them based on the Current Date ({today_str}).
        - Handle missing data step-by-step. If you need dates or interests, ask for them before providing a final plan.
        - DO NOT ask for a budget.

        CORE WORKFLOW:
        1. Identify intent: Itinerary, Hotel booking, Cab booking, or a mix.
        2. Gather required info: Dates, traveler count (only if vehicle not specified), interests.
        3. Use Tools: 
            * Use `get_current_date` if you need to confirm the exact live timestamp.
            * Use `search_travel_graph` to find REAL results. 
            * Use `check_chennai_weather` once dates are known.
        4. Evaluate Weather: If tools return bad weather (heavy rain, >40°C), warn the user conversationally.
        5. Present Options: If tool results are found, describe them clearly. If NOT found, inform the user and suggest an alternative.

        RESPONSE FORMAT:
        You MUST respond ONLY with a valid JSON object:
        {{
            "text": "Your natural speech response.",
            "itinerary": null // or a structured object/list when the final plan is ready.
        }}
        """

        # 2. Build the Message Chain
        messages = [SystemMessage(content=system_prompt)]
        
        # Add past context
        past_messages = history.get('messages', [])
        for msg in past_messages:
            messages.append(HumanMessage(content=msg.get('user_input', '')))
            ai_out = msg.get('ai_generated_output', '')
            if isinstance(ai_out, dict):
                ai_out = json.dumps(ai_out)
            messages.append(AIMessage(content=ai_out))
            
        # Append current user input
        messages.append(HumanMessage(content=user_input))

        # Bind tools to the LLM
        llm_with_tools = llm.bind_tools([search_travel_graph, check_chennai_weather, get_current_date])

        # 3. Call LLM (First Turn)
        response = await llm_with_tools.ainvoke(messages)
        
        # Handle Tool Execution Loop
        while response.tool_calls:
            messages.append(response)
            for tool_call in response.tool_calls:
                if tool_call["name"] == "search_travel_graph":
                    tool_result = search_travel_graph.invoke(tool_call["args"])
                    messages.append(AIMessage(content=f"[SYSTEM: Graph tool result: {json.dumps(tool_result)}]"))
                elif tool_call["name"] == "check_chennai_weather":
                    tool_result = await check_chennai_weather.ainvoke(tool_call["args"])
                    messages.append(AIMessage(content=f"[SYSTEM: Weather tool result: {json.dumps(tool_result)}]"))
                elif tool_call["name"] == "get_current_date":
                    tool_result = get_current_date.invoke(tool_call["args"])
                    messages.append(AIMessage(content=f"[SYSTEM: Current Date result: {tool_result}]"))
            
            # Get updated AI response with tool knowledge
            response = await llm_with_tools.ainvoke(messages)

        # 4. Final JSON Extraction
        raw_text = response.content.strip()
        # Clean up markdown code blocks if present
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3].strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3].strip()
            
        try:
            return json.loads(raw_text)
        except json.JSONDecodeError:
            return {
                "text": raw_text,
                "itinerary": None
            }
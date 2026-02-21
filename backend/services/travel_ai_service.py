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

async def get_chennai_weather(start_date: str, end_date: str) -> dict:
    """Fetch weather forecast for Chennai from Open-Meteo."""
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

    async def process_chat(self, user_input: str, history: dict, submitted_data: dict = None):
        # 1. Prepare System Prompt with User Context and JSON formatting
        system_prompt = f"""
        You are Xplorer AI, a specialized travel agent for Chennai, India.
        User Profile Context:
        - Name: {self.user_profile.get('full_name')}
        - Country: {self.user_profile.get('country')}

        YOUR GOALS & RULES:
        1. UNDERSTAND USER INTENT: The user may want to generate a full travel itinerary, ONLY book a hotel, ONLY book a cab, or any combination of these. Address their specific intent.
        2. DO NOT make up or assume any missing information.
        3. DATA GATHERING: Depending on the intent, ask for the required info. 
           - For itineraries: ask for exact travel dates (`start_date`, `end_date`), number of travelers, and interests and any other data whcih will help to give them more tuned repsonse.
           - For hotels: ask for dates, number of guests, and any specific preferences (e.g., price limits, specific amenities like 'Pool View').
           - For cabs: ask for dates, number of passengers, and preferred vehicle type (e.g., SUV, Sedan).
        4. USE TOOLS: ALWAYS use the `search_travel_graph` tool to find REAL hotels, cabs, or places to suggest. If a user asks for "hotels with a pool under 5000", map that to the tool's parameters (`max_price`: 5000, `amenity`: "Pool View").
        5. FOLLOW-UP FILTERING: If you previously suggested hotels/cabs and the user replies with more filters (e.g., "Any cheaper ones?"), use the tool again with updated parameters (e.g., lower `max_price`).
        6. WEATHER CHECK: If weather data is provided in the context for an itinerary, evaluate it. If highly unfavorable (e.g., heavy precipitation, extreme heat), warn the user before proceeding.
        7. Once you have the data from your tool, present the suggestions clearly.
        
        GENERATIVE UI DIRECTIVE:
        If you need more information from the user, ask for it using structured UI elements.
        
        You MUST respond ONLY with a valid JSON object matching this schema:
        {{
            "text": "Your conversational reply here (including any tool results/suggestions)",
            "ui_elements": [
                {{
                    "type": "text|date|select|number",
                    "label": "Display label for the input",
                    "key": "The variable name (e.g., 'start_date', 'max_price', 'amenity')",
                    "suggested_values": ["Optional", "Array", "Of", "Suggestions"]
                }}
            ],
            "itinerary": null // or an object containing booking/itinerary data ONLY when all info is gathered
        }}
        """

        # 2. Build the Message Chain
        messages = [SystemMessage(content=system_prompt)]
        
        extracted_start_date = None
        extracted_end_date = None

        # Add History
        # Note: History from firestore comes as a dict with a 'messages' list
        past_messages = history.get('messages', [])
        for msg in past_messages:
            # Combine text and any submitted form data into the human message context
            human_text = msg.get('user_input', '') or ""
            sub_data = msg.get('submitted_data')
            if sub_data:
                human_text += f"\n[User Submitted Data via UI: {json.dumps(sub_data)}]"
                # Keep track of dates if they were submitted previously
                if 'start_date' in sub_data:
                    extracted_start_date = sub_data['start_date']
                if 'end_date' in sub_data:
                    extracted_end_date = sub_data['end_date']
                
            messages.append(HumanMessage(content=human_text))
            
            # The AI output might be a dict (JSON) or string. If dict, convert to json string for context.
            ai_out = msg.get('ai_generated_output', '')
            if isinstance(ai_out, dict):
                ai_out = json.dumps(ai_out)
            messages.append(AIMessage(content=ai_out))
            
        # Append current input and submitted data
        current_human_text = user_input or ""
        if submitted_data:
            current_human_text += f"\n[User Submitted Data via UI: {json.dumps(submitted_data)}]"
            if 'start_date' in submitted_data:
                extracted_start_date = submitted_data['start_date']
            if 'end_date' in submitted_data:
                extracted_end_date = submitted_data['end_date']

        # If we have both dates, fetch the weather and inject it
        if extracted_start_date and extracted_end_date:
            weather_data = await get_chennai_weather(extracted_start_date, extracted_end_date)
            current_human_text += f"\n[SYSTEM: Weather forecast for {extracted_start_date} to {extracted_end_date} in Chennai: {json.dumps(weather_data)}]"

        messages.append(HumanMessage(content=current_human_text))

        # Bind tools to the LLM
        llm_with_tools = llm.bind_tools([search_travel_graph])

        # 3. Call LLM asynchronously
        response = await llm_with_tools.ainvoke(messages)
        
        # If the LLM decided to use a tool, handle it
        if response.tool_calls:
            messages.append(response) # Add the AI's tool call request to history
            for tool_call in response.tool_calls:
                if tool_call["name"] == "search_travel_graph":
                    tool_result = search_travel_graph.invoke(tool_call["args"])
                    messages.append(AIMessage(content=f"[SYSTEM: Tool returned: {json.dumps(tool_result)}]"))
            
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
                "ui_elements": None,
                "itinerary": None
            }
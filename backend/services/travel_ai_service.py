import os
import json
import httpx
from datetime import datetime
from dotenv import load_dotenv
import asyncio

# Load environment variables
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(_BACKEND_DIR, ".env"))

from google import genai
from google.genai import types
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.tools import tool

from services.neo4j_service import query_graph
from services.firestore_service import get_user_profile

# Initialize Gemini
MODEL = "gemini-2.5-flash"
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# ─── TOOLS FOR THE AI ───

@tool
def search_travel_graph(query_type: str, params: dict):
    """
    Queries the Neo4j Graph for Chennai travel data. 
    query_type: 
        - 'find_hotels': params={'max_price', 'amenity'}
        - 'find_places': params={'interests': ['beach', 'temple']}
        - 'find_cabs': params={'vehicle_type': 'SUV'}
        - 'calculate_itinerary'
        - 'vector_search': params={'query': 'romantic dinner spot'} (Use this for semantic/vague queries)
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

# Define tools list for GenAI
TOOLS = [search_travel_graph, check_chennai_weather, get_current_date]

async def execute_tool(name: str, args: dict):
    """Router to execute the correct tool based on GenAI's function call."""
    if name == "search_travel_graph":
        return search_travel_graph.func(**args)
    elif name == "check_chennai_weather":
        return await check_chennai_weather.func(**args)
    elif name == "get_current_date":
        return get_current_date.func()
    return f"Error: Tool '{name}' not found."

class XplorerAI:
    def __init__(self, uid: str):
        self.uid = uid
        self.user_profile = get_user_profile(uid)

    async def generate_title(self, user_input: str) -> str:
        """Generates a concise title for the chat session based on the first message."""
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=f"Generate a short, concise 3-5 word title for a travel conversation that starts with this message. Do not use quotes.\nUser: {user_input}",
            config=types.GenerateContentConfig(temperature=0.5)
        )
        return response.text.strip()

    async def process_chat(self, user_input: str, history: dict, submitted_data: dict = None):
        today_str = datetime.now().strftime("%A, %B %d, %Y")

        if submitted_data:
            user_input = f"[USER SUBMITTED FORM DATA: {json.dumps(submitted_data)}]\n{user_input}"

        # System Prompt
        system_prompt = f"""
        You are Xplorer AI, an expert travel agent for Chennai, India. 
        Current Date: {today_str}.

        USER CONTEXT:
        - Name: {self.user_profile.get('full_name')}
        - Origin: {self.user_profile.get('country')}

        CONVERSATIONAL GUIDELINES:
        - Be concise, natural, and friendly.
        - DO NOT repeat information.
        - DO NOT acknowledge intent (e.g., don't say "I will check that for you"). Just use the tools immediately.
        - Handle missing data step-by-step. Ask for dates or interests before providing a final plan.
        - DO NOT ask for a budget.

        CORE WORKFLOW:
        1. Identify intent: Itinerary, Hotel booking, Cab booking, or a mix.
        2. Gather info: Dates, traveler count, interests.
        3. Use Tools: 
            * Use `search_travel_graph` with `query_type='vector_search'` for descriptive/vague requests (e.g. "romantic place", "quiet hotel").
            * Use `search_travel_graph` with 'find_places'/'find_hotels' for specific categorical filters.
            * Use `check_chennai_weather` once dates are known.
        4. Evaluation: If tools return errors or bad weather, inform the user and suggest alternatives.
        5. Response: Provide the final plan or ask for missing info.

        RESPONSE FORMAT (JSON):
        You MUST respond ONLY with a valid JSON object.
        If generating a multi-day itinerary, structure the `itinerary` key as an ARRAY of DAY OBJECTS. Each day object must have:
        - `dayNumber`: (int)
        - `theme`: (str, e.g., "Cultural Exploration")
        - `activities`: (List[str], e.g., ["Morning: Visit Fort St. George", "Afternoon: Explore Government Museum"])
        - `hotels`: (Optional[str], name of hotel or null)
        - `transport`: (Optional[str], type of transport or null)
        
        Example for itinerary key:
        "itinerary": [
            {{
                "dayNumber": 1,
                "theme": "Historical Chennai",
                "activities": [
                    "Morning: Visit Fort St. George",
                    "Afternoon: Explore Government Museum"
                ],
                "hotels": "The Leela Palace",
                "transport": "Cab"
            }},
            {{
                "dayNumber": 2,
                "theme": "Beaches and Temples",
                "activities": [
                    "Morning: Sunrise at Marina Beach",
                    "Afternoon: Visit Kapaleeshwarar Temple"
                ],
                "hotels": null,
                "transport": "Auto-rickshaw"
            }}
        ]
        """

        # Build conversation contents
        contents = []

        # Add past messages
        past_messages = history.get('messages', [])
        for msg in past_messages:
            contents.append(types.Content(
                role="user",
                parts=[types.Part.from_text(text=msg.get('user_input', ''))]
            ))
            ai_out = msg.get('ai_generated_output', '')
            if isinstance(ai_out, dict):
                ai_out = json.dumps(ai_out)
            contents.append(types.Content(
                role="model",
                parts=[types.Part.from_text(text=str(ai_out))]
            ))

        # Append current user input
        contents.append(types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_input)]
        ))

        # Configuration
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            tools=TOOLS,
            temperature=0.3,
            response_mime_type="application/json",
        )

        # Call the model
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=contents,
            config=config,
        )

        # Tool calling loop
        while response.candidates and response.candidates[0].content.parts:
            has_function_call = False
            tool_response_parts = []

            for part in response.candidates[0].content.parts:
                if part.function_call:
                    has_function_call = True
                    fn_name = part.function_call.name
                    fn_args = dict(part.function_call.args) if part.function_call.args else {}

                    print(f"🔧 Tool call: {fn_name}({fn_args})")
                    tool_result = await execute_tool(fn_name, fn_args)
                    print(f"   ↳ Result: {tool_result[:200]}...")

                    tool_response_parts.append(
                        types.Part.from_function_response(
                            name=fn_name,
                            response={"result": tool_result}
                        )
                    )

            if not has_function_call:
                break

            # Add the model's function call message and our tool responses
            contents.append(response.candidates[0].content)
            contents.append(types.Content(
                role="user",
                parts=tool_response_parts
            ))
            
            # Add a delay to prevent hitting rate limits
            await asyncio.sleep(1) 

            # Get updated response
            response = await client.aio.models.generate_content(
                model=MODEL,
                contents=contents,
                config=config,
            )

        # Extract final text
        raw_text = response.text.strip() if response.text else '{"text": "I encountered an issue. Please try again.", "itinerary": null}'

        # Clean up markdown code blocks
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
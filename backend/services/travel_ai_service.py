import os
import json
import httpx
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(_BACKEND_DIR, ".env"))

from google import genai
from google.genai import types

from services.neo4j_service import query_graph
from services.firestore_service import get_user_profile

# Initialize the new GenAI client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
MODEL = "gemini-2.5-flash"


# ─── TOOL FUNCTION DECLARATIONS ───

search_travel_graph_decl = types.FunctionDeclaration(
    name="search_travel_graph",
    description="Queries the Neo4j Graph for Chennai travel data. Use this to find real hotels, places, and transport options.",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "query_type": types.Schema(
                type=types.Type.STRING,
                description="Type of query: 'find_hotels', 'find_places', 'find_cabs', 'calculate_itinerary'"
            ),
            "params": types.Schema(
                type=types.Type.OBJECT,
                description="Filters like {\"max_price\": 5000, \"amenity\": \"Pool View\", \"vehicle_type\": \"SUV\", \"interests\": [\"beach\"]}"
            ),
        },
        required=["query_type", "params"],
    ),
)

check_chennai_weather_decl = types.FunctionDeclaration(
    name="check_chennai_weather",
    description="Fetch weather forecast for Chennai using YYYY-MM-DD dates. Use this once travel dates are known to warn about bad weather.",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "start_date": types.Schema(type=types.Type.STRING, description="Start date in YYYY-MM-DD format"),
            "end_date": types.Schema(type=types.Type.STRING, description="End date in YYYY-MM-DD format"),
        },
        required=["start_date", "end_date"],
    ),
)

get_current_date_decl = types.FunctionDeclaration(
    name="get_current_date",
    description="Fetch today's current date and day of the week. Call this whenever the user mentions relative times like 'tomorrow', 'next week', 'today', etc.",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={},
    ),
)

TOOLS = types.Tool(function_declarations=[
    search_travel_graph_decl,
    check_chennai_weather_decl,
    get_current_date_decl,
])


# ─── TOOL EXECUTION ───

async def execute_tool(name: str, args: dict) -> str:
    """Execute a tool by name and return the result as a string."""
    if name == "search_travel_graph":
        result = query_graph(args.get("query_type", ""), args.get("params", {}))
    elif name == "check_chennai_weather":
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude=13.0827&longitude=80.2707"
            f"&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum"
            f"&start_date={args['start_date']}&end_date={args['end_date']}"
            f"&timezone=Asia%2FKolkata"
        )
        async with httpx.AsyncClient() as http_client:
            try:
                resp = await http_client.get(url)
                result = resp.json().get("daily", {}) if resp.status_code == 200 else {"error": "Weather unavailable"}
            except Exception as e:
                result = {"error": f"Failed to fetch weather: {str(e)}"}
    elif name == "get_current_date":
        result = datetime.now().strftime("%A, %B %d, %Y")
    else:
        result = f"Error: Unknown tool '{name}'"

    return json.dumps(result) if isinstance(result, (dict, list)) else str(result)


class XplorerAI:
    def __init__(self, uid: str):
        self.uid = uid
        self.user_profile = get_user_profile(uid)

    async def generate_title(self, user_input: str) -> str:
        """Generates a concise title for the chat session based on the first message."""
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=f"Generate a short, concise 3-5 word title for a travel conversation that starts with this message. Do not use quotes.\nUser: {user_input}",
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
            tools=[TOOLS],
            temperature=0.3,
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
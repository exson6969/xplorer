import os
import json
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
    params: dictionary of filters (e.g., {"category": "beach", "budget": "luxury"})
    """
    # Logic to call your Neo4j logic built in previous steps
    return query_graph(query_type, params)

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
        You are Xplorer AI, a specialized travel agent for Chennai, India.
        User Profile Context:
        - Name: {self.user_profile.get('full_name')}
        - Interests: {", ".join(self.user_profile.get('interests', []))}
        - Budget: {self.user_profile.get('budget')}
        - Travel Style: {", ".join(self.user_profile.get('travel_style', []))}

        YOUR GOALS:
        1. Understand the user's travel intent.
        2. Use the Travel Graph to suggest REAL places, hotels, and cabs from our database.
        3. Format itineraries logically: Morning -> Afternoon -> Evening.
        
        GENERATIVE UI DIRECTIVE:
        If you need more information from the user (e.g., travel dates, number of people, preferred areas) to build an itinerary, you MUST ask for it using structured UI elements instead of just plain text.
        
        You MUST respond ONLY with a valid JSON object matching this schema:
        {{
            "text": "Your conversational reply here",
            "ui_elements": [
                {{
                    "type": "text|date|select|number",
                    "label": "Display label for the input",
                    "key": "The variable name",
                    "suggested_values": ["Optional", "Array", "Of", "Suggestions"]
                }}
            ],
            "itinerary": null // or an object containing booking/itinerary data
        }}
        """

        # 2. Build the Message Chain
        messages = [SystemMessage(content=system_prompt)]
        
        # Add History
        # Note: History from firestore comes as a dict with a 'messages' list
        past_messages = history.get('messages', [])
        for msg in past_messages:
            messages.append(HumanMessage(content=msg.get('user_input', '')))
            
            # The AI output might be a dict (JSON) or string. If dict, convert to json string for context.
            ai_out = msg.get('ai_generated_output', '')
            if isinstance(ai_out, dict):
                ai_out = json.dumps(ai_out)
            messages.append(AIMessage(content=ai_out))
            
        messages.append(HumanMessage(content=user_input))

        # 3. Call LLM asynchronously
        response = await llm.ainvoke(messages)
        
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
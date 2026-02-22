from fastapi import APIRouter, Depends, status, HTTPException
from typing import List, Dict, Any

from middleware.auth_middleware import get_current_user
from models.user import UserProfileResponse
from models.chat import (
    StartChatRequest,
    ConversationStartResponse,
    ChatRequest,
    MessageResponse,
    ConversationListItem,
    ConversationResponse,
)
from models.booking import (
    HotelBookingRequest,
    HotelBookingResponse,
    TransportBookingRequest,
    TransportBookingResponse,
)
from services.firestore_service import (
    get_user_profile,
    update_user_profile,
    create_conversation,
    add_message,
    get_conversation,
    list_conversations,
    delete_conversation,
    save_hotel_booking,
    get_hotel_bookings,
    save_transport_booking,
    get_transport_bookings
)
from services.travel_ai_service import XplorerAI  # LangChain + Gemini logic

router = APIRouter(prefix="/user", tags=["Xplorer AI User Interface"])

# ─── 1. USER PROFILE ─────────────────────────────────────────────────────────

@router.get("/profile", response_model=UserProfileResponse)
def get_my_profile(user: dict = Depends(get_current_user)):
    """Fetch the full profile and travel preferences of the authenticated user."""
    profile = get_user_profile(user["uid"])
    return UserProfileResponse(**profile)

@router.put("/profile")
def update_my_preferences(updates: Dict[str, Any], user: dict = Depends(get_current_user)):
    """Update travel style, interests, or budget preferences."""
    ALLOWED = {"full_name", "country", "travel_style", "interests"}
    filtered = {k: v for k, v in updates.items() if k in ALLOWED}
    update_user_profile(user["uid"], filtered)
    return {"message": "Preferences updated."}

# ─── 2. AI SMART CHAT (The Core Agent) ───────────────────────────────────────

@router.post("/chat/new", response_model=ConversationStartResponse, status_code=status.HTTP_201_CREATED)
async def start_new_travel_consultation(
    payload: StartChatRequest, 
    user: dict = Depends(get_current_user)
):
    """
    Initializes a new AI session with the first message.
    Generates a dynamic title, creates the session, and returns the first AI response.
    """
    uid = user["uid"]
    agent = XplorerAI(uid)
    
    try:
        # Generate dynamic title based on first input
        title = await agent.generate_title(payload.user_input)
    except Exception as e:
        print(f"❌ AI title generation failed: {e}")
        title = "New Trip Plan"
    
    # Create the conversation in Firestore
    session = create_conversation(uid, title)
    convo_id = session["convo_id"]
    
    try:
        # Process the first message
        ai_response = await agent.process_chat(
            user_input=payload.user_input,
            history={"messages": []}, # Empty history for a new chat
            submitted_data=payload.submitted_data
        )
    except Exception as e:
        print(f"❌ AI chat failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service is temporarily unavailable. Please try again in a minute. Error: {type(e).__name__}"
        )
    
    # Save the turn to Firestore
    saved_msg = add_message(
        uid=uid,
        convo_id=convo_id,
        user_input=payload.user_input,
        ai_generated_output=ai_response, # Contains text/itinerary data
        submitted_data=payload.submitted_data
    )
    
    return ConversationStartResponse(
        convo_id=convo_id,
        conversation_title=title,
        created_at=session["created_at"],
        first_message=MessageResponse(**saved_msg)
    )

@router.post("/chat/{session_id}/message", response_model=MessageResponse)
async def send_message_to_agent(
    session_id: str,
    payload: ChatRequest,
    user: dict = Depends(get_current_user)
):
    """
    The main AI logic hub:
    1. Retrieves user preferences (Interests).
    2. Pulls chat history.
    3. Uses GenAI to query Neo4j (Graph) and Gemini (LLM).
    4. Handles missing info by asking the user questions.
    """
    uid = user["uid"]
    
    # 1. Get History & Context
    history = get_conversation(uid, session_id)
    
    # 2. Initialize Xplorer AI Agent
    agent = XplorerAI(uid)
    
    try:
        # 3. Generate Intelligent Response (Gemini + Neo4j)
        ai_response = await agent.process_chat(
            user_input=payload.user_input,
            history=history,
            submitted_data=payload.submitted_data
        )
    except Exception as e:
        print(f"❌ AI chat failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service is temporarily unavailable. Please try again in a minute. Error: {type(e).__name__}"
        )
    
    # 4. Save the turn to Firestore
    saved_msg = add_message(
        uid=uid,
        convo_id=session_id,
        user_input=payload.user_input,
        ai_generated_output=ai_response, # Contains text or structured itinerary
        submitted_data=payload.submitted_data
    )
    
    return MessageResponse(**saved_msg)

# ─── 3. TRIP HISTORY & SESSIONS ─────────────────────────────────────────────

@router.get("/chat/sessions", response_model=List[ConversationListItem])
def list_my_trip_consultations(user: dict = Depends(get_current_user)):
    """Returns a list of all past AI chat sessions."""
    return list_conversations(user["uid"])

@router.get("/chat/sessions/{session_id}", response_model=ConversationResponse)
def get_full_chat_details(session_id: str, user: dict = Depends(get_current_user)):
    """Retrieves all messages and metadata for a specific session."""
    data = get_conversation(user["uid"], session_id)
    return ConversationResponse(**data)

@router.delete("/chat/sessions/{session_id}")
def delete_trip_consultation(session_id: str, user: dict = Depends(get_current_user)):
    """Permanently deletes a chat session."""
    delete_conversation(user["uid"], session_id)
    return {"message": "Session deleted."}

# ─── 4. MOCK BOOKINGS (One-Click Execution) ──────────────────────────────────

@router.post("/bookings/hotels", response_model=HotelBookingResponse)
def book_suggested_hotel(payload: HotelBookingRequest, user: dict = Depends(get_current_user)):
    """Confirms a hotel booking suggested by the AI."""
    saved = save_hotel_booking(user["uid"], payload.model_dump())
    return HotelBookingResponse(**saved)

@router.post("/bookings/transport", response_model=TransportBookingResponse)
def book_suggested_transport(payload: TransportBookingRequest, user: dict = Depends(get_current_user)):
    """Confirms a cab/bike booking suggested by the AI."""
    saved = save_transport_booking(user["uid"], payload.model_dump())
    return TransportBookingResponse(**saved)

@router.get("/bookings/all")
def get_all_my_itinerary_bookings(user: dict = Depends(get_current_user)):
    """Fetches all confirmed hotels and transport for the user."""
    uid = user["uid"]
    return {
        "hotels": get_hotel_bookings(uid),
        "transport": get_transport_bookings(uid)
    }

# ─── 5. TRIP PLANNER (Route Optimization) ────────────────────────────────────

from pydantic import BaseModel
from services.neo4j_service import calculate_optimal_route

class TripPlanRequest(BaseModel):
    place_names: List[str]
    hotel_name: str = None

@router.post("/trip/plan")
def plan_optimized_trip(
    payload: TripPlanRequest,
    user: dict = Depends(get_current_user)
):
    """
    Given a list of place names from a confirmed itinerary,
    compute the optimal visiting route using the Neo4j graph
    and return full trip details (places, hotels, transport, route).
    """
    result = calculate_optimal_route(payload.place_names, payload.hotel_name)
    return result

@router.get("/maps/key")
def get_maps_api_key(user: dict = Depends(get_current_user)):
    """Returns the Google Maps API key for the frontend embed."""
    import os
    return {"key": os.getenv("GOOGLE_MAPS_API_KEY", "")}
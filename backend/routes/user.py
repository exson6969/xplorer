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
    
    # Generate dynamic title based on first input
    title = await agent.generate_title(payload.user_input)
    
    # Create the conversation in Firestore
    session = create_conversation(uid, title)
    convo_id = session["convo_id"]
    
    # Process the first message
    ai_response = await agent.process_chat(
        user_input=payload.user_input,
        history={"messages": []} # Empty history for a new chat
    )
    
    # Save the turn to Firestore
    saved_msg = add_message(
        uid=uid,
        convo_id=convo_id,
        user_input=payload.user_input,
        ai_generated_output=ai_response # Contains text/itinerary data
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
    3. Uses LangChain to query Neo4j (Graph) and Gemini (LLM).
    4. Handles missing info by asking the user questions.
    """
    uid = user["uid"]
    
    # 1. Get History & Context
    history = get_conversation(uid, session_id)
    
    # 2. Initialize Xplorer AI Agent
    agent = XplorerAI(uid)
    
    # 3. Generate Intelligent Response (LangChain + Gemini + Neo4j)
    ai_response = await agent.process_chat(
        user_input=payload.user_input,
        history=history
    )
    
    # 4. Save the turn to Firestore
    saved_msg = add_message(
        uid=uid,
        convo_id=session_id,
        user_input=payload.user_input,
        ai_generated_output=ai_response # Contains text or structured itinerary
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
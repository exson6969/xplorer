"""
routes/user.py
--------------
Protected endpoints (require valid Firebase ID token in Authorization header):

Profile:
  GET  /user/profile                               → Get current user's profile
  PUT  /user/profile                               → Update profile fields

Conversations:
  POST /user/conversations/start                   → Start a new conversation
  GET  /user/conversations                         → List all conversations
  GET  /user/conversations/{convo_id}              → Get full conversation + messages
  POST /user/conversations/{convo_id}/messages     → Add a message
  DELETE /user/conversations/{convo_id}            → Delete a conversation

Hotel Bookings:
  POST   /user/hotel-bookings                      → Save a hotel booking
  GET    /user/hotel-bookings                      → List all hotel bookings
  DELETE /user/hotel-bookings/{booking_id}         → Delete a hotel booking

Transport Bookings:
  POST   /user/transport-bookings                  → Save a transport booking
  GET    /user/transport-bookings                  → List all transport bookings
  DELETE /user/transport-bookings/{booking_id}     → Delete a transport booking
"""

from fastapi import APIRouter, Depends, status
from models.user import (
    UserProfileResponse,
    ConversationStartRequest,
    ConversationStartResponse,
    MessageRequest,
    MessageResponse,
    ConversationResponse,
    ConversationListItem,
    HotelBookingRequest,
    HotelBookingResponse,
    TransportBookingRequest,
    TransportBookingResponse,
)
from middleware.auth_middleware import get_current_user
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
    delete_hotel_booking,
    save_transport_booking,
    get_transport_bookings,
    delete_transport_booking,
)

router = APIRouter(prefix="/user", tags=["User"])


# ─── Profile ──────────────────────────────────────────────────────────────────

@router.get(
    "/profile",
    response_model=UserProfileResponse,
    summary="Get current user profile",
    description="Returns the authenticated user's full profile stored in Firestore.",
)
def get_profile(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    profile = get_user_profile(uid)
    return UserProfileResponse(**profile)


@router.put(
    "/profile",
    status_code=status.HTTP_200_OK,
    summary="Update profile fields",
    description="Partially update profile fields. Only allowed fields will be changed.",
)
def update_profile(
    updates: dict,
    current_user: dict = Depends(get_current_user),
):
    """
    Pass only the fields you want to update.
    Example body: {"country": "India", "budget": "luxury"}
    """
    ALLOWED_FIELDS = {"full_name", "country", "travel_style", "interests", "budget"}
    filtered = {k: v for k, v in updates.items() if k in ALLOWED_FIELDS}

    update_user_profile(current_user["uid"], filtered)
    return {"message": "Profile updated successfully."}


# ─── Conversations ─────────────────────────────────────────────────────────────

@router.post(
    "/conversations/start",
    response_model=ConversationStartResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a new conversation",
    description=(
        "Creates a new conversation thread. Returns a convo_id which must be used "
        "for all subsequent messages in this session. "
        "New users with no prior conversations will have an empty list — that is normal."
    ),
)
def start_conversation(
    payload: ConversationStartRequest,
    current_user: dict = Depends(get_current_user),
):
    uid = current_user["uid"]
    result = create_conversation(uid, payload.conversation_title)
    return ConversationStartResponse(**result)


@router.get(
    "/conversations",
    response_model=list[ConversationListItem],
    summary="List all conversations",
    description=(
        "Returns all conversations for the user, newest first. "
        "Returns an empty list [] for users who haven't started any chat yet — not an error."
    ),
)
def get_conversations(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    convos = list_conversations(uid)
    return [ConversationListItem(**c) for c in convos]


@router.get(
    "/conversations/{convo_id}",
    response_model=ConversationResponse,
    summary="Get a full conversation with all messages",
    description="Returns the conversation metadata and all messages ordered by time.",
)
def get_full_conversation(
    convo_id: str,
    current_user: dict = Depends(get_current_user),
):
    uid = current_user["uid"]
    convo = get_conversation(uid, convo_id)
    messages = [MessageResponse(**m) for m in convo["messages"]]
    return ConversationResponse(
        convo_id=convo["convo_id"],
        conversation_title=convo["conversation_title"],
        created_at=convo["created_at"],
        updated_at=convo["updated_at"],
        messages=messages,
    )


@router.post(
    "/conversations/{convo_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a message to a conversation",
    description=(
        "Saves one chat turn (user_input + ai_generated_output) into the conversation. "
        "The convo_id must already exist — call /conversations/start first."
    ),
)
def post_message(
    convo_id: str,
    payload: MessageRequest,
    current_user: dict = Depends(get_current_user),
):
    uid = current_user["uid"]
    saved = add_message(
        uid=uid,
        convo_id=convo_id,
        user_input=payload.user_input,
        ai_generated_output=payload.ai_generated_output,
    )
    return MessageResponse(**saved)


@router.delete(
    "/conversations/{convo_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a conversation",
    description="Permanently deletes a conversation and all its messages.",
)
def remove_conversation(
    convo_id: str,
    current_user: dict = Depends(get_current_user),
):
    uid = current_user["uid"]
    delete_conversation(uid, convo_id)
    return {"message": f"Conversation '{convo_id}' deleted successfully."}


# ─── Hotel Bookings ────────────────────────────────────────────────────────────

@router.post(
    "/hotel-bookings",
    response_model=HotelBookingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a hotel booking",
    description="Records a hotel stay for the user. Used for history and personalization.",
)
def add_hotel_booking(
    payload: HotelBookingRequest,
    current_user: dict = Depends(get_current_user),
):
    uid = current_user["uid"]
    saved = save_hotel_booking(uid, payload.model_dump())
    return HotelBookingResponse(**saved)


@router.get(
    "/hotel-bookings",
    response_model=list[HotelBookingResponse],
    summary="List all hotel bookings",
    description="Returns all hotel bookings for the user, newest first. Returns [] if none.",
)
def list_hotel_bookings(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    return [HotelBookingResponse(**b) for b in get_hotel_bookings(uid)]


@router.delete(
    "/hotel-bookings/{booking_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a hotel booking",
)
def remove_hotel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
):
    delete_hotel_booking(current_user["uid"], booking_id)
    return {"message": f"Hotel booking '{booking_id}' deleted successfully."}


# ─── Transport Bookings ────────────────────────────────────────────────────────

@router.post(
    "/transport-bookings",
    response_model=TransportBookingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a transport booking",
    description="Records a transport use for the user. Used for history and personalization.",
)
def add_transport_booking(
    payload: TransportBookingRequest,
    current_user: dict = Depends(get_current_user),
):
    uid = current_user["uid"]
    saved = save_transport_booking(uid, payload.model_dump())
    return TransportBookingResponse(**saved)


@router.get(
    "/transport-bookings",
    response_model=list[TransportBookingResponse],
    summary="List all transport bookings",
    description="Returns all transport bookings for the user, newest first. Returns [] if none.",
)
def list_transport_bookings(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    return [TransportBookingResponse(**b) for b in get_transport_bookings(uid)]


@router.delete(
    "/transport-bookings/{booking_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a transport booking",
)
def remove_transport_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
):
    delete_transport_booking(current_user["uid"], booking_id)
    return {"message": f"Transport booking '{booking_id}' deleted successfully."}

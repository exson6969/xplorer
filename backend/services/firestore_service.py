"""
services/firestore_service.py
------------------------------
All Firestore read/write operations.
Strictly separated from auth logic — swap the DB layer here without touching routes.

Firestore structure:
  users/{uid}/
    └── (profile fields)
    └── conversations/{convo_id}/
          ├── conversation_title   (string)
          ├── created_at           (ISO datetime)
          ├── updated_at           (ISO datetime — refreshed on each new message)
          ├── message_count        (int — incremented on each new message)
          └── messages/            (subcollection)
                └── {message_id}/
                      ├── user_input
                      ├── ai_generated_output
                      ├── timestamp   (ISO datetime)
                      └── date        (YYYY-MM-DD)
"""

from datetime import datetime, timezone
from typing import Union
from fastapi import HTTPException, status
from config.firebase import get_firestore


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _today_date() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


# ─── User Profile ──────────────────────────────────────────────────────────────

def create_user_profile(uid: str, profile_data: dict) -> None:
    """
    Save a new user's profile to Firestore: users/{uid}
    Called right after Firebase Auth user creation.
    """
    db = get_firestore()
    profile_data["created_at"] = _now_iso()
    profile_data["uid"] = uid

    try:
        db.collection("users").document(uid).set(profile_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save user profile: {str(e)}",
        )


def get_user_profile(uid: str) -> dict:
    """
    Retrieve a user's profile from Firestore by UID.
    """
    db = get_firestore()
    doc = db.collection("users").document(uid).get()

    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found.",
        )
    return doc.to_dict()


def update_user_profile(uid: str, updates: dict) -> None:
    """
    Partially update a user's profile fields.
    """
    db = get_firestore()
    updates["updated_at"] = _now_iso()

    try:
        db.collection("users").document(uid).update(updates)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}",
        )


def delete_user_data(uid: str) -> None:
    """
    Delete all Firestore data for a user (profile + all conversations).
    Used during rollback or account deletion.
    """
    db = get_firestore()
    try:
        # Delete all messages inside each conversation, then the conversation doc
        convos = db.collection("users").document(uid).collection("conversations").stream()
        for convo in convos:
            msgs = convo.reference.collection("messages").stream()
            for msg in msgs:
                msg.reference.delete()
            convo.reference.delete()

        # Delete profile doc
        db.collection("users").document(uid).delete()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user data: {str(e)}",
        )


# ─── Conversations ─────────────────────────────────────────────────────────────

def create_conversation(uid: str, conversation_title: str = None) -> dict:
    """
    Create a new conversation thread for a user.
    Returns the convo_id and metadata.

    If no title is given, auto-names it with date/time:
      e.g. "Chat on 21 Feb 2026, 09:15 PM"
    """
    db = get_firestore()
    now = _now_iso()

    if not conversation_title:
        friendly_time = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")
        conversation_title = f"Chat on {friendly_time}"

    convo_data = {
        "conversation_title": conversation_title,
        "created_at": now,
        "updated_at": now,
        "message_count": 0,
    }

    try:
        ref = db.collection("users").document(uid).collection("conversations").add(convo_data)
        convo_id = ref[1].id
        return {
            "convo_id": convo_id,
            "conversation_title": conversation_title,
            "created_at": now,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}",
        )


def add_message(uid: str, convo_id: str, user_input: str, ai_generated_output: Union[dict, str], submitted_data: dict = None) -> dict:
    """
    Add a message (user_input + ai_generated_output) to an existing conversation.
    Also updates the conversation's updated_at and increments message_count.
    Returns the saved message dict with message_id.
    """
    db = get_firestore()
    now = _now_iso()
    today = _today_date()

    convo_ref = db.collection("users").document(uid).collection("conversations").document(convo_id)

    # Verify conversation exists
    convo_doc = convo_ref.get()
    if not convo_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{convo_id}' not found. Start a new conversation first.",
        )

    message_data = {
        "user_input": user_input,
        "ai_generated_output": ai_generated_output,
        "submitted_data": submitted_data,
        "timestamp": now,
        "date": today,
    }

    try:
        msg_ref = convo_ref.collection("messages").add(message_data)
        message_id = msg_ref[1].id

        # Update conversation metadata
        existing = convo_doc.to_dict()
        convo_ref.update({
            "updated_at": now,
            "message_count": existing.get("message_count", 0) + 1,
        })

        return {
            "message_id": message_id,
            **message_data,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add message: {str(e)}",
        )


def get_conversation(uid: str, convo_id: str) -> dict:
    """
    Get a full conversation with all its messages, ordered by timestamp.
    """
    db = get_firestore()

    convo_ref = db.collection("users").document(uid).collection("conversations").document(convo_id)
    convo_doc = convo_ref.get()

    if not convo_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{convo_id}' not found.",
        )

    convo_data = convo_doc.to_dict()

    try:
        msgs = convo_ref.collection("messages").order_by("timestamp").stream()
        messages = []
        for msg in msgs:
            m = msg.to_dict()
            m["message_id"] = msg.id
            messages.append(m)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve messages: {str(e)}",
        )

    return {
        "convo_id": convo_id,
        "conversation_title": convo_data.get("conversation_title", ""),
        "created_at": convo_data.get("created_at", ""),
        "updated_at": convo_data.get("updated_at", ""),
        "messages": messages,
    }


def list_conversations(uid: str) -> list:
    """
    List all conversations for a user (summary only — no messages).
    Returns empty list [] if the user has never started a conversation.
    Ordered by most recently updated first.
    """
    db = get_firestore()

    try:
        docs = (
            db.collection("users")
            .document(uid)
            .collection("conversations")
            .order_by("updated_at", direction="DESCENDING")
            .stream()
        )
        result = []
        for doc in docs:
            d = doc.to_dict()
            result.append({
                "convo_id": doc.id,
                "conversation_title": d.get("conversation_title", ""),
                "created_at": d.get("created_at", ""),
                "updated_at": d.get("updated_at", ""),
                "message_count": d.get("message_count", 0),
            })
        return result  # Will be [] for new users — perfectly normal
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list conversations: {str(e)}",
        )


def delete_conversation(uid: str, convo_id: str) -> None:
    """
    Delete a conversation and all its messages.
    """
    db = get_firestore()
    convo_ref = db.collection("users").document(uid).collection("conversations").document(convo_id)

    if not convo_ref.get().exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{convo_id}' not found.",
        )

    try:
        # Delete all messages first
        msgs = convo_ref.collection("messages").stream()
        for msg in msgs:
            msg.reference.delete()
        # Delete conversation doc
        convo_ref.delete()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}",
        )


# ─── Hotel Bookings ────────────────────────────────────────────────────────────

def save_hotel_booking(uid: str, data: dict) -> dict:
    """
    Save a hotel booking under users/{uid}/hotel_bookings/{auto_id}.
    Returns the saved doc with booking_id and booked_at.
    """
    db = get_firestore()
    data["booked_at"] = _now_iso()

    try:
        ref = db.collection("users").document(uid).collection("hotel_bookings").add(data)
        return {"booking_id": ref[1].id, **data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save hotel booking: {str(e)}",
        )


def get_hotel_bookings(uid: str) -> list:
    """
    List all hotel bookings for a user, newest first.
    Returns [] if none exist.
    """
    db = get_firestore()
    try:
        docs = (
            db.collection("users").document(uid)
            .collection("hotel_bookings")
            .order_by("booked_at", direction="DESCENDING")
            .stream()
        )
        return [{**doc.to_dict(), "booking_id": doc.id} for doc in docs]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch hotel bookings: {str(e)}",
        )


def delete_hotel_booking(uid: str, booking_id: str) -> None:
    """Delete a single hotel booking."""
    db = get_firestore()
    ref = db.collection("users").document(uid).collection("hotel_bookings").document(booking_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Hotel booking not found.")
    ref.delete()


# ─── Transport Bookings ────────────────────────────────────────────────────────

def save_transport_booking(uid: str, data: dict) -> dict:
    """
    Save a transport booking under users/{uid}/transport_bookings/{auto_id}.
    Returns the saved doc with booking_id and booked_at.
    """
    db = get_firestore()
    data["booked_at"] = _now_iso()

    try:
        ref = db.collection("users").document(uid).collection("transport_bookings").add(data)
        return {"booking_id": ref[1].id, **data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save transport booking: {str(e)}",
        )


def get_transport_bookings(uid: str) -> list:
    """
    List all transport bookings for a user, newest first.
    Returns [] if none exist.
    """
    db = get_firestore()
    try:
        docs = (
            db.collection("users").document(uid)
            .collection("transport_bookings")
            .order_by("booked_at", direction="DESCENDING")
            .stream()
        )
        return [{**doc.to_dict(), "booking_id": doc.id} for doc in docs]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch transport bookings: {str(e)}",
        )


def delete_transport_booking(uid: str, booking_id: str) -> None:
    """Delete a single transport booking."""
    db = get_firestore()
    ref = db.collection("users").document(uid).collection("transport_bookings").document(booking_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Transport booking not found.")
    ref.delete()


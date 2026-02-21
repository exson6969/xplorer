"""
models/user.py
--------------
Pydantic models for request/response validation.
Keeping models here makes it easy to update fields without touching business logic.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Any, List, Optional, Literal, Union
from datetime import datetime


# ─── Auth Models ──────────────────────────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    country: str = Field(..., min_length=2)

    # Travel style preferences
    travel_style: List[Literal["solo", "couple", "family", "friends", "business"]] = Field(
        ..., min_length=1, description="Select how you usually travel"
    )

    # Interests (top 3)
    interests: List[Literal[
        "art", "food", "history", "nature", "shopping",
        "adventure", "nightlife", "photography"
    ]] = Field(..., min_length=1, max_length=3, description="Your top 3 interests")

    # Budget preference
    budget: Literal["budget", "moderate", "luxury"]


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


# ─── Response Models ───────────────────────────────────────────────────────────

class UserProfileResponse(BaseModel):
    uid: str
    full_name: str
    email: str
    country: str
    travel_style: List[str]
    interests: List[str]
    budget: str
    created_at: Optional[str] = None


class AuthTokenResponse(BaseModel):
    id_token: str
    refresh_token: str
    expires_in: str
    uid: str
    email: str
    full_name: str


# ─── Conversation Models ───────────────────────────────────────────────────────

class ConversationStartRequest(BaseModel):
    """
    Called when the user begins a new conversation thread.
    Title is optional — if not given, auto-named from timestamp.
    """
    conversation_title: Optional[str] = Field(
        default=None,
        description="Optional title for this conversation. Auto-generated if not provided."
    )


class ConversationStartResponse(BaseModel):
    """Returned after creating a new conversation — gives the frontend the convo_id to use."""
    convo_id: str
    conversation_title: str
    created_at: str


class MessageRequest(BaseModel):
    """
    A single chat turn — what the user said and what the AI responded.
    ai_generated_output accepts either:
      - A plain string (e.g. simple text reply)
      - A dict/list (e.g. structured JSON with itinerary, hotels, budget, etc.)
    """
    user_input: str = Field(..., description="What the user typed or asked")
    ai_generated_output: Union[dict, list, str] = Field(
        ...,
        description="AI response — can be plain text OR a structured JSON object/array"
    )


class MessageResponse(BaseModel):
    """Represents one message turn stored in Firestore."""
    message_id: str
    user_input: str
    ai_generated_output: Union[dict, list, str]  # native object or plain text
    timestamp: str   # ISO datetime string
    date: str        # YYYY-MM-DD for easy filtering/display


class ConversationResponse(BaseModel):
    """Full conversation with all its messages."""
    convo_id: str
    conversation_title: str
    created_at: str
    updated_at: str
    messages: List[MessageResponse]


class ConversationListItem(BaseModel):
    """Summary of a conversation shown in the sidebar/history list."""
    convo_id: str
    conversation_title: str
    created_at: str
    updated_at: str
    message_count: int

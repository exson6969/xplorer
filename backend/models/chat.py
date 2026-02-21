from pydantic import BaseModel, Field
from typing import List, Optional, Union, Dict, Any

class StartChatRequest(BaseModel):
    """
    Called when the user begins a new conversation thread with their first message.
    The backend will auto-generate the title.
    """
    user_input: str = Field(..., description="The first text message from the user to start the chat.")
    submitted_data: Optional[Dict[str, Any]] = None
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "user_input": "I want to plan a 3-day trip to Chennai."
            }
        }
    }

class ConversationStartResponse(BaseModel):
    """Returned after creating a new conversation and processing the first message."""
    convo_id: str
    conversation_title: str
    created_at: str
    first_message: "MessageResponse"

class MessageRequest(BaseModel):
    """
    A single chat turn — what the user said and what the AI responded.
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
    ai_generated_output: Union[Dict[str, Any], str]  # native object or plain text
    submitted_data: Optional[Dict[str, Any]] = None
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

class ChatRequest(BaseModel):
    user_input: str = Field(..., description="The text message from the user.")
    submitted_data: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    """The structured response back to the user"""
    convo_id: str
    ai_response: Union[Dict[str, Any], str]
    suggested_actions: Optional[List[dict]] = None

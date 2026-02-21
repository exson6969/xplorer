from pydantic import BaseModel, Field
from typing import List, Optional, Union, Dict, Any

class UIElement(BaseModel):
    """Represents an interactive element for Generative UI."""
    type: str = Field(..., description="The type of input: 'text', 'date', 'select', 'button'")
    label: str = Field(..., description="The label for the input field")
    key: str = Field(..., description="The state key to map this input to on the frontend")
    suggested_values: Optional[List[str]] = Field(default=None, description="Suggested quick-pick values")

class AIStructuredOutput(BaseModel):
    """The structured JSON response from the AI."""
    text: str = Field(..., description="The conversational text response from the AI.")
    ui_elements: Optional[List[UIElement]] = Field(default=None, description="Interactive UI elements to gather missing info.")
    itinerary: Optional[Union[dict, list]] = Field(default=None, description="Structured itinerary or booking data.")

class StartChatRequest(BaseModel):
    """
    Called when the user begins a new conversation thread with their first message.
    The backend will auto-generate the title.
    """
    user_input: str = Field(..., description="The first message from the user to start the chat.")

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
    """The only thing the frontend needs to send"""
    user_input: str

class ChatResponse(BaseModel):
    """The structured response back to the user"""
    convo_id: str
    ai_response: Union[Dict[str, Any], str]
    suggested_actions: Optional[List[dict]] = None

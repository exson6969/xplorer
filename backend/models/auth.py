from pydantic import BaseModel, EmailStr, Field
from typing import List, Literal

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


class AuthTokenResponse(BaseModel):
    id_token: str
    refresh_token: str
    expires_in: str
    uid: str
    email: str
    full_name: str

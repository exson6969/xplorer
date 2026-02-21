from pydantic import BaseModel
from typing import List, Optional

class UserProfileResponse(BaseModel):
    uid: str
    full_name: str
    email: str
    country: str
    travel_style: List[str]
    interests: List[str]
    budget: str
    created_at: Optional[str] = None

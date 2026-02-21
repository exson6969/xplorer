from pydantic import BaseModel
from typing import List, Optional

class UserProfileResponse(BaseModel):
    uid: str
    full_name: str
    email: str
    country: str
    travel_style: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    created_at: Optional[str] = None

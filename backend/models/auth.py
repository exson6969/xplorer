from pydantic import BaseModel, EmailStr, Field

class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    country: str = Field(..., min_length=2)


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

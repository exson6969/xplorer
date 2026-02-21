"""
middleware/auth_middleware.py
------------------------------
FastAPI dependency that extracts and verifies the Firebase ID token
from the Authorization header on protected routes.

Usage in any route:
    from middleware.auth_middleware import get_current_user
    @router.get("/profile")
    async def profile(user = Depends(get_current_user)):
        ...
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth_service import verify_id_token

# Tells FastAPI to expect: Authorization: Bearer <token>
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Extracts the Bearer token from the Authorization header,
    verifies it with Firebase Admin SDK, and returns decoded claims.

    Raises 401 if token is missing, expired, or invalid.
    """
    token = credentials.credentials
    decoded_token = verify_id_token(token)
    return decoded_token  # Contains: uid, email, name, etc.

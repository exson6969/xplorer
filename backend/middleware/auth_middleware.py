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

import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from services.auth_service import verify_id_token

# Tells FastAPI to expect: Authorization: Bearer <token>
# And points the Swagger UI Authorize button to our hidden token endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/swagger_token")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Extracts the Bearer token from the Authorization header,
    verifies it with Firebase Admin SDK, and checks for email verification.

    Raises 401 if token is missing or invalid.
    Raises 403 if email is not verified (production only).
    """
    decoded_token = verify_id_token(token)
    
    # TODO: Re-enable strict email verification for production
    # For development, we only log a warning instead of blocking.
    if not decoded_token.get("email_verified", False):
        print(f"⚠️  Warning: User {decoded_token.get('email')} has not verified their email.")
        
    return decoded_token  # Contains: uid, email, name, etc.

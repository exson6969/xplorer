"""
services/auth_service.py
-------------------------
Handles all Firebase Authentication operations:
  - Register (create user in Firebase Auth)
  - Login  (sign in via Firebase REST API to get ID token)
  - Get user info from token

Note: Firebase Admin SDK does NOT support email/password sign-in directly.
      We use the Firebase Auth REST API for login to retrieve the ID token.
"""

import os
import httpx
from fastapi import HTTPException, status
from firebase_admin import auth
from dotenv import load_dotenv

load_dotenv()

FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")
FIREBASE_SIGN_IN_URL = (
    f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"
    f"?key={FIREBASE_WEB_API_KEY}"
)


async def register_firebase_user(email: str, password: str, full_name: str) -> str:
    """
    Create a new user in Firebase Authentication.
    Returns the UID of the created user.
    """
    try:
        user_record = auth.create_user(
            email=email,
            password=password,
            display_name=full_name,
            email_verified=False,
        )
        return user_record.uid
    except auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered. Please sign in instead.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}",
        )


async def login_firebase_user(email: str, password: str) -> dict:
    """
    Sign in an existing user with email/password using Firebase Auth REST API.
    Returns idToken, refreshToken, expiresIn, and localId (uid).
    """
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(FIREBASE_SIGN_IN_URL, json=payload)

    if response.status_code != 200:
        error_message = response.json().get("error", {}).get("message", "Login failed")

        if "INVALID_PASSWORD" in error_message or "EMAIL_NOT_FOUND" in error_message:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )
        if "USER_DISABLED" in error_message:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been disabled.",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Firebase login error: {error_message}",
        )

    return response.json()


async def delete_firebase_user(uid: str) -> None:
    """
    Delete a user from Firebase Authentication (used for rollback on failed registration).
    """
    try:
        auth.delete_user(uid)
    except Exception:
        pass  # Best-effort rollback


def verify_id_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return decoded token claims.
    Raises HTTPException if the token is invalid or expired.
    """
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token. Access denied.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
        )

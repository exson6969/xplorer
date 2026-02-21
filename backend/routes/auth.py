"""
routes/auth.py
--------------
Public endpoints (no token required):
  POST /auth/register  → Create account + store profile in Firestore
  POST /auth/login     → Sign in, return Firebase ID token
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from models.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    AuthTokenResponse,
)
from models.user import UserProfileResponse
from services.auth_service import (
    register_firebase_user,
    login_firebase_user,
    delete_firebase_user,
    send_verification_email,
)
from services.firestore_service import create_user_profile, get_user_profile

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a Firebase Auth user, saves profile, and sends a verification email.",
)
async def register(payload: UserRegisterRequest):
    """
    Full registration flow:
    1. Create user in Firebase Authentication
    2. Save profile + preferences to Firestore
    3. Return the created profile (no token — user must log in separately)
    
    On failure at step 2, Firebase Auth user is rolled back.
    """
    # Step 1: Create Firebase Auth user
    uid = await register_firebase_user(
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
    )

    # Step 2: Save profile to Firestore
    profile_data = {
        "full_name": payload.full_name,
        "email": payload.email,
        "country": payload.country,
        "travel_style": payload.travel_style,
        "interests": payload.interests,
        "budget": payload.budget,
    }

    try:
        create_user_profile(uid, profile_data)
        
        # Authenticate briefly to send the verification email
        firebase_response = await login_firebase_user(
            email=payload.email,
            password=payload.password,
        )
        await send_verification_email(firebase_response["idToken"])
        
    except Exception as e:
        # Rollback: delete the Firebase Auth user we just created
        await delete_firebase_user(uid)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile save failed. Registration rolled back. Error: {str(e)}",
        )

    # Return the profile
    saved_profile = get_user_profile(uid)
    return UserProfileResponse(**saved_profile)


@router.post(
    "/login",
    response_model=AuthTokenResponse,
    summary="Login with email and password",
    description="Authenticates user via Firebase and returns an ID token for subsequent requests.",
)
async def login(payload: UserLoginRequest):
    """
    Login flow:
    1. Authenticate via Firebase REST API (returns idToken)
    2. Fetch user's display name from Firestore profile
    3. Return token + basic user info
    """
    # Step 1: Sign in with Firebase REST API
    firebase_response = await login_firebase_user(
        email=payload.email,
        password=payload.password,
    )

    uid = firebase_response["localId"]

    # Step 2: Get display name from Firestore
    try:
        profile = get_user_profile(uid)
        full_name = profile.get("full_name", "")
    except Exception:
        full_name = ""  # Don't fail login if profile fetch fails

    return AuthTokenResponse(
        id_token=firebase_response["idToken"],
        refresh_token=firebase_response["refreshToken"],
        expires_in=firebase_response["expiresIn"],
        uid=uid,
        email=firebase_response["email"],
        full_name=full_name,
    )


@router.post("/swagger_token", include_in_schema=False)
async def swagger_login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Hidden endpoint exclusively for the FastAPI Swagger UI to obtain a token.
    Swagger sends data as form-urlencoded, not JSON.
    """
    firebase_response = await login_firebase_user(
        email=form_data.username,
        password=form_data.password,
    )
    
    return {
        "access_token": firebase_response["idToken"],
        "token_type": "bearer"
    }

@router.post(
    "/resend-verification",
    summary="Resend verification email",
    description="Resends the verification email to the user.",
)
async def resend_verification(payload: UserLoginRequest):
    """
    1. Authenticate via Firebase REST API (returns idToken)
    2. Send verification email using idToken
    """
    # Step 1: Sign in with Firebase REST API to get idToken
    firebase_response = await login_firebase_user(
        email=payload.email,
        password=payload.password,
    )

    # Step 2: Send verification email
    await send_verification_email(firebase_response["idToken"])
    
    return {"message": "Verification email sent successfully."}

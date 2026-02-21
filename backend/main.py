"""
main.py
-------
FastAPI application entry point.
Initializes Firebase and mounts all routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config.firebase import init_firebase
from routes.auth import router as auth_router
from routes.user import router as user_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize Firebase Admin SDK once when the server starts."""
    init_firebase()
    print("✅ Firebase initialized successfully.")
    yield
    print("🛑 Server shutting down.")


app = FastAPI(
    title="Xplorer Auth API",
    description=(
        "Authentication and user data API for Xplorer.\n\n"
        "Uses Firebase Authentication for identity and Firestore for user profiles + chat history."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Update origins to match your frontend URL in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Change to ["http://localhost:3000"] etc. in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth_router)   # /auth/register, /auth/login
app.include_router(user_router)   # /user/profile, /user/chats


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Xplorer Auth API", "version": "1.0.0"}

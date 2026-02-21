"""
config/firebase.py
------------------
Initializes Firebase Admin SDK (singleton pattern).
Credentials are loaded entirely from environment variables — no JSON file required.
This is the production-safe approach (works on any deployment platform).
"""

import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from dotenv import load_dotenv

# Load .env explicitly from backend/ folder
_CONFIG_DIR = os.path.dirname(os.path.abspath(__file__))   # = backend/config
_BACKEND_DIR = os.path.dirname(_CONFIG_DIR)                 # = backend/

load_dotenv(dotenv_path=os.path.join(_BACKEND_DIR, ".env"))

_firebase_app = None
_firestore_client = None


def init_firebase() -> None:
    """Initialize Firebase Admin SDK once at app startup using env variables."""
    global _firebase_app, _firestore_client

    if _firebase_app is not None:
        return  # Already initialized

    # Build the credentials dict from individual env vars (replaces the JSON file)
    private_key = os.getenv("FIREBASE_PRIVATE_KEY", "")
    # dotenv may or may not preserve literal \n — normalize both cases
    private_key = private_key.replace("\\n", "\n")

    service_account_info = {
        "type": os.getenv("FIREBASE_TYPE", "service_account"),
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": private_key,
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
        "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
        "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL"),
        "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL"),
        "universe_domain": os.getenv("FIREBASE_UNIVERSE_DOMAIN", "googleapis.com"),
    }

    # Validate required fields
    missing = [k for k, v in service_account_info.items() if not v]
    if missing:
        raise EnvironmentError(
            f"Missing Firebase env vars: {missing}\n"
            f"Make sure your .env file is complete."
        )

    cred = credentials.Certificate(service_account_info)
    _firebase_app = firebase_admin.initialize_app(cred)
    _firestore_client = firestore.client()


def get_auth() -> auth:
    """Return Firebase Auth module (Admin SDK)."""
    return auth


def get_firestore():
    """Return initialized Firestore client."""
    if _firestore_client is None:
        raise RuntimeError("Firebase has not been initialized. Call init_firebase() first.")
    return _firestore_client

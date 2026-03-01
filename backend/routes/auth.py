"""
Auth Route — Supabase handles auth, this just validates JWT tokens.
Frontend uses Supabase SDK directly for login/signup/OAuth.
Backend uses this to extract user_id from Bearer token.
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/me")
async def get_me(authorization: Optional[str] = Header(None)):
    """
    Validate Supabase JWT and return user info.
    Frontend calls this to verify the session is valid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ")[1]

    try:
        from services.db_service import supabase
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {
            "id": user.user.id,
            "email": user.user.email,
            "created_at": user.user.created_at,
        }
    except Exception as e:
        logger.error(f"Auth check failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

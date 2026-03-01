"""
Share Route — Collaborative sharing & event signup
GET  /api/share/{token}           → get pack via share token
POST /api/share/{token}/register  → register for the event
GET  /api/share/{token}/registrations → list registrations (owner only)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from services.db_service import get_pack_by_token, register_for_event, get_registrations
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class RegistrationBody(BaseModel):
    name: str
    email: EmailStr
    roll_no: Optional[str] = None


@router.get("/{token}")
async def get_shared_pack(token: str):
    """Load a pack from a share token — used by signup page & collaboration"""
    pack = await get_pack_by_token(token)
    if not pack:
        raise HTTPException(status_code=404, detail="Share link not found or expired")
    return pack


@router.post("/{token}/register")
async def register_participant(token: str, body: RegistrationBody):
    """Register a participant via the QR signup page"""
    # Verify token exists first
    pack = await get_pack_by_token(token)
    if not pack:
        raise HTTPException(status_code=404, detail="Event not found")

    try:
        registration = await register_for_event(
            token=token,
            name=body.name,
            email=body.email,
            roll_no=body.roll_no,
        )
        return {
            "success": True,
            "message": f"Successfully registered for {pack.get('event_name', 'the event')}!",
            "registration_id": registration.get("id"),
        }
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise HTTPException(status_code=500, detail="Registration failed. Please try again.")


@router.get("/{token}/registrations")
async def list_registrations(token: str):
    """Get all registrations — for organiser dashboard"""
    pack = await get_pack_by_token(token)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")

    registrations = await get_registrations(token)
    return {"registrations": registrations, "count": len(registrations)}

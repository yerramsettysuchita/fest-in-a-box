"""Email Route"""
from fastapi import APIRouter, HTTPException
from schemas import SendEmailRequest
from services.db_service import get_pack
from services.email_service import send_announcement_email
from config import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/status")
async def email_status():
    """Check email configuration (safe — no secrets exposed)"""
    return {
        "gmail_user_set": bool(settings.GMAIL_USER),
        "gmail_user": settings.GMAIL_USER if settings.GMAIL_USER else "NOT SET",
        "app_password_set": bool(settings.GMAIL_APP_PASSWORD),
        "app_password_length": len(settings.GMAIL_APP_PASSWORD),
    }


@router.post("/send")
async def send_email(body: SendEmailRequest):
    # Try DB first; fall back to inline content if not found
    pack_data = {}
    email_assets = {}

    if body.pack_id:
        pack = await get_pack(body.pack_id)
        if pack:
            pack_data = pack.get("pack_data", {})
            email_assets = pack_data.get("email", {})

    if body.email_type == "faculty":
        subject = email_assets.get("subject_faculty") or body.subject or "Event Announcement"
        body_text = email_assets.get("body_faculty") or body.body or ""
    else:
        subject = email_assets.get("subject_students") or body.subject or "Event Announcement"
        body_text = email_assets.get("body_students") or body.body or ""

    if not body_text:
        raise HTTPException(status_code=422, detail="No email content available. Pack not found in database.")

    event_name = pack_data.get("event_name") or body.event_name or "Event"
    club_name = pack_data.get("brief", {}).get("club_name") or body.club_name or "Club"

    result = await send_announcement_email(
        recipient_email=body.recipient_email,
        subject=subject,
        body=body_text,
        event_name=event_name,
        club_name=club_name,
    )

    if not result.get("success"):
        error_msg = result.get("error", "Email send failed")
        logger.error(f"Email failed for {body.recipient_email}: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Email send failed: {error_msg}")

    return result

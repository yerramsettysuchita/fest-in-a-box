"""
Supabase Database Service
Handles all DB operations: save packs, fetch packs, share tokens, registrations.
"""
from supabase import create_client, Client
from config import settings
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


# ─── PACKS ────────────────────────────────────────────────────────────────────

async def save_pack(pack_data: dict, user_id: str | None = None) -> dict:
    """Save a generated pack to DB"""
    record = {
        "id": pack_data.get("pack_id", str(uuid.uuid4())),
        "user_id": user_id,
        "event_name": pack_data.get("event_name"),
        "pack_data": pack_data,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = supabase.table("packs").insert(record).execute()
    logger.info(f"💾 Pack saved: {record['id']}")
    return result.data[0] if result.data else record


async def get_pack(pack_id: str) -> dict | None:
    """Fetch a pack by ID"""
    result = supabase.table("packs").select("*").eq("id", pack_id).execute()
    if result.data:
        return result.data[0]
    return None


async def get_user_packs(user_id: str) -> list:
    """Fetch all packs for a user"""
    result = (
        supabase.table("packs")
        .select("id, event_name, created_at, pack_data->poster_text->headline")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


async def update_pack(pack_id: str, updates: dict) -> dict:
    """Update a pack (for collaborative editing)"""
    result = (
        supabase.table("packs")
        .update({"pack_data": updates, "updated_at": datetime.utcnow().isoformat()})
        .eq("id", pack_id)
        .execute()
    )
    return result.data[0] if result.data else {}


async def delete_pack(pack_id: str, user_id: str) -> bool:
    """Delete a pack (only owner can delete)"""
    result = (
        supabase.table("packs")
        .delete()
        .eq("id", pack_id)
        .eq("user_id", user_id)
        .execute()
    )
    return len(result.data) > 0


# ─── SHARE TOKENS ─────────────────────────────────────────────────────────────

async def create_share_token(pack_id: str, created_by: str | None = None, token: str | None = None) -> str:
    """Create a shareable token for a pack"""
    token = token or str(uuid.uuid4()).replace("-", "")[:16]
    supabase.table("share_tokens").insert({
        "token": token,
        "pack_id": pack_id,
        "created_by": created_by,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()
    logger.info(f"🔗 Share token created: {token} for pack {pack_id}")
    return token


async def get_pack_by_token(token: str) -> dict | None:
    """Fetch pack using share token"""
    result = (
        supabase.table("share_tokens")
        .select("pack_id, packs(pack_data, event_name)")
        .eq("token", token)
        .execute()
    )
    if result.data and result.data[0].get("packs"):
        return result.data[0]["packs"]
    return None


# ─── REGISTRATIONS ────────────────────────────────────────────────────────────

async def register_for_event(token: str, name: str, email: str, roll_no: str | None = None) -> dict:
    """Register a participant for an event via signup page"""
    record = {
        "id": str(uuid.uuid4()),
        "share_token": token,
        "participant_name": name,
        "participant_email": email,
        "roll_no": roll_no,
        "registered_at": datetime.utcnow().isoformat(),
    }
    result = supabase.table("registrations").insert(record).execute()
    return result.data[0] if result.data else record


async def get_registrations(share_token: str) -> list:
    """Get all registrations for a pack by share token"""
    result = (
        supabase.table("registrations")
        .select("*")
        .eq("share_token", share_token)
        .order("registered_at", desc=False)
        .execute()
    )
    return result.data or []

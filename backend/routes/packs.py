"""
Packs Route — CRUD for saved event packs
GET  /api/packs/{pack_id}     → fetch a pack
GET  /api/packs/user/{user_id} → all packs for user
PUT  /api/packs/{pack_id}     → update (collaborative edit)
DELETE /api/packs/{pack_id}   → delete
"""
from fastapi import APIRouter, HTTPException, Request
from services.db_service import get_pack, get_user_packs, update_pack, delete_pack
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{pack_id}")
async def fetch_pack(pack_id: str):
    pack = await get_pack(pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    return pack


@router.get("/user/{user_id}")
async def fetch_user_packs(user_id: str):
    packs = await get_user_packs(user_id)
    return {"packs": packs, "count": len(packs)}


@router.put("/{pack_id}")
async def update_pack_route(pack_id: str, updates: dict, request: Request):
    result = await update_pack(pack_id, updates)
    if not result:
        raise HTTPException(status_code=404, detail="Pack not found")
    return result


@router.delete("/{pack_id}")
async def delete_pack_route(pack_id: str, request: Request):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    success = await delete_pack(pack_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Pack not found or not authorized")
    return {"success": True}

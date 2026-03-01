"""
Generate Route — Core API endpoint
POST /api/generate  → generates full event pack
POST /api/generate/single → regenerates a single asset
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from slowapi import Limiter
from slowapi.util import get_remote_address
import uuid
from datetime import datetime
import logging

from schemas import GenerateRequest, GeneratedPack, EventBrief
from services.claude_service import generate_all_assets, regenerate_single_asset
from services.image_service import get_poster_image_url, get_social_banner_url, get_fallback_image_url
from services.qr_service import get_branded_qr_url, get_signup_page_url
from services.db_service import save_pack, create_share_token
from config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)


@router.post("/", response_model=GeneratedPack)
@limiter.limit("10/minute")
async def generate_pack(request: Request, body: GenerateRequest):
    """
    Main generation endpoint.
    Takes an EventBrief, calls Claude, assembles the full pack,
    saves to Supabase, returns complete GeneratedPack.
    """
    brief = body.brief
    pack_id = str(uuid.uuid4())

    try:
        # 1. Generate all text assets via Claude
        logger.info(f"Generating pack for: {brief.event_name}")
        assets = await generate_all_assets(brief)

        # 2. Generate image URLs
        poster_image_url = get_poster_image_url(
            brief.event_name, brief.theme, brief.vibe.value,
            venue=brief.venue, target_audience=brief.target_audience,
        )
        fallback_image_url = get_fallback_image_url(
            brief.event_name, brief.theme, brief.vibe.value
        )

        # 3. Generate share token string locally (DB insert happens AFTER pack is saved)
        share_token = str(uuid.uuid4()).replace("-", "")[:16]

        # 4. Build signup page URL & QR code
        signup_url = get_signup_page_url(share_token, settings.FRONTEND_URL)
        if brief.cta_link:
            signup_url = brief.cta_link
        qr_code_url = get_branded_qr_url(signup_url, brief.vibe.value)

        # 5. Assemble complete pack
        pack = GeneratedPack(
            pack_id=pack_id,
            event_name=brief.event_name,
            created_at=datetime.utcnow().isoformat(),
            brief=brief.model_dump(),   # Saved so frontend can regenerate after reload
            poster_text=assets.get("poster_text"),
            social=assets.get("social"),
            emcee_script=assets.get("emcee_script"),
            email=assets.get("email"),
            certificate=assets.get("certificate"),
            schedule=assets.get("schedule"),
            poster_image_url=poster_image_url,
            fallback_image_url=fallback_image_url,
            qr_code_url=qr_code_url,
            share_token=share_token,
        )

        # 6. Persist to Supabase — pack MUST be saved before share_token (FK constraint)
        try:
            user_id = getattr(request.state, "user_id", None)
            await save_pack(pack.model_dump(), user_id)
            await create_share_token(pack_id, token=share_token)
        except Exception as db_err:
            logger.warning(f"DB save failed (non-fatal): {db_err}")

        return pack

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Asset generation failed. Please try again.")


@router.post("/single")
@limiter.limit("20/minute")
async def regenerate_asset(
    request: Request,
    brief: EventBrief,
    asset_type: str,
    custom_instructions: str = "",
):
    """
    Regenerate a single asset type.
    Used by the 'Regenerate ↺' button on each asset card.
    """
    valid_types = ["poster_text", "social", "emcee_script", "email", "certificate", "schedule"]
    if asset_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid asset_type. Must be one of {valid_types}")

    try:
        result = await regenerate_single_asset(brief, asset_type, custom_instructions)
        return {"asset_type": asset_type, "data": result}
    except Exception as e:
        logger.error(f"Single asset regen failed: {e}")
        raise HTTPException(status_code=500, detail="Regeneration failed.")

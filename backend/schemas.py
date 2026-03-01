"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime


class VibeEnum(str, Enum):
    fun = "fun"
    formal = "formal"
    meme = "meme"
    academic = "academic"
    energetic = "energetic"


class EventBrief(BaseModel):
    event_name: str = Field(..., min_length=2, max_length=100)
    theme: str = Field(..., min_length=2, max_length=200)
    target_audience: str = Field(..., min_length=2, max_length=100)
    vibe: VibeEnum
    date_time: str = Field(..., min_length=2, max_length=100)
    venue: str = Field(..., min_length=2, max_length=200)
    cta_link: Optional[str] = None
    organiser_name: str = Field(..., min_length=2, max_length=100)
    club_name: str = Field(..., min_length=2, max_length=100)
    extra_notes: Optional[str] = Field(None, max_length=500)


class GenerateRequest(BaseModel):
    brief: EventBrief
    assets: List[str] = Field(
        default=[
            "poster_text",
            "insta_caption",
            "whatsapp_broadcast",
            "emcee_script",
            "announcement_email",
            "certificate_text",
            "schedule_graphic",
        ]
    )


class PosterTextAsset(BaseModel):
    headline: str
    subheading: str
    details: str
    cta: str
    hashtags: List[str]


class SocialAsset(BaseModel):
    instagram_caption: str
    instagram_hashtags: List[str]
    whatsapp_broadcast: str


class EmceeScriptAsset(BaseModel):
    intro: str
    crowd_warmup: str
    segment_transitions: List[str]
    closing: str


class EmailAsset(BaseModel):
    subject_faculty: str
    body_faculty: str
    subject_students: str
    body_students: str


class CertificateAsset(BaseModel):
    title: str
    body: str
    signatory_block: str


class ScheduleAsset(BaseModel):
    title: str
    timeline: List[dict]


class GeneratedPack(BaseModel):
    pack_id: str
    event_name: str
    created_at: str
    brief: Optional[dict] = None       # Stored so regeneration works after page reload
    poster_text: Optional[PosterTextAsset] = None
    social: Optional[SocialAsset] = None
    emcee_script: Optional[EmceeScriptAsset] = None
    email: Optional[EmailAsset] = None
    certificate: Optional[CertificateAsset] = None
    schedule: Optional[ScheduleAsset] = None
    poster_image_url: Optional[str] = None
    fallback_image_url: Optional[str] = None
    qr_code_url: Optional[str] = None
    share_token: Optional[str] = None


class SharePackRequest(BaseModel):
    pack_id: str
    collaborator_email: Optional[str] = None


class SendEmailRequest(BaseModel):
    pack_id: str
    recipient_email: str
    email_type: str  # "faculty" | "students"
    # Optional fallback content (used if pack is not in DB)
    subject: Optional[str] = None
    body: Optional[str] = None
    event_name: Optional[str] = None
    club_name: Optional[str] = None


class SavePackRequest(BaseModel):
    pack: GeneratedPack
    user_id: Optional[str] = None

"""
Groq AI Service
Generates all event assets using Groq API (free, blazing fast).
Uses llama-3.3-70b-versatile model.
"""
from groq import Groq
import json
import logging
from schemas import EventBrief

logger = logging.getLogger(__name__)

from config import settings
client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are an expert event coordinator and copywriter for student clubs and college festivals.
You generate highly engaging, creative event assets that match the requested vibe perfectly.
Always respond with valid JSON only. No markdown, no preamble, no explanation — pure JSON.
Avoid slurs, explicit content, real brand logos, or any sensitive material.
Keep language inclusive and energetic."""


def build_prompt(brief: EventBrief) -> str:
    return f"""Generate a complete event asset pack for the following event.

EVENT DETAILS:
- Event Name: {brief.event_name}
- Club: {brief.club_name}
- Organiser: {brief.organiser_name}
- Theme: {brief.theme}
- Target Audience: {brief.target_audience}
- Vibe: {brief.vibe.value}
- Date & Time: {brief.date_time}
- Venue: {brief.venue}
- CTA Link: {brief.cta_link or 'To be announced'}
- Extra Notes: {brief.extra_notes or 'None'}

Return a JSON object with EXACTLY this structure:

{{
  "poster_text": {{
    "headline": "Punchy 4-7 word headline",
    "subheading": "One compelling line about the event",
    "details": "Date · Time · Venue on separate lines",
    "cta": "Action-oriented CTA text",
    "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
  }},
  "social": {{
    "instagram_caption": "2-3 sentence Instagram caption with energy, line breaks, emojis if vibe is fun",
    "instagram_hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
    "whatsapp_broadcast": "Short punchy WhatsApp message under 200 chars with key info and link"
  }},
  "emcee_script": {{
    "intro": "Full MC intro paragraph (60-80 words)",
    "crowd_warmup": "Interactive crowd warm-up prompt/question (30-40 words)",
    "segment_transitions": [
      "Transition 1 text (20-30 words)",
      "Transition 2 text (20-30 words)",
      "Transition 3 text (20-30 words)"
    ],
    "closing": "Closing statement (40-50 words)"
  }},
  "email": {{
    "subject_faculty": "Professional email subject for faculty",
    "body_faculty": "Formal 3-paragraph email body for faculty (150-200 words)",
    "subject_students": "Exciting email subject for students",
    "body_students": "Energetic 3-paragraph email body for students (150-200 words)"
  }},
  "certificate": {{
    "title": "Certificate of Participation",
    "body": "This is to certify that [PARTICIPANT_NAME] has successfully participated in {brief.event_name} organised by {brief.club_name} on {brief.date_time} at {brief.venue}.",
    "signatory_block": "For {brief.club_name}\\n{brief.organiser_name}\\nOrganiser, {brief.event_name}"
  }},
  "schedule": {{
    "title": "{brief.event_name} — Event Schedule",
    "timeline": [
      {{"time": "HH:MM AM/PM", "activity": "Activity name", "duration": "X mins"}},
      {{"time": "HH:MM AM/PM", "activity": "Activity name", "duration": "X mins"}},
      {{"time": "HH:MM AM/PM", "activity": "Activity name", "duration": "X mins"}},
      {{"time": "HH:MM AM/PM", "activity": "Activity name", "duration": "X mins"}},
      {{"time": "HH:MM AM/PM", "activity": "Activity name", "duration": "X mins"}}
    ]
  }}
}}"""


async def generate_all_assets(brief: EventBrief) -> dict:
    """
    Single Groq API call that generates ALL assets at once.
    llama-3.3-70b-versatile is free and handles JSON very well.
    """
    logger.info(f"Generating assets for: {brief.event_name}")

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": build_prompt(brief)}
        ],
        temperature=0.7,
        max_tokens=4000,
        response_format={"type": "json_object"},  # Forces pure JSON output
    )

    raw = completion.choices[0].message.content.strip()

    try:
        data = json.loads(raw)
        logger.info(f"✅ Assets generated for: {brief.event_name}")
        return data
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}\nRaw: {raw[:300]}")
        raise ValueError(f"Groq returned malformed JSON: {e}")


async def regenerate_single_asset(brief: EventBrief, asset_type: str, custom_instructions: str = "") -> dict:
    """Regenerate a single asset — used by the Regenerate button."""
    extra = f"\nCustom instructions: {custom_instructions}" if custom_instructions else ""

    asset_prompts = {
        "poster_text":  "Return ONLY the poster_text JSON key and its value.",
        "social":       "Return ONLY the social JSON key and its value.",
        "emcee_script": "Return ONLY the emcee_script JSON key and its value.",
        "email":        "Return ONLY the email JSON key and its value.",
        "certificate":  "Return ONLY the certificate JSON key and its value.",
        "schedule":     "Return ONLY the schedule JSON key and its value.",
    }

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": f"{build_prompt(brief)}\n\n{asset_prompts.get(asset_type, '')}{extra}"}
        ],
        temperature=0.8,
        max_tokens=2000,
        response_format={"type": "json_object"},
    )

    raw = completion.choices[0].message.content.strip()
    return json.loads(raw)
"""
Image Service — Pollinations.ai (primary) + loremflickr (fallback)
Pollinations.ai generates actual AI images from event-specific prompts.
No API key required. URL: https://image.pollinations.ai/prompt/{prompt}
"""
import logging
import hashlib
from urllib.parse import quote

logger = logging.getLogger(__name__)

VIBE_STYLE = {
    "fun":       "vibrant colorful festive decorations, confetti and balloons, warm glowing lights",
    "formal":    "elegant venue interior, grand stage with spotlights, sophisticated dark decor",
    "meme":      "neon lights, bold geometric shapes, vibrant urban street art aesthetic",
    "academic":  "scholarly atmosphere, books and knowledge symbols, soft clean minimal lighting",
    "energetic": "concert stage with dramatic beams, pyrotechnics, laser light show, dynamic energy",
}

FALLBACK_KEYWORDS = {
    "fun":       "festival,celebration,party,colorful",
    "formal":    "conference,professional,corporate,stage",
    "meme":      "youth,festival,crowd,concert",
    "academic":  "university,education,seminar,college",
    "energetic": "concert,festival,energy,performance",
}


def _build_prompt(event_name: str, theme: str, vibe: str,
                  venue: str = "", target_audience: str = "") -> str:
    """Build a rich, event-specific AI image prompt.
    Theme is placed first so the model prioritises the visual concept.
    """
    style = VIBE_STYLE.get(vibe, "festival celebration atmosphere")
    parts = [
        "abstract digital background artwork",  # Art-style frame steers model away from photorealism
        theme,
        "themed event poster",
        style,
        "stunning poster background, vibrant colors, ultra high quality, 8k digital art, cinematic composition, dramatic lighting",
        "no people, no animals, no cats, no dogs, no statues, no real locations, no street photography, no text, no words, no letters, no signs, no logos, no watermarks",
    ]
    return ", ".join(parts)


def _seed(key: str) -> int:
    return int(hashlib.md5(key.encode()).hexdigest()[:8], 16) % 99999


def get_poster_image_url(event_name: str, theme: str, vibe: str,
                          venue: str = "", target_audience: str = "",
                          width: int = 800, height: int = 1100) -> str:
    """Primary: Pollinations.ai AI-generated image specific to the event."""
    prompt = _build_prompt(event_name, theme, vibe, venue, target_audience)
    seed = _seed(f"{event_name}{theme}{vibe}")
    encoded = quote(prompt)
    url = (f"https://image.pollinations.ai/prompt/{encoded}"
           f"?width={width}&height={height}&seed={seed}&nologo=true&model=turbo&enhance=true")
    logger.info(f"AI image URL generated for: {event_name}")
    return url


def get_fallback_image_url(event_name: str, theme: str, vibe: str,
                            width: int = 800, height: int = 1100) -> str:
    """Fallback: loremflickr stock photo if Pollinations.ai is unavailable."""
    kw = FALLBACK_KEYWORDS.get(vibe, "festival,event,celebration")
    theme_word = theme.split()[0].lower() if theme else "event"
    seed = _seed(f"{event_name}{theme}fallback")
    return f"https://loremflickr.com/{width}/{height}/{theme_word},{kw}?lock={seed}"


def get_social_banner_url(event_name: str, theme: str, vibe: str,
                           venue: str = "", target_audience: str = "") -> str:
    """Square AI banner for Instagram (1080x1080)."""
    prompt = _build_prompt(event_name, theme, vibe, venue, target_audience)
    seed = _seed(f"{event_name}{theme}{vibe}social")
    encoded = quote(prompt)
    return (f"https://image.pollinations.ai/prompt/{encoded}"
            f"?width=1080&height=1080&seed={seed}&nologo=true&model=turbo&enhance=true")

"""
QR Code Service — goqr.me API
Free, no authentication required.
Generates QR codes for event signup pages.
"""
from urllib.parse import quote
import logging

logger = logging.getLogger(__name__)

QR_API_BASE = "https://api.qrserver.com/v1/create-qr-code"


def get_qr_code_url(
    data: str,
    size: int = 300,
    color: str = "000000",
    bgcolor: str = "ffffff",
    format: str = "png",
    margin: int = 10,
) -> str:
    """
    Returns a direct URL to a QR code image.
    Works as <img src="..."> directly.

    Args:
        data: The URL or text to encode
        size: Image size in pixels (square)
        color: Foreground color hex (no #)
        bgcolor: Background color hex (no #)
        format: png | svg | eps | gif
        margin: Quiet zone margin in pixels
    """
    encoded_data = quote(data, safe="")
    url = (
        f"{QR_API_BASE}/"
        f"?data={encoded_data}"
        f"&size={size}x{size}"
        f"&color={color}"
        f"&bgcolor={bgcolor}"
        f"&format={format}"
        f"&margin={margin}"
        f"&qzone=1"
        f"&ecc=M"
    )
    logger.info(f"📱 QR code URL generated for: {data[:50]}...")
    return url


def get_branded_qr_url(signup_url: str, vibe: str = "fun") -> str:
    """
    Returns a styled QR code URL based on event vibe.
    """
    vibe_colors = {
        "fun":       ("FF6B35", "FFF8F0"),
        "formal":    ("1a1a2e", "F5F0E8"),
        "meme":      ("00D4FF", "0A0A0A"),
        "academic":  ("1E3A8A", "EFF6FF"),
        "energetic": ("F59E0B", "0A0A08"),
    }
    fg, bg = vibe_colors.get(vibe, ("000000", "ffffff"))
    return get_qr_code_url(signup_url, size=300, color=fg, bgcolor=bg)


def get_signup_page_url(share_token: str, frontend_url: str) -> str:
    """Build the signup page URL for QR code"""
    return f"{frontend_url}/signup/{share_token}"

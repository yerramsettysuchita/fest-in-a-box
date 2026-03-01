"""
Email Service — Gmail SMTP
Sends via your Gmail account using an App Password.
Works for any recipient — no domain verification needed.
"""
import aiosmtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import settings

logger = logging.getLogger(__name__)

GMAIL_HOST = "smtp.gmail.com"
GMAIL_PORT = 587


def build_email_html(subject: str, body: str, event_name: str, club_name: str) -> str:
    """Build a clean HTML email template"""
    paragraphs = "".join(f"<p style='margin:0 0 16px;line-height:1.7;color:#374151'>{p}</p>"
                         for p in body.split("\n\n") if p.strip())
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0a0a08 0%,#1a1a16 100%);padding:32px 40px">
              <p style="margin:0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#c9a84c;font-family:monospace">
                {club_name}
              </p>
              <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;color:#f5f0e8;line-height:1.2">
                {event_name}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px">
              {paragraphs}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb">
              <p style="margin:0;font-size:12px;color:#9ca3af;font-family:monospace">
                Created with AI assistance · Fest-in-a-Box
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


async def _send_via_gmail(to: str, subject: str, html: str, display_name: str = "Fest-in-a-Box"):
    """Core Gmail SMTP sender"""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{display_name} <{settings.GMAIL_USER}>"
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        msg,
        hostname=GMAIL_HOST,
        port=GMAIL_PORT,
        username=settings.GMAIL_USER,
        password=settings.GMAIL_APP_PASSWORD,
        start_tls=True,
    )


async def send_announcement_email(
    recipient_email: str,
    subject: str,
    body: str,
    event_name: str,
    club_name: str,
    from_email: str = "",
) -> dict:
    """Send event announcement email via Gmail"""
    try:
        html = build_email_html(subject, body, event_name, club_name)
        await _send_via_gmail(recipient_email, subject, html, display_name=f"{club_name} via Fest-in-a-Box")
        logger.info(f"✉️  Email sent to {recipient_email}")
        return {"success": True}
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return {"success": False, "error": str(e)}


async def send_share_invite(
    recipient_email: str,
    inviter_name: str,
    event_name: str,
    share_link: str,
) -> dict:
    """Send collaboration invite email"""
    subject = f"You're invited to collaborate on {event_name}"
    html = f"""
<!DOCTYPE html><html><body style="font-family:'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:40px 16px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">
    <div style="background:#0a0a08;padding:32px 40px">
      <h2 style="color:#f5f0e8;margin:0">Collaboration Invite</h2>
      <p style="color:#c9a84c;margin:8px 0 0;font-family:monospace;font-size:13px">{event_name}</p>
    </div>
    <div style="padding:40px">
      <p style="color:#374151;line-height:1.7">{inviter_name} has invited you to collaborate on the event pack for <strong>{event_name}</strong>.</p>
      <a href="{share_link}" style="display:inline-block;margin-top:20px;background:#c9a84c;color:#0a0a08;padding:14px 28px;text-decoration:none;font-weight:700;font-size:14px;border-radius:2px">
        Open Pack →
      </a>
    </div>
    <div style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb">
      <p style="margin:0;font-size:12px;color:#9ca3af;font-family:monospace">Fest-in-a-Box · AI-powered event toolkit</p>
    </div>
  </div>
</body></html>"""

    try:
        await _send_via_gmail(recipient_email, subject, html)
        return {"success": True}
    except Exception as e:
        logger.error(f"Invite email failed: {e}")
        return {"success": False, "error": str(e)}

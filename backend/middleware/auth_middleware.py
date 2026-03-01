"""
Auth Middleware — extracts Supabase JWT from Authorization header
and sets request.state.user_id if valid.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from services.db_service import supabase
import logging

logger = logging.getLogger(__name__)


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.user_id = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            try:
                result = supabase.auth.get_user(token)
                if result and result.user:
                    request.state.user_id = result.user.id
            except Exception as e:
                logger.debug(f"Auth token invalid: {e}")
        return await call_next(request)

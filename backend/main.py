"""
Fest-in-a-Box — FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
import logging

from config import settings
from routes import generate, auth, packs, share, email_route
from middleware.auth_middleware import AuthMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Fest-in-a-Box API starting...")
    yield
    logger.info("👋 Fest-in-a-Box API shutting down...")


app = FastAPI(
    title="Fest-in-a-Box API",
    description="AI-powered event asset generator for student clubs",
    version="1.0.0",
    lifespan=lifespan,
)

# Auth middleware (must be added before CORS)
app.add_middleware(AuthMiddleware)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — allow configured frontend URL + localhost dev ports + any *.onrender.com
_origins = [
    settings.FRONTEND_URL,
    *[f"http://localhost:{p}" for p in range(5173, 5200)],
    "https://fest-in-a-box.onrender.com",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router,         prefix="/api/auth",     tags=["auth"])
app.include_router(generate.router,     prefix="/api/generate", tags=["generate"])
app.include_router(packs.router,        prefix="/api/packs",    tags=["packs"])
app.include_router(share.router,        prefix="/api/share",    tags=["share"])
app.include_router(email_route.router,  prefix="/api/email",    tags=["email"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "Fest-in-a-Box API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

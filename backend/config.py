from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    FRONTEND_URL: str = "http://localhost:5173"
    GMAIL_USER: str = ""
    GMAIL_APP_PASSWORD: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
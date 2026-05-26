from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./data/tester.db"
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    secret_key: str = "change-this-to-a-random-secret"
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"
    ai_provider: str = "openai"
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    playwright_headless: bool = True
    report_dir: str = "./reports/output"
    screenshot_dir: str = "./runtime/screenshots"
    log_level: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()

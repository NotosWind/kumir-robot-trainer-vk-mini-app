import os


class Settings:
    def __init__(self) -> None:
        self.vk_app_secret = os.environ.get("VK_APP_SECRET", "dev-secret")
        self.database_url = os.environ.get("DATABASE_URL", "sqlite:///./kumir.db")
        self.skip_auth = os.environ.get("VK_SKIP_AUTH", "") == "1"
        self.dev_user_id = os.environ.get("VK_DEV_USER_ID", "1")


def get_settings() -> Settings:
    return Settings()

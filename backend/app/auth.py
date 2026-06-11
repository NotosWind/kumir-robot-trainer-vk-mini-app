import hashlib
import hmac
from base64 import b64encode
from urllib.parse import parse_qsl, urlencode

from fastapi import Depends, Header, HTTPException

from .config import Settings, get_settings


def verify_launch_params(query: str, secret: str) -> str | None:
    """Return vk_user_id if the VK sign is valid, otherwise None."""
    if not query:
        return None
    params = dict(parse_qsl(query))
    sign = params.get("sign")
    if not sign:
        return None
    vk_params = sorted((k, v) for k, v in params.items() if k.startswith("vk_"))
    if not vk_params:
        return None
    payload = urlencode(vk_params)
    digest = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest()
    computed = b64encode(digest).decode().rstrip("=").replace("+", "-").replace("/", "_")
    if not hmac.compare_digest(computed, sign):
        return None
    return params.get("vk_user_id")


def get_current_user_id(
    x_vk_launch_params: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> str:
    if settings.skip_auth:
        return settings.dev_user_id
    user_id = verify_launch_params(x_vk_launch_params or "", settings.vk_app_secret)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid VK launch params")
    return user_id

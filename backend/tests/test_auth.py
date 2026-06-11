import hashlib
import hmac
from base64 import b64encode
from urllib.parse import urlencode

from app.auth import verify_launch_params


def _sign(params: dict[str, str], secret: str) -> str:
    vk = sorted((k, v) for k, v in params.items() if k.startswith("vk_"))
    payload = urlencode(vk)
    digest = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest()
    return b64encode(digest).decode().rstrip("=").replace("+", "-").replace("/", "_")


def make_launch(secret: str, user_id: str = "42") -> str:
    params = {"vk_user_id": user_id, "vk_app_id": "777", "vk_ts": "1700000000"}
    params["sign"] = _sign(params, secret)
    return urlencode(params)


def test_valid_sign_returns_user_id():
    launch = make_launch("test-secret", "42")
    assert verify_launch_params(launch, "test-secret") == "42"


def test_wrong_secret_rejected():
    launch = make_launch("other-secret", "42")
    assert verify_launch_params(launch, "test-secret") is None


def test_missing_sign_rejected():
    assert verify_launch_params("vk_user_id=42", "test-secret") is None

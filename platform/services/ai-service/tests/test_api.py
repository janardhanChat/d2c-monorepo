import time

import jwt
import pytest
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.main import create_app

SECRET = "test-secret-at-least-32-characters-long!"
ORG = "11111111-1111-4111-8111-111111111111"


@pytest.fixture
def client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_settings] = lambda: Settings(supabase_jwt_secret=SECRET)
    return TestClient(app)


def token(sub: str = "user-1") -> str:
    claims = {"sub": sub, "aud": "authenticated", "exp": int(time.time()) + 300}
    return jwt.encode(claims, SECRET, algorithm="HS256")


def test_health(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok", "service": "ai-service"}


def test_generate_requires_auth(client: TestClient) -> None:
    res = client.post("/v1/captions/generate", json={"topic": "Diwali sale"})
    assert res.status_code == 401


def test_generate_captions(client: TestClient) -> None:
    res = client.post(
        "/v1/captions/generate",
        json={"topic": "Diwali sale", "variants": 2},
        headers={"Authorization": f"Bearer {token()}", "X-Organization-Id": ORG},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["provider"] == "echo"
    assert len(body["captions"]) == 2

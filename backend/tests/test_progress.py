from tests.test_auth import make_launch

SECRET = "test-secret"


def _h(user_id: str = "42") -> dict[str, str]:
    return {"X-VK-Launch-Params": make_launch(SECRET, user_id)}


def test_requires_auth(client):
    assert client.get("/api/progress").status_code == 401


def test_put_then_get(client):
    r = client.put("/api/progress/corridor", json={"stars": 2}, headers=_h())
    assert r.status_code == 200
    assert r.json() == {"stars": 2, "solved": True}
    r = client.get("/api/progress", headers=_h())
    assert r.json() == {"corridor": {"stars": 2, "solved": True}}


def test_keeps_best_stars(client):
    client.put("/api/progress/corridor", json={"stars": 3}, headers=_h())
    client.put("/api/progress/corridor", json={"stars": 1}, headers=_h())
    r = client.get("/api/progress", headers=_h())
    assert r.json()["corridor"]["stars"] == 3


def test_zero_stars_not_solved(client):
    r = client.put("/api/progress/x", json={"stars": 0}, headers=_h())
    assert r.json() == {"stars": 0, "solved": False}


def test_progress_is_per_user(client):
    client.put("/api/progress/x", json={"stars": 1}, headers=_h("1"))
    r = client.get("/api/progress", headers=_h("2"))
    assert r.json() == {}

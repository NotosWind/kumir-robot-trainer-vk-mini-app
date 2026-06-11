from app.db import SessionLocal
from app.models import Progress


def test_progress_row_roundtrip(_reset_db):
    db = SessionLocal()
    try:
        db.add(Progress(user_id="u1", level_id="corridor", stars=2, solved=True))
        db.commit()
        row = db.get(Progress, {"user_id": "u1", "level_id": "corridor"})
        assert row is not None
        assert row.stars == 2
        assert row.solved is True
    finally:
        db.close()

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models  # noqa: F401  (registers ORM tables)
from .auth import get_current_user_id
from .db import Base, engine, get_db
from .models import Progress
from .schemas import ProgressEntry, ResultIn

Base.metadata.create_all(bind=engine)

app = FastAPI(title="KuMir Robot API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/progress")
def get_progress(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> dict[str, ProgressEntry]:
    rows = db.query(Progress).filter(Progress.user_id == user_id).all()
    return {r.level_id: ProgressEntry(stars=r.stars, solved=r.solved) for r in rows}


@app.put("/api/progress/{level_id}")
def put_result(
    level_id: str,
    body: ResultIn,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> ProgressEntry:
    row = db.get(Progress, {"user_id": user_id, "level_id": level_id})
    best = max(body.stars, row.stars if row else 0)
    if row is None:
        row = Progress(user_id=user_id, level_id=level_id, stars=best, solved=best >= 1)
        db.add(row)
    else:
        row.stars = best
        row.solved = best >= 1
    db.commit()
    return ProgressEntry(stars=row.stars, solved=row.solved)

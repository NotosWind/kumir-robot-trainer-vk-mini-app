from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class Progress(Base):
    __tablename__ = "progress"

    user_id: Mapped[str] = mapped_column(String, primary_key=True)
    level_id: Mapped[str] = mapped_column(String, primary_key=True)
    stars: Mapped[int] = mapped_column(Integer, default=0)
    solved: Mapped[bool] = mapped_column(Boolean, default=False)

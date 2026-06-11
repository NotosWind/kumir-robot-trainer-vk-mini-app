from pydantic import BaseModel


class ProgressEntry(BaseModel):
    stars: int
    solved: bool


class ResultIn(BaseModel):
    stars: int

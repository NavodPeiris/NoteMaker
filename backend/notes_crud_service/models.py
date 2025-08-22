from pydantic import BaseModel
from typing import Optional

class ReadReq(BaseModel):
    page: int
    page_size: int
    user_id: int


class CreateReq(BaseModel):
    title: str
    tags: list[str]
    note: str
    group_id: int
    updatedAt: str
    user_id: int


class UpdateReq(BaseModel):
    id: int
    title: Optional[str] = None
    tags: Optional[list[str]] = None
    note: Optional[str] = None
    group_id: Optional[int] = None
    updatedAt: str
    user_id: int


class DeleteReq(BaseModel):
    id: int
    user_id: int

class GetGroupsReq(BaseModel):
    user_id: int


class CreateGroupsReq(BaseModel):
    title: str
    user_id: int
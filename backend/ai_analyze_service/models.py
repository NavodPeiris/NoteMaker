from pydantic import BaseModel

class NoteReq(BaseModel):
    text: str
    user_id: int

class QuestionReq(BaseModel):
    question: str
    user_id: int

class Triple(BaseModel):
    source: str
    relation: str
    target: str

class Node(BaseModel):
    entity: str

class KGReq(BaseModel):
    note_id: int
    text: str
    user_id: int

class KGDelReq(BaseModel):
    note_id: int

class GetKGReq(BaseModel):
    user_id: int
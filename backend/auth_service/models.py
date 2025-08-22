from pydantic import BaseModel

class LoginReq(BaseModel):
    email: str
    password:str

class RegisterReq(BaseModel):
    name: str
    email: str
    password: str
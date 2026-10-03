from pydantic import BaseModel

class User(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool = True

class Project(BaseModel):
    id: int
    name: str
    owner_id: int

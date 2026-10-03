from fastapi import FastAPI, HTTPException
from models import User, Project

app = FastAPI(title="Sample Task Engine")

USERS_DB = [
    User(id=1, username="alice", email="alice@example.com"),
    User(id=2, username="bob", email="bob@example.com")
]

PROJECTS_DB = [
    Project(id=101, name="Alpha Engine", owner_id=1)
]

@app.get("/")
def read_root():
    return {"message": "Welcome to Sample Task Engine API"}

@app.get("/users")
def get_users():
    return USERS_DB

@app.get("/users/{user_id}")
def get_user(user_id: int):
    for u in USERS_DB:
        if u.id == user_id:
            return u
    raise HTTPException(status_code=404, detail="User not found")

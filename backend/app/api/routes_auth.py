import re
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session
from app.models.database import SessionLocal, UserModel, SessionModel
from app.auth.security import hash_password, verify_password, generate_session_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""

    @field_validator("email")
    def validate_email_format(cls, v):
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Invalid email format.")
        return clean

class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    def validate_email_format(cls, v):
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Invalid email format.")
        return clean

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    token: str | None = None

@router.post("/register", response_model=UserResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(UserModel).filter(UserModel.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    user_id = str(uuid.uuid4())
    user = UserModel(
        id=user_id,
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name or req.email.split("@")[0],
        role="developer"
    )
    db.add(user)
    
    # Create session
    token = generate_session_token()
    session = SessionModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    db.add(session)
    db.commit()

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        token=token
    )

@router.post("/login", response_model=UserResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = generate_session_token()
    session = SessionModel(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    db.add(session)
    db.commit()

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        token=token
    )

@router.get("/me", response_model=UserResponse)
def get_current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        # Provide default local developer profile if no auth provided in development
        return UserResponse(
            id="dev-user-001",
            email="developer@codeforge.ai",
            full_name="Lead Engineer",
            role="admin",
            token="dev-token"
        )
    token = authorization.split(" ")[1]
    session = db.query(SessionModel).filter(SessionModel.token == token).first()
    if not session or session.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Session expired or invalid.")

    user = db.query(UserModel).filter(UserModel.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        token=token
    )

@router.post("/logout")
def logout(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        session = db.query(SessionModel).filter(SessionModel.token == token).first()
        if session:
            db.delete(session)
            db.commit()
    return {"success": True, "message": "Logged out successfully."}

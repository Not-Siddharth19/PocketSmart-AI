from fastapi import APIRouter, Depends, HTTPException, Response, Request, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas import RegisterIn, LoginIn, PasswordUpdateIn
from ..services.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(tags=["auth"])

@router.post("/api/auth/register")
@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    clean_username = data.username.strip()
    clean_email = data.email.strip().lower()
    
    existing = db.query(User).filter((User.username.ilike(clean_username)) | (User.email.ilike(clean_email))).first()
    if existing:
        raise HTTPException(409, "Username or email already exists")
    
    user = User(
        username=clean_username,
        email=clean_email,
        password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "message": "Registration successful",
        "user": {"id": user.id, "username": user.username, "email": user.email}
    }

@router.post("/api/auth/login")
@router.post("/login")
def login(data: LoginIn, response: Response, db: Session = Depends(get_db)):
    clean_username = data.username.strip()
    user = db.query(User).filter(User.username.ilike(clean_username)).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid username or password")
    
    token = create_access_token(user)
    # Set cookie for browser sessions
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=86400,
        httponly=False,
        samesite="lax"
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username, "email": user.email}
    }

@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username.ilike(form_data.username.strip())).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(401, "Incorrect username or password")
    token = create_access_token(user)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/api/auth/logout")
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}

@router.get("/api/auth/me")
@router.get("/api/me")
def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

@router.post("/api/auth/change-password")
@router.post("/change-password")
def change_password(data: PasswordUpdateIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


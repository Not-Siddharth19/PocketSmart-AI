from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.auth import get_current_user_optional

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

def page(request: Request, name: str, db: Session, **extra):
    user = get_current_user_optional(request, db)
    return templates.TemplateResponse(
        request=request,
        name=name,
        context={"request": request, "user": user, **extra}
    )

@router.get("/")
def home(request: Request, db: Session = Depends(get_db)):
    return page(request, "index.html", db)

@router.get("/login")
def login(request: Request, db: Session = Depends(get_db)):
    return page(request, "login.html", db)

@router.get("/register")
def register(request: Request, db: Session = Depends(get_db)):
    return page(request, "register.html", db)

@router.get("/dashboard")
def dashboard(request: Request, db: Session = Depends(get_db)):
    return page(request, "dashboard.html", db)

@router.get("/planner/home")
@router.get("/home-planner")
def home_planner(request: Request, db: Session = Depends(get_db)):
    return page(request, "home_planner.html", db)

@router.get("/planner/party")
@router.get("/party-planner")
def party_planner(request: Request, db: Session = Depends(get_db)):
    return page(request, "party_planner.html", db)

@router.get("/planner/jewelry")
@router.get("/jewelry-planner")
def jewelry_planner(request: Request, db: Session = Depends(get_db)):
    return page(request, "jewelry_planner.html", db)

@router.get("/history")
@router.get("/recommendation-history-page")
def history(request: Request, db: Session = Depends(get_db)):
    return page(request, "history.html", db)

@router.get("/settings")
def settings_page(request: Request, db: Session = Depends(get_db)):
    return page(request, "settings.html", db)


import json
from typing import Annotated
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.recommendation import Recommendation
from ..services.auth import get_current_user
from ..services.recommendations import home_plan, party_plan, jewelry_plan
from ..services.gemini import GeminiService

router = APIRouter(tags=["planners"])
gemini = GeminiService()

def save_rec(db: Session, user: User, category: str, data: dict, result) -> int:
    rec = Recommendation(
        user_id=user.id,
        category=category,
        query_json=json.dumps(data),
        result_json=json.dumps(result.to_dict()),
        created_at=datetime.now(timezone.utc)
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec.id

def serialize_result(result, rec_id: int | None = None) -> dict:
    d = result.to_dict()
    d["id"] = rec_id
    d["ai_enabled"] = gemini.enabled
    return d

# --- Home Planner Endpoints ---
@router.post("/api/generate-home")
@router.post("/generate-home")
@router.post("/home-budget")
def generate_home(payload: dict, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Standardize payload fields
        data_obj = type("HomeInput", (), payload)()
        result = home_plan(data_obj)
    except Exception as e:
        raise HTTPException(422, f"Invalid home planner input: {e}")
    
    result = gemini.improve(result, json.dumps(payload))
    rec_id = save_rec(db, user, "home", payload, result)
    return serialize_result(result, rec_id)

# --- Party Planner Endpoints ---
@router.post("/api/generate-party")
@router.post("/generate-party")
@router.post("/party-budget")
def generate_party(payload: dict, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        data_obj = type("PartyInput", (), payload)()
        result = party_plan(data_obj)
    except Exception as e:
        raise HTTPException(422, f"Invalid party planner input: {e}")
    
    result = gemini.improve(result, json.dumps(payload))
    rec_id = save_rec(db, user, "party", payload, result)
    return serialize_result(result, rec_id)

# --- Jewelry Planner Endpoints ---
@router.post("/api/generate-jewelry")
@router.post("/generate-jewelry")
@router.post("/jewelry-budget")
async def generate_jewelry(
    budget: Annotated[float, Form(...)],
    occasion: Annotated[str, Form(...)],
    style: Annotated[str, Form(...)],
    outfit: UploadFile | None = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if budget <= 0:
        raise HTTPException(422, "Budget must be greater than zero")
    
    data = {
        "budget": budget,
        "total_budget": budget,
        "occasion": occasion,
        "style": style,
        "has_image": outfit is not None and outfit.filename != ""
    }
    
    data_obj = type("JewelryInput", (), data)()
    result = jewelry_plan(data_obj)
    
    image_bytes = None
    if outfit and outfit.filename:
        if outfit.content_type not in {"image/jpeg", "image/png", "image/webp", "image/jpg"}:
            raise HTTPException(415, "Outfit image must be JPG, PNG, or WebP")
        image_bytes = await outfit.read()
        if len(image_bytes) > 5 * 1024 * 1024:
            raise HTTPException(413, "Image file exceeds 5 MB limit")
        data["image_name"] = outfit.filename

    result = gemini.improve(result, json.dumps(data), image_bytes, outfit.content_type if outfit else None)
    rec_id = save_rec(db, user, "jewelry", data, result)
    return serialize_result(result, rec_id)

# --- History & Details Endpoints ---
@router.get("/api/recommendations-details/{recommendation_id}")
@router.get("/recommendations-details/{recommendation_id}")
def recommendation_details(recommendation_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    r = db.query(Recommendation).filter(Recommendation.id == recommendation_id, Recommendation.user_id == user.id).first()
    if not r:
        raise HTTPException(404, "Recommendation not found")
    return {
        "id": r.id,
        "category": r.category,
        "query": json.loads(r.query_json),
        "result": json.loads(r.result_json),
        "created_at": r.created_at.isoformat() if r.created_at else None
    }

@router.get("/api/history")
@router.get("/api/recommendation-history")
@router.get("/recommendation-history")
def recommendation_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Recommendation).filter(Recommendation.user_id == user.id).order_by(Recommendation.created_at.desc()).limit(50).all()
    return [
        {
            "id": r.id,
            "category": r.category,
            "query": json.loads(r.query_json),
            "result": json.loads(r.result_json),
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in rows
    ]

@router.delete("/api/history/clear")
@router.post("/api/history/clear")
def clear_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Recommendation).filter(Recommendation.user_id == user.id).delete()
    db.commit()
    return {"message": "Budget history cleared successfully"}

@router.get("/api/history/export")
def export_history(format: str = "json", user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Recommendation).filter(Recommendation.user_id == user.id).order_by(Recommendation.created_at.desc()).all()
    data = [
        {
            "id": r.id,
            "category": r.category,
            "query": json.loads(r.query_json),
            "result": json.loads(r.result_json),
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in rows
    ]
    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "user": user.username,
        "total_records": len(data),
        "history": data
    }


# --- Session info & data ---
@router.get("/api/session-info")
@router.get("/session-info")
def session_info(user: User = Depends(get_current_user)):
    return {
        "authenticated": True,
        "user_id": user.id,
        "username": user.username,
        "email": user.email
    }

@router.get("/api/session-data")
@router.get("/session-data")
def session_data(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = db.query(Recommendation).filter(Recommendation.user_id == user.id).count()
    recent = db.query(Recommendation).filter(Recommendation.user_id == user.id).order_by(Recommendation.created_at.desc()).limit(5).all()
    return {
        "user": {"id": user.id, "username": user.username, "email": user.email},
        "history_count": count,
        "recent_plans": [
            {
                "id": r.id,
                "category": r.category,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "title": json.loads(r.result_json).get("title", f"{r.category.title()} Plan"),
                "budget": json.loads(r.result_json).get("total_budget", 0)
            }
            for r in recent
        ]
    }

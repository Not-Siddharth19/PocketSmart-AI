from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import get_settings
from .database import init_db
from .routers import pages, auth, planners

settings=get_settings()
BASE=Path(__file__).resolve().parent
app=FastAPI(title=settings.app_name,version="1.0.0",description="AI-powered budget recommendation assistant")
app.add_middleware(CORSMiddleware,allow_origins=settings.cors_list,allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
app.mount("/static",StaticFiles(directory=str(BASE/"static")),name="static")
app.include_router(pages.router)
app.include_router(auth.router)
app.include_router(planners.router)

@app.on_event("startup")
def startup(): init_db()

@app.get("/api/health",tags=["system"])
def health(): return {"status":"ok","app":settings.app_name}

if __name__=="__main__":
    import uvicorn
    uvicorn.run("app.main:app",host="127.0.0.1",port=8000,reload=True)

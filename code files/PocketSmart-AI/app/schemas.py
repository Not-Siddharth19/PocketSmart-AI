from pydantic import BaseModel, Field

class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    email: str
    password: str = Field(min_length=6, max_length=128)

class LoginIn(BaseModel):
    username: str
    password: str

class PasswordUpdateIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)

class PlannerResponse(BaseModel):
    category: str
    title: str
    summary: str
    budget: float
    total_estimate: float
    recommendations: list[dict]
    allocation: list[dict] = []
    ai_enabled: bool
    sources: list[str] = []

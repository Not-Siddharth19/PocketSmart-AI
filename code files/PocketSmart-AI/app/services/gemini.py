import json
from .recommendations import PlannerResult
from .providers import get_shopping_links
from ..config import get_settings

class GeminiService:
    def __init__(self):
        self.settings = get_settings()
        self.client = None
        if self.settings.use_gemini and self.settings.gemini_api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.settings.gemini_api_key)
            except Exception:
                self.client = None

    @property
    def enabled(self) -> bool:
        return self.client is not None

    def improve(self, result: PlannerResult, prompt_context: str, image_bytes: bytes | None = None, mime_type: str | None = None) -> PlannerResult:
        if not self.client:
            return result
        try:
            from google.genai import types
            
            system_prompt = f"""
You are PocketSmart AI, an intelligent budget recommendation assistant.
The user requested a budget plan.
Category: {result.category}
Budget: {result.total_budget}

Analyze the user's requirements (and outfit image if provided).
Return ONLY valid JSON matching this exact structure:
{{
  "title": "{result.title}",
  "summary": "Detailed, friendly budget summary personalized to the input",
  "outfit_analysis": {{
     "colors": ["Primary Color", "Secondary Color"],
     "style": "Detected Style (e.g., Traditional Festive / Modern Casual / Cocktail Glam)",
     "formality": "Formality Level (e.g., Formal / Semi-Formal / Casual)"
  }},
  "additional_suggestions": [
     "Tip 1 for saving budget and shopping smartly",
     "Tip 2 for aesthetics and coordination",
     "Tip 3"
  ],
  "styling_tips": [
     "Jewelry coordination tip 1",
     "Tip 2"
  ]
}}
User Input details: {prompt_context}
"""
            contents = [system_prompt]
            if image_bytes:
                contents.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type or "image/jpeg"))

            response = self.client.models.generate_content(
                model=self.settings.gemini_model,
                contents=contents
            )
            raw = getattr(response, "text", "") or ""
            start, end = raw.find("{"), raw.rfind("}")
            if start >= 0 and end > start:
                parsed = json.loads(raw[start:end+1])
                if parsed.get("summary"):
                    result.summary = parsed["summary"]
                if parsed.get("outfit_analysis") and isinstance(parsed["outfit_analysis"], dict):
                    result.outfit_analysis = parsed["outfit_analysis"]
                if parsed.get("additional_suggestions") and isinstance(parsed["additional_suggestions"], list):
                    result.additional_suggestions = parsed["additional_suggestions"]
                if parsed.get("styling_tips") and isinstance(parsed["styling_tips"], list):
                    result.styling_tips = parsed["styling_tips"]
            return result
        except Exception:
            return result

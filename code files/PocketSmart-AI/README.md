# PocketSmart AI

A modular FastAPI + Jinja2 budgeting assistant for Home Interior, Party Planning, and Jewelry recommendations.

## Features
- Registration, login, logout and JWT authentication
- SQLite persistence for users and recommendation history
- Home, Party and Jewelry planners
- Optional outfit-image analysis for Jewelry
- Gemini integration through the official `google-genai` SDK
- Local fallback recommendations when Gemini is not configured or unavailable
- Provider-aware outbound search links for Amazon, IKEA, Flipkart, Swiggy, Zomato and OYO
- Responsive browser UI
- API docs at `/docs`

## Important
The supplied project document names Gemini 1.5 Flash Pro. Gemini model availability changes over time, so the implementation keeps the model configurable through `GEMINI_MODEL`. The default is a currently available Flash model. The application does not hard-code shopping inventory or pretend that a third-party store API was called when no such API credentials are configured.

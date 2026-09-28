# Antigravity setup

1. Install Python 3.11+ and Git on Windows.
2. Open the `PocketSmart-AI` folder in Antigravity.
3. Open its integrated terminal.
4. Create the environment:
   `py -m venv .venv`
5. On PowerShell, if script execution is blocked, either use `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` for the current terminal, or skip activation and use `.venv\Scripts\python.exe` directly.
6. Install packages:
   `.venv\Scripts\python.exe -m pip install -r requirements.txt`
7. Copy `.env.example` to `.env`.
8. Add your Gemini API key to `.env` if you want live Gemini generation. Keep `.env` private and never commit it.
9. Start:
   `.venv\Scripts\python.exe -m uvicorn app.main:app --reload`
10. Open `http://127.0.0.1:8000` and register a local account.
11. API documentation: `http://127.0.0.1:8000/docs`.

## Test
Run:
` .venv\Scripts\python.exe -m pytest -q `

## No-key mode
The app intentionally works without a Gemini key. Planner endpoints use deterministic local budget logic and store history. Once `GEMINI_API_KEY` is configured, the Gemini service enriches the generated plan.

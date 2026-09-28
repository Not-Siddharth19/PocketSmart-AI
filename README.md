# PocketSmart AI

### Budget intelligence, with a little more thinking.

**PocketSmart AI** is a Generative AI-powered budget and recommendation assistant that helps users turn a fixed budget into practical, personalized plans.

Instead of simply asking an AI for suggestions, PocketSmart combines **structured budget calculations + recommendation logic + Generative AI** to produce useful results for real-world planning.

---

<div align="center">

### `SWTID-2026-3238`

**SmartBridge Project**

**Siddharth — Team Leader**
Sai Prasanna · Monish M · Thameem Ansari K

</div>

---

## The Idea

A budget usually starts with one number.

What happens next is the difficult part.

How much should go where?
What should be prioritized?
What can be skipped?
What would actually fit the budget?

**PocketSmart AI turns that single number into a plan.**

The application currently supports three planning experiences:

| Planner             | Purpose                                                            |
| ------------------- | ------------------------------------------------------------------ |
| **Home Interior**   | Plan interior requirements around a defined budget                 |
| **Party Planner**   | Allocate a budget across event requirements                        |
| **Jewelry Planner** | Generate jewelry recommendations based on occasion and preferences |

The system first builds a structured recommendation and can then use **Google Gemini** to add a layer of personalized AI insight.

---

## Why PocketSmart?

Most recommendation systems begin with AI.

PocketSmart begins with the **budget**.

```text
Your Budget
     │
     ▼
Requirements
     │
     ▼
Budget Allocation
     │
     ▼
Recommendation Engine
     │
     ├───────────────┐
     ▼               ▼
Local Result      Gemini AI
     │               │
     └───────┬───────┘
             ▼
      Personalized Plan
```

This hybrid approach means the application can still produce a useful result even when the external AI service is unavailable.

---

# What It Can Do

### Budget Planning

Enter a budget and requirements, and PocketSmart generates a structured allocation instead of leaving the user with a blank search page.

### AI Recommendations

Google Gemini can enrich the generated plan with more personalized suggestions.

### Three Planning Modes

**Home Interior**

Plan rooms, requirements and spending priorities.

**Party**

Build an event plan while keeping individual expenses within the available budget.

**Jewelry**

Generate occasion and style-based recommendations, with optional outfit-image analysis.

### Recommendation History

Authenticated users can access previous recommendations instead of starting from zero every time.

### AI Fallback

The application is designed around a local-first recommendation foundation.

If Gemini is unavailable, the application can still return its locally generated result.

---

# Architecture

PocketSmart AI is intentionally modular.

```text
                         ┌──────────────────┐
                         │     Browser      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     FastAPI      │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       Authentication         Planners           History
              │                   │                   │
              ▼                   ▼                   ▼
             JWT           Budget Logic          SQLite
                                  │
                                  ▼
                           Recommendation
                                  │
                           ┌──────┴──────┐
                           ▼             ▼
                         Local        Gemini
                         Logic           AI
                           └──────┬──────┘
                                  ▼
                              Final Plan
```

---

# Technology

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| Backend        | FastAPI                          |
| Frontend       | Jinja2, HTML, CSS, JavaScript    |
| Database       | SQLite                           |
| ORM            | SQLAlchemy                       |
| Authentication | JWT                              |
| AI             | Google Gemini / Google GenAI SDK |
| Testing        | Pytest, HTTPX                    |
| Runtime        | Python 3.11+                     |
| Development    | VS Code / Antigravity            |

---

# Project Structure

```text
PocketSmart-AI/
│
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── schemas.py
│   │
│   ├── models/
│   ├── routers/
│   ├── services/
│   ├── templates/
│   └── static/
│
├── tests/
│
├── requirements.txt
├── .env.example
├── README.md
└── antigravity.md
```

---

# Getting Started

## 1. Clone

```bash
git clone <your-repository-url>
cd PocketSmart-AI
```

## 2. Create the Virtual Environment

### Windows

```powershell
py -m venv .venv
```

If PowerShell blocks `.venv\Scripts\activate`, you **do not need to change the Windows execution policy**.

Run the environment's Python directly instead:

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

This is also the recommended approach for the project.

---

## 3. Configure Environment Variables

Create `.env` from the example:

```powershell
Copy-Item .env.example .env
```

Add your Gemini API key if live Gemini integration is required:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit `.env` or expose your API key publicly.

---

## 4. Install Dependencies

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

---

## 5. Start PocketSmart AI

```powershell
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Open the application:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Testing

Run the test suite:

```powershell
.venv\Scripts\python.exe -m pytest -q
```

Testing covers areas including:

* Application startup
* Authentication
* JWT protection
* Planner endpoints
* Budget validation
* Image upload validation
* Recommendation history
* AI fallback behavior

---

# Security

PocketSmart AI keeps configuration and credentials outside the application source code.

### Never commit:

```text
.env
API keys
JWT secrets
private credentials
```

Use:

```text
.env.example
```

as the template for required environment variables.

---

# SmartBridge Project

PocketSmart AI follows the required **eight-phase SmartBridge project structure**:

```text
01  Brainstorming & Ideation
02  Requirement Analysis
03  Project Design
04  Project Planning
05  Project Development
06  Project Testing
07  Project Documentation
08  Project Demonstration
```

The repository is organized phase-by-phase so that the development process is visible alongside the final application.

---

# Team

### `SWTID-2026-3238`

**Siddharth**
*Team Leader*

**Sai Prasanna**
*Team Member*

**Monish M**
*Team Member*

**Thameem Ansari K**
*Team Member*

---

# Project Workflow

```text
INPUT
  │
  │  Budget + Requirements
  ▼
UNDERSTAND
  │
  │  Planner-specific processing
  ▼
ALLOCATE
  │
  │  Structured budget calculation
  ▼
RECOMMEND
  │
  ├── Local recommendation
  │
  └── Gemini enrichment
  │
  ▼
PRESENT
  │
  │  Practical personalized result
  ▼
REMEMBER
     Recommendation History
```

---

# Roadmap

Potential future improvements include:

* More planning categories
* Improved recommendation personalization
* Advanced budget optimization
* Additional AI providers
* Exportable recommendation reports
* Spending analytics
* Mobile-focused interface
* Advanced image understanding
* User preference profiles

---

# The Principle

> **Don't ask AI to decide the budget.
> Give AI a budget worth thinking about.**

PocketSmart AI is built around that idea.

A number becomes a plan.
A plan becomes recommendations.
And recommendations become something the user can actually use.

---

## Project Status

**SmartBridge Project — Development / Demonstration**

**Team Code:** `SWTID-2026-3238`

**Project:** `PocketSmart AI`

**Team Leader:** `Siddharth`

---

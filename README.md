# PocketSmart AI

### Budget intelligence, with a little more thinking.

**PocketSmart AI** is a Generative AI-powered budget and recommendation assistant that transforms a fixed budget and user requirements into practical, personalized planning recommendations.

The project combines **structured budget allocation, recommendation logic and Generative AI** rather than relying entirely on AI-generated answers.

---

<div align="center">

### `SWTID-2026-3238`

**SmartBridge Project**

**Siddharth — Team Leader**

Sai Prasanna · Monish M · Thameem Ansari K

</div>

---

# Project Overview

A budget starts with a number.

The difficult part is deciding what that number should actually do.

PocketSmart AI helps users convert a budget into a structured plan for:

| Planner             | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| **Home Interior**   | Plan interior requirements around a defined budget |
| **Party Planner**   | Allocate spending across event requirements        |
| **Jewelry Planner** | Generate occasion and style-based recommendations  |

The application combines local recommendation logic with **Google Gemini** for optional AI-powered enrichment.

---

# The Core Idea

```text
                    USER INPUT
                        │
                        ▼
              Budget + Requirements
                        │
                        ▼
                 Budget Analysis
                        │
                        ▼
             Recommendation Engine
                    ┌───┴───┐
                    │       │
                    ▼       ▼
                 Local   Gemini AI
                 Logic   Enrichment
                    │       │
                    └───┬───┘
                        ▼
               Personalized Plan
                        │
                        ▼
                 Recommendation
                     History
```

The local recommendation layer provides the foundation.

Gemini adds personalization when available.

This means the application can still provide a useful result when the external AI service is unavailable.

---

# SmartBridge Phase-Wise Development

The complete project follows the eight phases specified for the SmartBridge submission.

```text
01 ─ Brainstorming & Ideation
02 ─ Requirement Analysis
03 ─ Project Design
04 ─ Project Planning
05 ─ Project Development
06 ─ Project Testing
07 ─ Project Documentation
08 ─ Project Demonstration
```

---

# Phase 01 — Brainstorming & Ideation

### Objective

Identify a practical problem that can be addressed using Generative AI and budget-aware recommendation logic.

### Problem Identified

Users often need to plan purchases or events with a limited budget.

Examples include:

* Home interior planning
* Party and event planning
* Jewelry selection

Manually comparing requirements, allocating expenses and deciding priorities can be time-consuming.

### Proposed Idea

Create a single application that accepts:

```text
Budget
+
Requirements
+
Preferences
        ↓
Structured Recommendations
        ↓
AI-Powered Personalization
```

### Project Objectives

* Simplify budget planning.
* Generate personalized recommendations.
* Combine deterministic calculations with Generative AI.
* Maintain recommendation history.
* Provide multiple planning categories.

### Output

**PocketSmart AI** was selected as the proposed project.

---

# Phase 02 — Requirement Analysis

## Functional Requirements

The application should provide:

* User registration
* User login
* JWT authentication
* Home Interior Planner
* Party Planner
* Jewelry Planner
* Optional outfit-image upload
* AI-powered recommendations
* Local recommendation fallback
* Recommendation history
* Provider/search links

## Non-Functional Requirements

The system should provide:

* Responsive UI
* Modular backend architecture
* Secure credential handling
* Environment-based API configuration
* Graceful AI failure handling
* Maintainable project structure

## Software Requirements

| Requirement          | Technology                    |
| -------------------- | ----------------------------- |
| Programming Language | Python                        |
| Backend              | FastAPI                       |
| Frontend             | Jinja2, HTML, CSS, JavaScript |
| Database             | SQLite                        |
| ORM                  | SQLAlchemy                    |
| Authentication       | JWT                           |
| AI                   | Google Gemini                 |
| Testing              | Pytest, HTTPX                 |

---

# Phase 03 — Project Design

## System Architecture

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
             JWT            Budget Logic          SQLite
                                  │
                                  ▼
                           Recommendation
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                       Local            Gemini
                       Logic               AI
                         └────────┬────────┘
                                  ▼
                           Final Result
```

## Application Structure

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

## Database Design

SQLite is used for local persistence.

The database stores:

* User accounts
* Recommendation history
* User-specific recommendation records

SQLAlchemy provides the database abstraction layer.

---

# Phase 04 — Project Planning

The development was divided into manageable stages.

| Stage | Activity                    |
| ----- | --------------------------- |
| 1     | Project ideation            |
| 2     | Requirement analysis        |
| 3     | Architecture and UI design  |
| 4     | Backend setup               |
| 5     | Database and authentication |
| 6     | Planner development         |
| 7     | Gemini integration          |
| 8     | Frontend integration        |
| 9     | Testing                     |
| 10    | Documentation               |
| 11    | Demonstration               |

## Team Responsibilities

### Siddharth — Team Leader

Project coordination, architecture, integration and final project management.

### Sai Prasanna — Team Member

Frontend and planner interface development.

### Monish M — Team Member

Backend, API and database development.

### Thameem Ansari K — Team Member

Testing, documentation and demonstration support.

---

# Phase 05 — Project Development

## Frontend

The frontend uses:

* Jinja2
* HTML
* CSS
* JavaScript

It provides:

* Landing page
* Authentication screens
* Planner forms
* Recommendation results
* Recommendation history

## Backend

FastAPI handles:

* API routing
* Authentication
* Planner requests
* Recommendation processing
* Database operations
* AI integration

## Home Interior Planner

Users provide their budget and interior requirements.

The system creates a structured plan based on the available budget.

## Party Planner

Users provide event information and budget details.

The application allocates spending across relevant event requirements.

## Jewelry Planner

Users can provide:

* Budget
* Occasion
* Style
* Preferences
* Optional outfit image

The system generates recommendations based on the supplied information.

## Generative AI

Google Gemini is used as an optional intelligence layer.

The AI receives structured planning information and generates additional personalized recommendations.

The API key is kept in environment variables rather than being exposed in frontend code.

---

# Phase 06 — Project Testing

Testing focuses on validating both individual components and the complete application flow.

## Testing Areas

### Application

* Startup
* Routing
* Error handling

### Authentication

* Registration
* Login
* JWT authentication
* Protected routes

### Planners

* Home Interior
* Party
* Jewelry

### Validation

* Budget values
* Required fields
* Image upload
* Invalid input

### AI

* Gemini availability
* Gemini response handling
* Local fallback

### Database

* User creation
* Recommendation storage
* Recommendation history

## Test Command

```powershell
.venv\Scripts\python.exe -m pytest -q
```

## API Documentation

When the application is running:

```text
http://127.0.0.1:8000/docs
```

---

# Phase 07 — Project Documentation

The project documentation contains:

```text
Docs/
│
├── Project Report
├── Setup Documentation
└── Supporting Documents

Phase wise docs/
│
├── Phase 01
├── Phase 02
├── Phase 03
├── Phase 04
├── Phase 05
├── Phase 06
├── Phase 07
└── Phase 08
```

The repository is maintained phase-wise so the development process can be reviewed from ideation through demonstration.

## GitHub Submission

The project repository is public and contains:

* Application source code
* Documentation
* Phase-wise project material
* README
* Configuration examples

**Repository:**

`https://github.com/Not-Siddharth19/PocketSmart-AI`

---

# Phase 08 — Project Demonstration

The final demonstration should show the complete application workflow.

## Demonstration Flow

```text
Introduction
     ↓
Project Name
     ↓
Team & Team Code
     ↓
Problem Statement
     ↓
Proposed Solution
     ↓
Application Interface
     ↓
Planner Demonstration
     ↓
Budget Calculation
     ↓
AI Recommendation
     ↓
History
     ↓
Final Output
```

## Demo Should Explain

* Project name
* Team code
* Team members
* Purpose of the project
* Problem being solved
* Uses and benefits
* Technologies used
* Working process
* AI integration
* Final output

## Demo Video

The demonstration video should include:

* Screen sharing
* Student voice-over
* Project explanation
* Complete working process
* Final output

The video should be uploaded to Google Drive with appropriate viewing permissions.

---

# Technology Stack

| Layer          | Technology                   |
| -------------- | ---------------------------- |
| Language       | Python 3.11+                 |
| Backend        | FastAPI                      |
| Frontend       | Jinja2 + HTML/CSS/JavaScript |
| Database       | SQLite                       |
| ORM            | SQLAlchemy                   |
| Authentication | JWT                          |
| AI             | Google Gemini                |
| Testing        | Pytest + HTTPX               |
| Development    | VS Code / Antigravity        |

---

# Getting Started

## Clone the Repository

```bash
git clone https://github.com/Not-Siddharth19/PocketSmart-AI.git
cd PocketSmart-AI
```

## Create Virtual Environment

### Windows

```powershell
py -m venv .venv
```

## Install Dependencies

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Configure Environment

```powershell
Copy-Item .env.example .env
```

Add the Gemini API key when required:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit `.env`.

## Run

```powershell
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Security

Never commit:

```text
.env
API keys
JWT secrets
Private credentials
```

Use `.env.example` as the configuration template.

---

# Project Workflow

```text
                  ┌───────────────┐
                  │     INPUT     │
                  │ Budget + Need │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │    ANALYZE    │
                  │ Requirements │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │    ALLOCATE   │
                  │ Budget Logic  │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  RECOMMEND    │
                  │ Local + Gemini│
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │    PRESENT    │
                  │ Final Result  │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │    HISTORY    │
                  │ Saved Result  │
                  └───────────────┘
```

---

# Roadmap

Future development may include:

* Additional planning categories
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

A number becomes a plan.

A plan becomes recommendations.

And recommendations become something the user can actually use.

---

# Team

## `SWTID-2026-3238`

**Siddharth**
*Team Leader*

**Sai Prasanna**
*Team Member*

**Monish M**
*Team Member*

**Thameem Ansari K**
*Team Member*

---

# Project Status

**SmartBridge Project — Development / Demonstration**

**Project:** `PocketSmart AI`

**Team Code:** `SWTID-2026-3238`

**Team Leader:** `Siddharth`

---

<div align="center">

**PocketSmart AI**

*Budget intelligence, with a little more thinking.*

</div>

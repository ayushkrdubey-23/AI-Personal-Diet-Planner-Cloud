# AI-Powered Personal Diet Planner with Cloud Storage

A full-stack, cloud-backed student project for generating personalized general-wellness diet plans, saving plan history, tracking daily habits, managing user profile data, and storing file metadata securely per user.

> **Project status:** Current MVP completed through the FastAPI cloud-files API integration stage. The application is functional for local development and demonstration. File content currently uses a **local browser-storage simulation**, while file metadata is stored in Firestore and exposed through FastAPI. This is documented deliberately so the project does not overclaim production object storage.

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Features](#features)
- [Application Flow](#application-flow)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Cloud Computing Concepts Demonstrated](#cloud-computing-concepts-demonstrated)
- [Project Structure](#project-structure)
- [Firestore Data Model](#firestore-data-model)
- [REST API](#rest-api)
- [AI Recommendation Logic](#ai-recommendation-logic)
- [Authentication and Security](#authentication-and-security)
- [Local File Storage Simulation](#local-file-storage-simulation)
- [Local Development Setup](#local-development-setup)
- [Testing](#testing)
- [Screenshots and Proof](#screenshots-and-proof)
- [Deployment Roadmap](#deployment-roadmap)
- [Scalability](#scalability)
- [Limitations](#limitations)
- [Future Scope](#future-scope)
- [GitHub Workflow](#github-workflow)
- [Academic / Demo Notes](#academic--demo-notes)

## Overview

The **AI-Powered Personal Diet Planner with Cloud Storage** is designed as a cloud-computing learning project that combines a React frontend, FastAPI backend, Firebase Authentication, Firestore, and an AI/rule-based recommendation layer.

The application follows this user journey:

`Register / Login → Profile → Generate Plan → Save Plan → Daily Tracker → Progress Dashboard → Cloud Files`

The generated plans are intended for **general wellness and educational demonstration only** and are not medical advice, diagnosis, or treatment.

## Problem Statement

Many basic diet-planning applications provide generic meal suggestions but do not combine personalization, authenticated user data, cloud-backed history, daily tracking, and a clear cloud architecture in one student-friendly application.

This project addresses that gap by connecting user profile information and food preferences to a personalized recommendation workflow, persistent cloud records, habit tracking, and a REST API backend.

## Objectives

1. Collect basic user profile and dietary-preference information.
2. Generate a personalized general-wellness meal plan.
3. Save and retrieve previous plans for the authenticated user.
4. Track daily meal completion and water intake.
5. Store user-specific file metadata in Firestore.
6. Expose core operations through authenticated FastAPI REST APIs.
7. Demonstrate cloud concepts such as authentication, managed database, APIs, storage, authorization, scalability, and deployment architecture.

## Features

### User and Authentication
- Firebase Email/Password authentication.
- Protected React routes.
- Firebase ID token sent to the FastAPI backend.
- Backend verifies the token before protected operations.
- User-specific Firestore access rules.

### Profile Management
- Name, age, height, weight, activity level, dietary preference, goal, and optional preferences/allergies.
- Profile data persisted in the `users` collection.
- React profile page can use FastAPI as the primary API path with Firestore fallback.

### AI / Recommendation Engine
- General-wellness rule-based diet recommendation engine.
- Personalized by profile and dietary preferences.
- Structured output for breakfast, lunch, snack, dinner, nutrition summary, hydration reminder, and disclaimer.
- Local frontend fallback keeps plan generation usable when the backend is temporarily unavailable.

### Saved Plans
- Save generated plans to Firestore.
- Retrieve all plans belonging to the signed-in user.
- Retrieve an individual plan.
- Delete a saved plan.
- FastAPI endpoints are used as the primary REST path on the current frontend integration.

### Daily Tracker
- Daily meal completion tracking.
- Water-serving tracking.
- Daily notes.
- Date-based records in Firestore.
- Dashboard aggregation for recent progress.

### Progress Dashboard
- Current goal and diet preference.
- Saved-plan count.
- Tracked-day count.
- Average meal completion.
- Average water intake.
- Today's progress.
- Recent 7-day tracking summary.
- Latest and previous saved plans.
- Uploaded-file count.

### Cloud Files
- Supported demo types: JPG, PNG, WEBP, PDF, TXT.
- Maximum demo upload size: 2 MB.
- File content is stored locally in the browser for the current MVP.
- File metadata is stored in Firestore and exposed through FastAPI.
- Download and delete support for local file content.
- User isolation for metadata operations.

## Application Flow

```text
User
  │
  ├── Register / Login
  │        │
  │        └── Firebase Authentication
  │
  └── React Application
           │
           ├── Profile
           ├── Generate Plan
           │      │
           │      ├── FastAPI Recommendation API
           │      └── Local JS Fallback Engine
           │
           ├── Saved Plans
           │      └── FastAPI → Firestore
           │
           ├── Daily Tracker
           │      └── Firestore
           │
           ├── Progress Dashboard
           │      └── Profile + Plans + Tracker + File Metadata
           │
           └── Cloud Files
                  ├── Local Browser Storage (file bytes, current MVP)
                  └── FastAPI → Firestore (metadata)
```

## Architecture

```text
┌──────────────────────────────┐
│        React / Vite UI       │
│  Pages + Context + Services  │
└──────────────┬───────────────┘
               │ HTTPS / JSON
               ▼
┌──────────────────────────────┐
│         FastAPI API          │
│ Auth + Validation + Routes   │
└───────┬──────────┬───────────┘
        │          │
        │          └────────────────────┐
        ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│ Firebase Admin  │             │ Recommendation  │
│ Token Verify    │             │ Engine          │
└────────┬────────┘             └─────────────────┘
         │
         ▼
┌──────────────────────────────┐
│          Firestore           │
│ users / dietPlans /          │
│ dailyTracker / userFiles     │
└──────────────────────────────┘

Cloud Files (current MVP):
React → Local Browser Storage for bytes
React → FastAPI → Firestore for metadata
```

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | UI and client-side routing |
| Styling | CSS | Responsive application interface |
| Authentication | Firebase Authentication | Email/password user authentication |
| Database | Cloud Firestore | User, plan, tracker and file metadata records |
| Backend | Python + FastAPI | REST API, validation and business logic |
| Admin SDK | Firebase Admin SDK | Verify Firebase ID tokens and access Firestore securely |
| AI layer | Rule-based recommendation engine | Personalized general-wellness plan generation |
| HTTP client | Fetch-based service layer | Frontend-to-backend communication |
| Testing | Pytest + HTTPX | Backend smoke/API tests |
| Version Control | Git + GitHub | Source control and proof of incremental development |

## Cloud Computing Concepts Demonstrated

### Authentication as a managed cloud service
Firebase Authentication handles user sign-in while the frontend receives an ID token.

### Cloud database
Firestore stores user-specific application records instead of relying only on local browser data.

### REST API / client-server architecture
React is the client and FastAPI acts as the application server exposing JSON endpoints.

### Authorization and user isolation
The backend reads the authenticated Firebase UID from the verified token. The Firestore rules also restrict users to their own documents.

### Storage abstraction
The project demonstrates the separation between database metadata and file content. The current MVP uses local browser storage for bytes and Firestore for metadata, making the migration to object storage straightforward later.

### Scalability concepts
The architecture can later move to a managed container/serverless backend, object storage, CDN, caching, asynchronous jobs, and autoscaling without redesigning the main user workflow.

### Environment configuration and secrets
Public frontend Firebase configuration is placed in Vite environment variables. The Firebase Admin service-account key is kept outside Git under `backend/secrets/`.

## Project Structure

> The current implementation keeps the React application directly at the project root instead of using a separate `frontend/` directory.

```text
AI-Personal-Diet-Planner-Cloud/
│
├── src/
│   ├── ai_engine/
│   │   └── dietEngine.js
│   ├── components/
│   │   ├── AppLayout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── GeneratePlan.jsx
│   │   ├── PlanResult.jsx
│   │   ├── SavedPlans.jsx
│   │   ├── DailyTracker.jsx
│   │   └── CloudFiles.jsx
│   ├── services/
│   │   ├── apiService.js
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── planService.js
│   │   ├── planApiService.js
│   │   ├── profileApiService.js
│   │   ├── trackerService.js
│   │   ├── storageService.js
│   │   ├── fileMetadataService.js
│   │   ├── fileApiService.js
│   │   └── exportService.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── firebase.js
│   └── ...
│
├── backend/
│   ├── routes/
│   │   ├── health.py
│   │   ├── plans.py
│   │   ├── profile.py
│   │   └── files.py
│   ├── services/
│   │   ├── firebase_admin.py
│   │   ├── auth_service.py
│   │   └── diet_engine.py
│   ├── models/
│   │   └── plan_models.py
│   ├── secrets/
│   │   └── serviceAccountKey.json   # local only; never commit
│   └── app.py
│
├── tests/
│   └── test_api.py
│
├── docs/
├── package.json
├── vite.config.js
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## Firestore Data Model

### `users/{uid}`

Stores the authenticated user's profile and preferences.

Typical fields:

- `uid`
- `name`
- `email`
- `age`
- `height`
- `weight`
- `activity`
- `dietaryPreference`
- `goal`
- `allergies`
- `preferences`

### `dietPlans/{planId}`

Stores generated diet plans linked to the authenticated user.

Important isolation field:

- `userId` = Firebase UID

### `dailyTracker/{uid_date}`

Stores daily habit-tracking information.

Typical fields:

- `userId`
- `date`
- `mealCompletion`
- `waterServings`
- `note`
- `updatedAt`

### `userFiles/{fileId}`

Stores file metadata.

Typical fields:

- `userId`
- `localFileId`
- `filename`
- `storagePath`
- `size`
- `contentType`
- `storageMode`
- `uploadedAt`

## REST API

Base URL during local development:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### Health

`GET /api/health`

Checks backend availability.

### Generate Plan

`POST /api/plans/generate`

Authenticated endpoint for generating a general-wellness plan from profile/preferences.

### Saved Plans

`GET /api/plans` — list current user's saved plans.

`GET /api/plans/{plan_id}` — retrieve one plan owned by the current user.

`DELETE /api/plans/{plan_id}` — delete one plan owned by the current user.

### Profile

`GET /api/profile` — retrieve current user's profile.

`PUT /api/profile` — update current user's profile.

### Cloud File Metadata

`POST /api/upload` — create/reuse metadata for a locally stored file.

`GET /api/files` — list metadata for the current user.

`DELETE /api/files/{file_id}` — delete metadata owned by the current user.

### Authentication

Protected endpoints expect:

```http
Authorization: Bearer <firebase-id-token>
```

The backend verifies the Firebase token and uses the verified UID for authorization.

## AI Recommendation Logic

The recommendation engine is intentionally simple and explainable for a student cloud-computing project.

Conceptually:

```text
User Profile
   │
   ├── Age / activity
   ├── Goal
   ├── Dietary preference
   └── Allergies / preferences
          │
          ▼
Rule Matching
          │
          ▼
Meal Templates
          │
          ▼
Personalized Daily Plan
          │
          ▼
Nutrition Summary + Hydration Reminder
```

The system is a **general-wellness educational tool**. It should not be presented as a clinical nutrition system or as a replacement for professional medical or dietary guidance.

## Authentication and Security

Current implementation includes:

- Firebase Email/Password authentication.
- Protected frontend routes.
- Firebase ID-token verification on FastAPI protected routes.
- User-specific Firestore rules.
- Backend authorization based on the verified Firebase UID rather than trusting a client-supplied UID.
- Input validation with Pydantic.
- Explicit CORS origins for local development.
- Service-account credentials excluded through `.gitignore`.

### Security checklist before public deployment

- Never commit `.env` or `serviceAccountKey.json`.
- Replace development CORS origins with production domains.
- Use HTTPS in production.
- Move file bytes from local browser storage to managed object storage.
- Add file-content scanning for production uploads.
- Add rate limiting for public APIs.
- Add structured logging and monitoring.
- Review Firestore rules with test users before publishing.

## Local File Storage Simulation

The current MVP intentionally separates **file content** from **file metadata**.

### File content
Stored in the browser using local storage mechanisms so the project can be demonstrated without requiring a paid or separately provisioned object-storage service.

### File metadata
Stored in Firestore and synchronized through the FastAPI `/api/upload`, `/api/files`, and `/api/files/{id}` endpoints.

### Why this design is useful

It demonstrates the cloud architecture boundary while keeping the project runnable for student-level local demonstrations. A future object-storage implementation can keep the same metadata model and replace the local byte-storage service.

## Local Development Setup

### Prerequisites

- Node.js and npm
- Python 3.10+
- Git
- A Firebase project with Email/Password Authentication enabled
- A Firestore database

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd AI-Personal-Diet-Planner-Cloud
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure frontend environment variables

Create `.env` from `.env.example` and fill in your Firebase web-app configuration.

The frontend should run on:

```text
http://localhost:5173
```

### 4. Configure backend credentials

Place the Firebase service-account JSON file at:

```text
backend/secrets/serviceAccountKey.json
```

Do not commit this file.

### 5. Install backend dependencies

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Windows Command Prompt:

```cmd
.venv\Scripts\activate
pip install -r requirements.txt
```

### 6. Start FastAPI

```bash
python -m uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

Expected URLs:

```text
http://127.0.0.1:8000/
http://127.0.0.1:8000/api/health
http://127.0.0.1:8000/docs
```

### 7. Start React

In a second terminal:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

## Testing

### Backend syntax check

```bash
python -m compileall backend
```

### Automated smoke tests

```bash
pytest -q
```

The current smoke-test layer validates the root route, health endpoint, and OpenAPI docs availability.

### Manual functional testing

Use two test accounts and verify at minimum:

| Test | Expected result |
|---|---|
| Register user | Account is created |
| Login | User enters authenticated area |
| Open protected route while logged out | Redirect to public route/login |
| Save profile | Profile is stored for current UID |
| Generate plan | Personalized plan is returned |
| Save plan | Plan appears in Saved Plans |
| Retrieve saved plans | Only current user's plans appear |
| Delete plan | Selected plan is removed |
| Daily tracker | Daily progress persists |
| Upload valid file | Local file + Firestore metadata created |
| Upload invalid type | Upload is rejected |
| Upload oversized file | Upload is rejected |
| Retrieve files | Only current user's metadata appears |
| Delete file | Metadata and local file are removed |
| Token missing/invalid | Protected API returns unauthorized |

See `docs/TESTING-CHECKLIST.md` for the full validation table.

## Screenshots and Proof

For a strong GitHub/college submission, capture screenshots of:

- Landing page
- Register page
- Login page
- Profile form
- Generated diet plan
- Saved Plans
- Daily Tracker
- Progress Dashboard
- Cloud Files
- Firestore `users` record
- Firestore `dietPlans` record
- Firestore `dailyTracker` record
- Firestore `userFiles` metadata
- FastAPI `/docs`
- `/api/health` response
- Automated test results
- GitHub commit history
- GitHub repository home page

Recommended filenames are provided in `docs/SCREENSHOT-CHECKLIST.md`.

## Deployment Roadmap

### Student-friendly deployment architecture

```text
React frontend  →  static hosting / CDN
FastAPI backend →  managed Python web service
Firebase Auth   →  Firebase Authentication
Firestore       →  Firestore
File bytes      →  object storage in production
```

### AWS-style architecture for future expansion

```text
React → S3 + CloudFront
FastAPI → App Runner / ECS / Lambda
API → API Gateway
Database → DynamoDB or PostgreSQL
Files → S3
Authentication → Cognito or Firebase Auth
Logs → CloudWatch
```

Equivalent managed services can be mapped to Azure or GCP without changing the core client-server concept.

See `docs/CLOUD-DEPLOYMENT.md` for the deployment plan.

## Scalability

### Small usage

For classroom demonstrations, a single FastAPI instance plus Firebase services is sufficient.

### Medium usage

Move the backend to a managed service, enable application monitoring, add caching where useful, and store uploaded files in object storage.

### Large usage

Use a load balancer, autoscaling backend instances, managed database services, CDN, asynchronous background workers, object storage, caching, and message queues for high-volume operations such as file processing or plan generation.

See `docs/SCALABILITY.md` for a cloud-computing interview-oriented explanation.

## Limitations

1. The current project uses a local browser-storage simulation for file bytes instead of production object storage.
2. The recommendation engine is rule-based rather than a trained ML nutrition model.
3. The current automated tests are focused on backend smoke/API availability; full end-to-end browser testing is still a separate validation step.
4. Production deployment, monitoring, rate limiting, and large-scale file processing are future hardening steps.
5. The application provides general-wellness suggestions and should not be treated as medical advice.

## Future Scope

- Replace local file simulation with Firebase Storage or another object-storage service.
- Add real upload endpoints using multipart form-data and secure object-storage permissions.
- Add optional external AI generation behind the backend with secret-managed API keys.
- Add richer nutrition calculations and configurable meal databases.
- Add automated end-to-end testing.
- Add CI/CD with GitHub Actions.
- Add production monitoring, audit logging, rate limiting, and backup policies.
- Deploy frontend and backend to public cloud infrastructure.
- Add multilingual support and accessibility improvements.

## GitHub Workflow

Recommended repository name:

```text
AI-Powered-Personal-Diet-Planner-Cloud
```

Suggested repository description:

```text
Cloud-based AI-powered personal diet planning application with Firebase Authentication, Firestore, FastAPI REST APIs, daily tracking, personalized recommendations, and a cloud-ready storage architecture.
```

Suggested topics:

```text
cloud-computing
artificial-intelligence
react
vite
python
fastapi
firebase
firestore
rest-api
full-stack
cloud-application
```

Useful final commits can include:

```text
feat: add cloud files REST APIs
feat: connect cloud files to FastAPI
feat: add dashboard analytics
feat: add plan export support
docs: complete README and project documentation
test: expand backend integration coverage
chore: prepare project for deployment
```

## Academic / Demo Notes

During a viva or presentation, emphasize these points:

- **Why React?** For a responsive single-page client interface.
- **Why FastAPI?** For lightweight, modular REST APIs with Python.
- **Why Firebase Auth?** Managed authentication reduces the need to implement password handling manually.
- **Why Firestore?** Managed cloud NoSQL storage for user-specific application records.
- **Why local file simulation?** It keeps the current MVP demonstrable without requiring production object-storage provisioning while preserving the cloud metadata design.
- **How is user isolation achieved?** Firebase ID tokens identify users, the backend uses the verified UID, and Firestore rules restrict documents by that UID.
- **Where is AI used?** The recommendation engine converts profile and preference inputs into a personalized general-wellness meal plan.
- **What would change for production?** Managed object storage, HTTPS, rate limiting, monitoring, CI/CD, stronger upload security, and a production deployment architecture.

## Disclaimer

This project is an academic software demonstration for general wellness and educational use. Generated meal suggestions are not medical advice, diagnosis, or treatment. Users with medical conditions or special dietary requirements should rely on qualified professional guidance.

## Author

**Ayush Kumar Dubey**

B.Tech CSE Student Project

---

Made for learning **cloud computing, REST APIs, authentication, managed databases, storage architecture, and AI-assisted application development**.

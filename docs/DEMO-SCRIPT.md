# 5-Minute Project Demo Script

## 1. Introduction

"This project is an AI-Powered Personal Diet Planner with a cloud-backed architecture. It combines React, FastAPI, Firebase Authentication, Firestore, daily tracking, and a recommendation engine."

## 2. Authentication

Show registration and login. Explain that Firebase Authentication manages identity and the backend verifies the Firebase ID token.

## 3. Profile

Enter profile information and preferences. Explain that user-specific data is stored in Firestore.

## 4. Generate Plan

Generate a plan and show breakfast, lunch, snack, dinner, nutrition summary, hydration reminder, and wellness disclaimer.

Explain the FastAPI request path and local frontend fallback.

## 5. Saved Plans

Open Saved Plans and show that history is persistent for the signed-in user.

## 6. Daily Tracker + Dashboard

Complete a meal and water entry, then show dashboard analytics.

## 7. Cloud Files

Upload a small demo file. Explain clearly that the current MVP stores file bytes locally in the browser while Firestore stores cloud-backed metadata through FastAPI.

## 8. Swagger

Open `/docs` and demonstrate authenticated REST endpoints.

## 9. Cloud Computing Explanation

Point out authentication, managed database, REST API, user isolation, storage abstraction, environment variables, scalability and deployment architecture.

## 10. Closing

"The current version is an academic MVP designed to demonstrate cloud application architecture. Production expansion would move file bytes to object storage and add monitoring, rate limiting, CI/CD and stronger upload security."

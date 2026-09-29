from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.health import (
    router as health_router,
)

from backend.routes.plans import (
    router as plans_router,
)

from backend.routes.profile import (
    router as profile_router,
)


app = FastAPI(
    title="AI-Powered Personal Diet Planner API",
    description=(
        "REST API backend for the AI Personal Diet Planner "
        "cloud computing project."
    ),
    version="1.0.0",
)


# ------------------------------------------------------
# CORS
# ------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------
# Health Routes
# ------------------------------------------------------

app.include_router(
    health_router,
    prefix="/api",
)


# ------------------------------------------------------
# Diet Plan Routes
# ------------------------------------------------------

app.include_router(
    plans_router,
    prefix="/api",
)


# ------------------------------------------------------
# Profile Routes
# ------------------------------------------------------

app.include_router(
    profile_router,
    prefix="/api",
)


# ------------------------------------------------------
# Root
# ------------------------------------------------------

@app.get("/")
async def root():
    return {
        "message": (
            "AI Personal Diet Planner API is running"
        ),
        "docs": "/docs",
        "health": "/api/health",
    }
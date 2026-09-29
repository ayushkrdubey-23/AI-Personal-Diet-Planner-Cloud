from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.health import router as health_router


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
# Routes
# ------------------------------------------------------

app.include_router(
    health_router,
    prefix="/api",
)


@app.get("/")
async def root():
    return {
        "message": "AI Personal Diet Planner API is running",
        "docs": "/docs",
        "health": "/api/health",
    }
    
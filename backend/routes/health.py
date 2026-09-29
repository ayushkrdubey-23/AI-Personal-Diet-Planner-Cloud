from datetime import datetime, timezone

from fastapi import APIRouter


router = APIRouter(
    tags=["Health"]
)


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "AI Personal Diet Planner API",
        "timestamp": datetime.now(
            timezone.utc
        ).isoformat(),
    }

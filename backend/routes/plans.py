from fastapi import APIRouter, HTTPException

from backend.models.plan_models import (
    DietPlanResponse,
    PlanRequest,
)
from backend.services.diet_engine import generate_plan


router = APIRouter(
    prefix="/plans",
    tags=["Diet Plans"],
)


@router.post(
    "/generate",
    response_model=DietPlanResponse,
)
async def generate_diet_plan(
    request: PlanRequest,
):
    try:
        profile = request.model_dump()

        plan = generate_plan(profile)

        return plan

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate diet plan."
            ),
        ) from exc
    
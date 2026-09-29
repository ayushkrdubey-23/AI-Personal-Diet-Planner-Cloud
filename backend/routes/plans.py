from fastapi import APIRouter, Depends, HTTPException

from backend.models.plan_models import (
    DietPlanResponse,
    PlanRequest,
)
from backend.services.auth_service import (
    get_current_user,
)
from backend.services.diet_engine import (
    generate_plan,
)


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
    current_user: dict = Depends(
        get_current_user
    ),
):
    try:
        # The UID comes from the verified Firebase token.
        # We do NOT trust the user_id sent by the client.
        firebase_uid = current_user["uid"]

        profile = request.model_dump()

        profile["user_id"] = firebase_uid

        plan = generate_plan(profile)

        return plan

    except KeyError as exc:
        raise HTTPException(
            status_code=401,
            detail="Authenticated user UID was not found.",
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate diet plan.",
        ) from exc
    
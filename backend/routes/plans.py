from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

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


# ---------------------------------------------------------
# Firestore helper
# ---------------------------------------------------------

def get_firestore_database():
    """
    Return the initialized Firebase Admin Firestore client.
    """
    try:
        return firestore.client()
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Cloud database is currently unavailable.",
        ) from exc


# ---------------------------------------------------------
# Serialization helper
# ---------------------------------------------------------

def make_json_safe(value: Any) -> Any:
    """
    Convert Firestore/Python values into JSON-safe values.

    Firestore timestamps are converted to ISO strings.
    Dictionaries and lists are processed recursively.
    """

    if isinstance(value, datetime):
        return value.isoformat()

    if isinstance(value, dict):
        return {
            key: make_json_safe(item)
            for key, item in value.items()
        }

    if isinstance(value, list):
        return [
            make_json_safe(item)
            for item in value
        ]

    if isinstance(value, tuple):
        return [
            make_json_safe(item)
            for item in value
        ]

    return value


# ---------------------------------------------------------
# Generate Diet Plan
# ---------------------------------------------------------

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
        # We do NOT trust any user ID supplied by the client.
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


# ---------------------------------------------------------
# Get all saved plans for current user
# ---------------------------------------------------------

@router.get(
    "",
)
async def get_saved_plans(
    current_user: dict = Depends(
        get_current_user
    ),
):
    """
    Retrieve all saved diet plans belonging to
    the authenticated Firebase user.
    """

    try:
        firebase_uid = current_user["uid"]

        db = get_firestore_database()

        plans_collection = db.collection(
            "dietPlans"
        )

        # User isolation is enforced by querying only
        # documents belonging to the authenticated UID.
        plans_query = plans_collection.where(
            filter=FieldFilter(
                "userId",
                "==",
                firebase_uid,
            )
        )

        documents = plans_query.stream()

        plans = []

        for document in documents:
            plan_data = document.to_dict() or {}

            # Add Firestore document ID so the frontend/API
            # can identify the exact saved record.
            plan_data["planId"] = document.id

            # Keep compatibility with schemas using snake_case.
            plan_data["plan_id"] = document.id

            # Make Firestore timestamps JSON serializable.
            plan_data = make_json_safe(
                plan_data
            )

            plans.append(plan_data)

        # Sort newest first.
        plans.sort(
            key=lambda item: (
                item.get("createdAt")
                or item.get("created_at")
                or ""
            ),
            reverse=True,
        )

        return {
            "total": len(plans),
            "plans": plans,
        }

    except KeyError as exc:
        raise HTTPException(
            status_code=401,
            detail="Authenticated user UID was not found.",
        ) from exc

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve saved diet plans.",
        ) from exc


# ---------------------------------------------------------
# Get one saved plan
# ---------------------------------------------------------

@router.get(
    "/{plan_id}",
)
async def get_saved_plan(
    plan_id: str,
    current_user: dict = Depends(
        get_current_user
    ),
):
    """
    Retrieve one saved diet plan.

    The record must belong to the authenticated user.
    """

    try:
        firebase_uid = current_user["uid"]

        if not plan_id.strip():
            raise HTTPException(
                status_code=400,
                detail="Plan ID cannot be empty.",
            )

        db = get_firestore_database()

        document_reference = (
            db.collection("dietPlans")
            .document(plan_id)
        )

        document = document_reference.get()

        if not document.exists:
            raise HTTPException(
                status_code=404,
                detail="Diet plan not found.",
            )

        plan_data = document.to_dict() or {}

        # Explicit user-isolation check.
        if plan_data.get("userId") != firebase_uid:
            raise HTTPException(
                status_code=404,
                detail="Diet plan not found.",
            )

        plan_data["planId"] = document.id
        plan_data["plan_id"] = document.id

        plan_data = make_json_safe(
            plan_data
        )

        return plan_data

    except KeyError as exc:
        raise HTTPException(
            status_code=401,
            detail="Authenticated user UID was not found.",
        ) from exc

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve the diet plan.",
        ) from exc


# ---------------------------------------------------------
# Delete one saved plan
# ---------------------------------------------------------

@router.delete(
    "/{plan_id}",
)
async def delete_saved_plan(
    plan_id: str,
    current_user: dict = Depends(
        get_current_user
    ),
):
    """
    Delete one saved diet plan belonging to
    the authenticated user.
    """

    try:
        firebase_uid = current_user["uid"]

        if not plan_id.strip():
            raise HTTPException(
                status_code=400,
                detail="Plan ID cannot be empty.",
            )

        db = get_firestore_database()

        document_reference = (
            db.collection("dietPlans")
            .document(plan_id)
        )

        document = document_reference.get()

        if not document.exists:
            raise HTTPException(
                status_code=404,
                detail="Diet plan not found.",
            )

        plan_data = document.to_dict() or {}

        # Prevent User A from deleting User B's plan.
        if plan_data.get("userId") != firebase_uid:
            raise HTTPException(
                status_code=404,
                detail="Diet plan not found.",
            )

        document_reference.delete()

        return {
            "message": "Diet plan deleted successfully.",
            "planId": plan_id,
        }

    except KeyError as exc:
        raise HTTPException(
            status_code=401,
            detail="Authenticated user UID was not found.",
        ) from exc

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to delete the diet plan.",
        ) from exc
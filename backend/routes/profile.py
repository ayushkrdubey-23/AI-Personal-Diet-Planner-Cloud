from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from pydantic import BaseModel, Field

from backend.services.auth_service import get_current_user


router = APIRouter(
    prefix="/profile",
    tags=["User Profile"],
)


# ---------------------------------------------------------
# Request model
# ---------------------------------------------------------

class ProfileRequest(BaseModel):
    name: str = Field(
        default="",
        max_length=100,
    )

    age: str = Field(
        default="",
        max_length=10,
    )

    height: str = Field(
        default="",
        max_length=30,
    )

    weight: str = Field(
        default="",
        max_length=30,
    )

    activity: str = Field(
        default="Moderately Active",
        max_length=50,
    )

    dietaryPreference: str = Field(
        default="Vegetarian",
        max_length=50,
    )

    goal: str = Field(
        default="Balanced Wellness",
        max_length=100,
    )

    allergies: str = Field(
        default="",
        max_length=500,
    )

    preferences: str = Field(
        default="",
        max_length=500,
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
# GET PROFILE
# ---------------------------------------------------------

@router.get("")
async def get_profile(
    current_user: dict = Depends(
        get_current_user
    ),
):
    """
    Retrieve the authenticated user's profile.
    """

    try:
        firebase_uid = current_user["uid"]

        db = get_firestore_database()

        document_reference = (
            db.collection("users")
            .document(firebase_uid)
        )

        document = document_reference.get()

        if not document.exists:
            raise HTTPException(
                status_code=404,
                detail="Profile not found.",
            )

        profile = document.to_dict() or {}

        # Extra protection against cross-user access.
        if profile.get("userId") != firebase_uid:
            raise HTTPException(
                status_code=404,
                detail="Profile not found.",
            )

        profile["userId"] = firebase_uid

        return profile

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
            detail="Unable to retrieve user profile.",
        ) from exc


# ---------------------------------------------------------
# PUT PROFILE
# ---------------------------------------------------------

@router.put("")
async def update_profile(
    profile_request: ProfileRequest,
    current_user: dict = Depends(
        get_current_user
    ),
):
    """
    Create or update the authenticated user's profile.

    The Firebase UID comes from the verified token and
    cannot be supplied by the frontend.
    """

    try:
        firebase_uid = current_user["uid"]

        user_email = current_user.get(
            "email",
            "",
        )

        db = get_firestore_database()

        document_reference = (
            db.collection("users")
            .document(firebase_uid)
        )

        existing_document = (
            document_reference.get()
        )

        existing_profile = (
            existing_document.to_dict()
            if existing_document.exists
            else {}
        )

        now = datetime.now(
            timezone.utc
        ).isoformat()

        profile_data = {
            "userId": firebase_uid,
            "email": user_email,
            "name": profile_request.name.strip(),
            "age": profile_request.age.strip(),
            "height": profile_request.height.strip(),
            "weight": profile_request.weight.strip(),
            "activity": profile_request.activity.strip(),
            "dietaryPreference": (
                profile_request.dietaryPreference.strip()
            ),
            "goal": profile_request.goal.strip(),
            "allergies": (
                profile_request.allergies.strip()
            ),
            "preferences": (
                profile_request.preferences.strip()
            ),
            "updatedAt": now,
        }

        # Preserve original creation time if present.
        if existing_profile.get("createdAt"):
            profile_data["createdAt"] = (
                existing_profile["createdAt"]
            )
        else:
            profile_data["createdAt"] = now

        document_reference.set(
            profile_data,
            merge=True,
        )

        return profile_data

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
            detail="Unable to save user profile.",
        ) from exc
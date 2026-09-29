from typing import List, Optional

from pydantic import BaseModel, Field


class Meal(BaseModel):
    title: str
    description: str
    tags: List[str] = Field(default_factory=list)


class PlanRequest(BaseModel):
    user_id: str = Field(
        min_length=1,
        description="Authenticated user's identifier"
    )

    name: Optional[str] = ""

    activity: Optional[str] = "Moderately Active"

    dietary_preference: Optional[str] = "Vegetarian"

    goal: Optional[str] = "Balanced Wellness"

    preferences: Optional[str] = ""

    allergies: Optional[str] = ""


class NutritionSummary(BaseModel):
    overview: str
    focus: List[str] = Field(default_factory=list)


class DietPlanResponse(BaseModel):
    plan_id: str
    user_id: str

    breakfast: Meal
    lunch: Meal
    snack: Meal
    dinner: Meal

    nutrition_summary: NutritionSummary

    hydration_reminder: str

    profile: dict

    disclaimer: str
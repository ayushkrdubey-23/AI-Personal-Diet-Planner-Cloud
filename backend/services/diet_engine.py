from datetime import datetime, timezone
from typing import Any


MEAL_DATABASE = {
    "Vegetarian": {
        "breakfast": [
            {
                "title": "Vegetable Poha",
                "description": (
                    "Poha with peas, mixed vegetables "
                    "and seasonal fruit."
                ),
                "tags": [
                    "fiber",
                    "vegetarian",
                    "breakfast",
                ],
            },
            {
                "title": "Oats and Fruit Bowl",
                "description": (
                    "Oats with milk or a suitable alternative "
                    "and seasonal fruit."
                ),
                "tags": [
                    "fiber",
                    "vegetarian",
                ],
            },
            {
                "title": "Paneer Vegetable Sandwich",
                "description": (
                    "Whole-grain sandwich with paneer "
                    "and mixed vegetables."
                ),
                "tags": [
                    "protein",
                    "vegetarian",
                ],
            },
        ],
        "lunch": [
            {
                "title": "Dal, Rice and Mixed Vegetables",
                "description": (
                    "Dal with rice, seasonal vegetables "
                    "and plain curd."
                ),
                "tags": [
                    "balanced",
                    "vegetarian",
                ],
            },
            {
                "title": "Roti, Dal and Vegetable Curry",
                "description": (
                    "Whole-wheat roti with dal and "
                    "mixed vegetable curry."
                ),
                "tags": [
                    "fiber",
                    "vegetarian",
                ],
            },
            {
                "title": "Vegetable Khichdi Bowl",
                "description": (
                    "Mixed-dal vegetable khichdi "
                    "with curd and salad."
                ),
                "tags": [
                    "balanced",
                    "vegetarian",
                ],
            },
        ],
        "snack": [
            {
                "title": "Fruit and Nuts",
                "description": (
                    "Seasonal fruit with a small serving "
                    "of mixed nuts."
                ),
                "tags": [
                    "simple",
                    "vegetarian",
                ],
            },
            {
                "title": "Curd and Fruit",
                "description": (
                    "Plain curd with seasonal fruit."
                ),
                "tags": [
                    "protein",
                    "vegetarian",
                ],
            },
            {
                "title": "Roasted Chana",
                "description": (
                    "Roasted chana with seasonal fruit "
                    "or an unsweetened beverage."
                ),
                "tags": [
                    "fiber",
                    "vegetarian",
                ],
            },
        ],
        "dinner": [
            {
                "title": "Roti with Paneer and Vegetables",
                "description": (
                    "Whole-wheat roti with paneer "
                    "and cooked vegetables."
                ),
                "tags": [
                    "protein",
                    "vegetarian",
                ],
            },
            {
                "title": "Dal, Roti and Salad",
                "description": (
                    "Dal with whole-wheat roti "
                    "and fresh salad."
                ),
                "tags": [
                    "balanced",
                    "vegetarian",
                ],
            },
            {
                "title": "Vegetable Rice Bowl",
                "description": (
                    "Rice with mixed vegetables, "
                    "dal and curd."
                ),
                "tags": [
                    "balanced",
                    "vegetarian",
                ],
            },
        ],
    },

    "Vegan": {
        "breakfast": [
            {
                "title": "Oats, Banana and Seeds",
                "description": (
                    "Oats prepared with a plant-based "
                    "milk alternative, banana and seeds."
                ),
                "tags": [
                    "fiber",
                    "vegan",
                ],
            },
            {
                "title": "Vegetable Poha",
                "description": (
                    "Poha with mixed vegetables "
                    "and seasonal fruit."
                ),
                "tags": [
                    "vegan",
                    "breakfast",
                ],
            },
            {
                "title": "Peanut and Banana Toast",
                "description": (
                    "Whole-grain toast with peanut spread "
                    "and banana."
                ),
                "tags": [
                    "vegan",
                    "energy",
                ],
            },
        ],
        "lunch": [
            {
                "title": "Dal, Rice and Vegetables",
                "description": (
                    "Dal with rice, seasonal vegetables "
                    "and salad."
                ),
                "tags": [
                    "balanced",
                    "vegan",
                ],
            },
            {
                "title": "Chickpea Roti Bowl",
                "description": (
                    "Whole-wheat roti with chickpeas, "
                    "vegetables and salad."
                ),
                "tags": [
                    "protein",
                    "fiber",
                    "vegan",
                ],
            },
            {
                "title": "Vegetable Khichdi",
                "description": (
                    "Rice-and-lentil khichdi "
                    "with mixed vegetables."
                ),
                "tags": [
                    "balanced",
                    "vegan",
                ],
            },
        ],
        "snack": [
            {
                "title": "Fruit and Nuts",
                "description": (
                    "Seasonal fruit with mixed nuts."
                ),
                "tags": [
                    "simple",
                    "vegan",
                ],
            },
            {
                "title": "Roasted Chana",
                "description": (
                    "Roasted chana with seasonal fruit."
                ),
                "tags": [
                    "fiber",
                    "vegan",
                ],
            },
            {
                "title": "Hummus and Vegetable Sticks",
                "description": (
                    "Hummus with cucumber, carrot "
                    "and other suitable vegetables."
                ),
                "tags": [
                    "fiber",
                    "vegan",
                ],
            },
        ],
        "dinner": [
            {
                "title": "Roti, Dal and Vegetables",
                "description": (
                    "Whole-wheat roti with dal "
                    "and cooked vegetables."
                ),
                "tags": [
                    "balanced",
                    "vegan",
                ],
            },
            {
                "title": "Chickpea Vegetable Rice",
                "description": (
                    "Rice with chickpeas "
                    "and mixed vegetables."
                ),
                "tags": [
                    "protein",
                    "vegan",
                ],
            },
            {
                "title": "Tofu and Vegetable Bowl",
                "description": (
                    "Tofu with mixed vegetables "
                    "and rice or whole grains."
                ),
                "tags": [
                    "protein",
                    "vegan",
                ],
            },
        ],
    },

    "Non-Vegetarian": {
        "breakfast": [
            {
                "title": "Egg and Vegetable Toast",
                "description": (
                    "Eggs with whole-grain toast "
                    "and mixed vegetables."
                ),
                "tags": [
                    "protein",
                    "breakfast",
                ],
            },
            {
                "title": "Oats and Fruit Bowl",
                "description": (
                    "Oats with milk or a suitable alternative "
                    "and seasonal fruit."
                ),
                "tags": [
                    "fiber",
                    "breakfast",
                ],
            },
            {
                "title": "Vegetable Egg Sandwich",
                "description": (
                    "Whole-grain sandwich with egg "
                    "and vegetables."
                ),
                "tags": [
                    "protein",
                ],
            },
        ],
        "lunch": [
            {
                "title": "Rice, Dal and Grilled Chicken",
                "description": (
                    "Rice with dal, vegetables "
                    "and grilled chicken."
                ),
                "tags": [
                    "protein",
                    "balanced",
                ],
            },
            {
                "title": "Roti with Chicken and Vegetables",
                "description": (
                    "Whole-wheat roti with chicken "
                    "and vegetables."
                ),
                "tags": [
                    "protein",
                    "balanced",
                ],
            },
            {
                "title": "Egg Rice and Vegetable Bowl",
                "description": (
                    "Rice with egg, vegetables "
                    "and dal."
                ),
                "tags": [
                    "protein",
                    "balanced",
                ],
            },
        ],
        "snack": [
            {
                "title": "Fruit and Nuts",
                "description": (
                    "Seasonal fruit with mixed nuts."
                ),
                "tags": [
                    "simple",
                ],
            },
            {
                "title": "Boiled Egg and Fruit",
                "description": (
                    "Boiled egg with seasonal fruit."
                ),
                "tags": [
                    "protein",
                ],
            },
            {
                "title": "Curd and Fruit",
                "description": (
                    "Plain curd with seasonal fruit."
                ),
                "tags": [
                    "protein",
                ],
            },
        ],
        "dinner": [
            {
                "title": "Chicken, Roti and Vegetables",
                "description": (
                    "Chicken with whole-wheat roti "
                    "and cooked vegetables."
                ),
                "tags": [
                    "protein",
                    "balanced",
                ],
            },
            {
                "title": "Dal, Rice and Egg",
                "description": (
                    "Dal and rice with egg "
                    "and vegetables."
                ),
                "tags": [
                    "protein",
                    "balanced",
                ],
            },
            {
                "title": "Fish, Rice and Vegetables",
                "description": (
                    "Fish with rice and "
                    "cooked vegetables."
                ),
                "tags": [
                    "protein",
                    "balanced",
                ],
            },
        ],
    },
}


def normalize(value: str | None) -> str:
    return str(value or "").strip().lower()


def calculate_seed(profile: dict[str, Any]) -> int:
    text = "".join(
        [
            str(profile.get("name") or ""),
            str(profile.get("activity") or ""),
            str(profile.get("dietary_preference") or ""),
            str(profile.get("goal") or ""),
            str(profile.get("preferences") or ""),
        ]
    )

    return sum(
        ord(character)
        for character in text
    )


def choose_meal(
    meals: list[dict[str, Any]],
    seed: int,
) -> dict[str, Any]:
    index = abs(seed) % len(meals)
    return meals[index]


def get_goal_summary(goal: str) -> dict[str, Any]:
    normalized_goal = normalize(goal)

    if "fitness" in normalized_goal:
        return {
            "title": "Fitness Demo",
            "summary": (
                "The plan emphasizes regular balanced meals "
                "and varied food sources that can fit an active routine."
            ),
        }

    if "healthy" in normalized_goal:
        return {
            "title": "General Healthy Eating",
            "summary": (
                "The plan emphasizes variety, vegetables, "
                "fruits, whole grains and protein-containing foods."
            ),
        }

    return {
        "title": "Balanced Wellness",
        "summary": (
            "The plan emphasizes variety and balance "
            "across the day's meals using the selected dietary preference."
        ),
    }


def generate_plan(profile: dict[str, Any]) -> dict[str, Any]:
    dietary_preference = (
        profile.get("dietary_preference")
        or "Vegetarian"
    )

    meals = MEAL_DATABASE.get(
        dietary_preference,
        MEAL_DATABASE["Vegetarian"],
    )

    seed = calculate_seed(profile)

    goal = profile.get(
        "goal",
        "Balanced Wellness",
    )

    goal_info = get_goal_summary(goal)

    return {
        "plan_id": (
          f"backend-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}"
        ),
        "user_id": profile["user_id"],

        "breakfast": choose_meal(
            meals["breakfast"],
            seed + 1,
        ),

        "lunch": choose_meal(
            meals["lunch"],
            seed + 2,
        ),

        "snack": choose_meal(
            meals["snack"],
            seed + 3,
        ),

        "dinner": choose_meal(
            meals["dinner"],
            seed + 4,
        ),

        "nutrition_summary": {
            "overview": goal_info["summary"],
            "focus": [
                "Include a variety of food groups.",
                "Include fruits and vegetables regularly.",
                "Include suitable protein-containing foods.",
                "Choose whole grains where suitable.",
            ],
        },

        "hydration_reminder": (
            "Keep water available throughout the day "
            "and drink regularly according to your thirst and routine."
        ),

        "profile": {
            "dietary_preference": dietary_preference,
            "activity": (
                profile.get("activity")
                or "Moderately Active"
            ),
            "goal": goal_info["title"],
        },

        "disclaimer": (
            "This is a general educational wellness suggestion, "
            "not medical or nutritional advice."
        ),
    }
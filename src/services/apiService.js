const API_BASE_URL = "http://127.0.0.1:8000/api";

// Convert backend response into the format
// already used by our React components.
const normalizePlanResponse = (data) => {
  return {
    id: data.plan_id || `backend-${Date.now()}`,

    createdAt: new Date().toISOString(),

    profile: {
      dietaryPreference:
        data.profile?.dietary_preference ||
        "Vegetarian",

      activity:
        data.profile?.activity ||
        "Moderately Active",

      goal:
        data.profile?.goal ||
        "Balanced Wellness",
    },

    breakfast: data.breakfast,
    lunch: data.lunch,
    snack: data.snack,
    dinner: data.dinner,

    nutritionSummary:
      data.nutrition_summary || {
        overview: "",
        focus: [],
      },

    hydrationReminder:
      data.hydration_reminder || "",

    disclaimer:
      data.disclaimer ||
      "This is a general educational wellness suggestion, not medical or nutritional advice.",

    source: "backend-api",
  };
};

// Generate a plan through FastAPI
export const generatePlanFromAPI = async (
  profile,
  userId
) => {
  const requestBody = {
    user_id: userId,

    name: profile?.name || "",

    activity:
      profile?.activity ||
      "Moderately Active",

    dietary_preference:
      profile?.dietaryPreference ||
      "Vegetarian",

    goal:
      profile?.goal ||
      "Balanced Wellness",

    preferences:
      profile?.preferences || "",

    allergies:
      profile?.allergies || "",
  };

  const response = await fetch(
    `${API_BASE_URL}/plans/generate`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Backend request failed with status ${response.status}`
    );
  }

  const data = await response.json();

  return normalizePlanResponse(data);
};

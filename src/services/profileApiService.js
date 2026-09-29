const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

/**
 * Build authenticated request headers.
 */
const getAuthHeaders = async (currentUser) => {
  if (!currentUser) {
    throw new Error(
      "You must be signed in to access your profile."
    );
  }

  const token =
    await currentUser.getIdToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};


/**
 * Get the authenticated user's profile.
 *
 * Returns null when a profile has not been created yet.
 */
export const getProfileFromApi = async (
  currentUser
) => {
  const headers =
    await getAuthHeaders(currentUser);

  const response = await fetch(
    `${API_BASE_URL}/profile`,
    {
      method: "GET",
      headers,
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    let message =
      "Unable to load your profile.";

    try {
      const data =
        await response.json();

      if (data?.detail) {
        message = data.detail;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return await response.json();
};


/**
 * Create or update the authenticated user's profile.
 */
export const saveProfileToApi = async (
  currentUser,
  profile
) => {
  const headers =
    await getAuthHeaders(currentUser);

  const response = await fetch(
    `${API_BASE_URL}/profile`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        name: profile.name || "",
        age: String(profile.age || ""),
        height: profile.height || "",
        weight: profile.weight || "",
        activity:
          profile.activity ||
          "Moderately Active",
        dietaryPreference:
          profile.dietaryPreference ||
          "Vegetarian",
        goal:
          profile.goal ||
          "Balanced Wellness",
        allergies:
          profile.allergies || "",
        preferences:
          profile.preferences || "",
      }),
    }
  );

  if (!response.ok) {
    let message =
      "Unable to save your profile.";

    try {
      const data =
        await response.json();

      if (data?.detail) {
        message = data.detail;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return await response.json();
};
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

/**
 * Get the Firebase ID token of the currently
 * authenticated user.
 */
const getAuthHeaders = async (currentUser) => {
  if (!currentUser) {
    throw new Error(
      "You must be signed in to access saved plans."
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
 * Retrieve all saved plans from FastAPI.
 */
export const getPlansFromApi = async (
  currentUser
) => {
  const headers =
    await getAuthHeaders(currentUser);

  const response = await fetch(
    `${API_BASE_URL}/plans`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    let message =
      "Unable to retrieve saved plans.";

    try {
      const data =
        await response.json();

      if (data?.detail) {
        message = data.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  const data =
    await response.json();

  /*
   * Backend returns:
   * {
   *   total: number,
   *   plans: [...]
   * }
   */
  return Array.isArray(data?.plans)
    ? data.plans
    : [];
};

/**
 * Retrieve one saved plan from FastAPI.
 */
export const getPlanFromApi = async (
  currentUser,
  planId
) => {
  const headers =
    await getAuthHeaders(currentUser);

  const response = await fetch(
    `${API_BASE_URL}/plans/${encodeURIComponent(
      planId
    )}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    let message =
      "Unable to retrieve the selected plan.";

    try {
      const data =
        await response.json();

      if (data?.detail) {
        message = data.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return await response.json();
};

/**
 * Delete one saved plan using FastAPI.
 */
export const deletePlanFromApi = async (
  currentUser,
  planId
) => {
  const headers =
    await getAuthHeaders(currentUser);

  const response = await fetch(
    `${API_BASE_URL}/plans/${encodeURIComponent(
      planId
    )}`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (!response.ok) {
    let message =
      "Unable to delete the selected plan.";

    try {
      const data =
        await response.json();

      if (data?.detail) {
        message = data.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return await response.json();
};
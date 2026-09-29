import { getAuth } from "firebase/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

/**
 * Get Firebase ID token and prepare authenticated headers.
 */
async function getAuthHeaders() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const token = await user.getIdToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Handle FastAPI response consistently.
 */
async function handleResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return data;
}

/**
 * Save file metadata through FastAPI.
 *
 * Important:
 * The actual file content is still stored using the project's
 * local-storage simulation because Firebase Cloud Storage is not being used.
 */
export async function createFileMetadataWithApi(fileMetadata) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers,
    body: JSON.stringify(fileMetadata),
  });

  return handleResponse(response);
}

/**
 * Retrieve authenticated user's file metadata from FastAPI.
 */
export async function getFilesWithApi() {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/files`, {
    method: "GET",
    headers,
  });

  return handleResponse(response);
}

/**
 * Delete file metadata through FastAPI.
 */
export async function deleteFileMetadataWithApi(fileId) {
  if (!fileId) {
    throw new Error("File metadata ID is required.");
  }

  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/files/${encodeURIComponent(fileId)}`,
    {
      method: "DELETE",
      headers,
    }
  );

  return handleResponse(response);
}
// ======================================================
// LOCAL STORAGE SIMULATION
// ======================================================
// Firebase Cloud Storage requires the Blaze plan in the
// current Firebase setup, so this project uses browser
// localStorage as a free local object-storage simulation.
//
// Firestore stores file metadata separately.
// ======================================================

const STORAGE_PREFIX = "ai_diet_planner_files_";

// Get the storage key for one user
const getStorageKey = (userId) => {
  return `${STORAGE_PREFIX}${userId}`;
};

// Read all locally stored files for a user
const getStoredFiles = (userId) => {
  const key = getStorageKey(userId);

  const stored = localStorage.getItem(key);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error(
      "Unable to read local storage:",
      error
    );

    return [];
  }
};

// Save all files for a user
const setStoredFiles = (userId, files) => {
  const key = getStorageKey(userId);

  localStorage.setItem(
    key,
    JSON.stringify(files)
  );
};

// Convert a File object into a Base64 data URL
const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(
        new Error("Unable to read selected file.")
      );
    };

    reader.readAsDataURL(file);
  });
};

// Upload one file
export const uploadLocalFile = async (
  userId,
  file
) => {
  const dataUrl = await fileToDataUrl(file);

  const newFile = {
    id: `local-file-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,

    name: file.name,

    type: file.type || "application/octet-stream",

    size: file.size,

    dataUrl,

    uploadedAt: new Date().toISOString(),

    storageMode: "local-simulation",
  };

  const existingFiles = getStoredFiles(userId);

  const updatedFiles = [
    newFile,
    ...existingFiles,
  ];

  setStoredFiles(userId, updatedFiles);

  return newFile;
};

// Retrieve all files
export const getLocalFiles = (userId) => {
  return getStoredFiles(userId);
};

// Retrieve one file
export const getLocalFile = (
  userId,
  fileId
) => {
  const files = getStoredFiles(userId);

  return (
    files.find(
      (file) => file.id === fileId
    ) || null
  );
};

// Delete one file
export const deleteLocalFile = (
  userId,
  fileId
) => {
  const files = getStoredFiles(userId);

  const updatedFiles = files.filter(
    (file) => file.id !== fileId
  );

  setStoredFiles(userId, updatedFiles);
};

// Format bytes for the UI
export const formatFileSize = (bytes) => {
  if (!bytes) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  const size =
    bytes /
    Math.pow(
      1024,
      Math.min(index, units.length - 1)
    );

  return `${size.toFixed(1)} ${
    units[Math.min(index, units.length - 1)]
  }`;
};

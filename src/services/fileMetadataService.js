import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

const FILES_COLLECTION = "userFiles";

/**
 * Store file metadata in Firestore.
 *
 * The actual file content is still stored in the browser's
 * local-storage simulation for the current free-tier setup.
 */
export const createFileMetadata = async (userId, file) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!file?.id) {
    throw new Error("Local file ID is required.");
  }

  const metadata = {
    userId,
    localFileId: file.id,
    filename: file.name,
    storagePath: `local-simulation/${userId}/${file.id}`,
    uploadedAt: file.uploadedAt || new Date().toISOString(),
    size: Number(file.size) || 0,
    contentType: file.type || "application/octet-stream",
    storageMode: "local-simulation",
  };

  const documentReference = await addDoc(
    collection(db, FILES_COLLECTION),
    metadata
  );

  return {
    id: documentReference.id,
    ...metadata,
  };
};

/**
 * Get all metadata records belonging to the logged-in user.
 */
export const getUserFileMetadata = async (userId) => {
  if (!userId) {
    return [];
  }

  const filesQuery = query(
    collection(db, FILES_COLLECTION),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(filesQuery);

  const metadataFiles = snapshot.docs.map((fileDoc) => ({
    id: fileDoc.id,
    ...fileDoc.data(),
  }));

  metadataFiles.sort((a, b) => {
    const dateA = new Date(a.uploadedAt || 0).getTime();
    const dateB = new Date(b.uploadedAt || 0).getTime();

    return dateB - dateA;
  });

  return metadataFiles;
};

/**
 * Delete one file's Firestore metadata.
 */
export const deleteFileMetadata = async (metadataId) => {
  if (!metadataId) {
    return;
  }

  await deleteDoc(
    doc(db, FILES_COLLECTION, metadataId)
  );
};
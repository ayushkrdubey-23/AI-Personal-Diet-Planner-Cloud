import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";

const trackerCollection = "dailyTracker";

// Create a stable document ID for a user + date
const getTrackerDocumentId = (userId, date) => {
  return `${userId}_${date}`;
};

// Get today's tracker
export const getDailyTracker = async (
  userId,
  date
) => {
  const documentId = getTrackerDocumentId(
    userId,
    date
  );

  const trackerRef = doc(
    db,
    trackerCollection,
    documentId
  );

  const snapshot = await getDoc(trackerRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// Save today's tracker
export const saveDailyTracker = async (
  userId,
  date,
  trackerData
) => {
  const documentId = getTrackerDocumentId(
    userId,
    date
  );

  const trackerRef = doc(
    db,
    trackerCollection,
    documentId
  );

  const data = {
    userId,
    date,

    breakfastCompleted:
      Boolean(trackerData.breakfastCompleted),

    lunchCompleted:
      Boolean(trackerData.lunchCompleted),

    snackCompleted:
      Boolean(trackerData.snackCompleted),

    dinnerCompleted:
      Boolean(trackerData.dinnerCompleted),

    waterServings:
      Number(trackerData.waterServings) || 0,

    note:
      trackerData.note || "",

    updatedAt:
      new Date().toISOString(),
  };

  await setDoc(
    trackerRef,
    data,
    {
      merge: true,
    }
  );

  return {
    id: documentId,
    ...data,
  };
};

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";

const trackerCollection = "dailyTracker";

// Create a stable document ID for a user + date
const getTrackerDocumentId = (userId, date) => {
  return `${userId}_${date}`;
};

// Get one day's tracker
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

// Save one day's tracker
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

// Get all tracker records for one user
export const getUserTrackers = async (
  userId
) => {
  const trackersRef = collection(
    db,
    trackerCollection
  );

  const trackersQuery = query(
    trackersRef,
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(
    trackersQuery
  );

  const trackers = snapshot.docs.map(
    (item) => ({
      id: item.id,
      ...item.data(),
    })
  );

  // Sort on the client to avoid needing a
  // composite Firestore index.
  trackers.sort((a, b) => {
    return String(b.date || "").localeCompare(
      String(a.date || "")
    );
  });

  return trackers;
};
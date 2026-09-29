import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

// Create a new user profile
export const createUserProfile = async (userId, profileData) => {
  const userRef = doc(db, "users", userId);

  await setDoc(userRef, {
    ...profileData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Get user profile
export const getUserProfile = async (userId) => {
  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    ...profileData,
    updatedAt: serverTimestamp(),
  });
};

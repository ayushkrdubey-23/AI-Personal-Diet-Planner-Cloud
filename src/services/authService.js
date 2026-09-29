import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../firebase";

// Register a new user
export const registerUser = async (email, password) => {
  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  return result.user;
};

// Login existing user
export const loginUser = async (email, password) => {
  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return result.user;
};

// Logout current user
export const logoutUser = async () => {
  await signOut(auth);
};

// Listen for authentication changes
export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

const plansCollection = collection(db, "dietPlans");

// Save a generated plan
export const saveDietPlan = async (userId, plan) => {
  const planData = {
    userId,

    breakfast: plan.breakfast || null,
    lunch: plan.lunch || null,
    snack: plan.snack || null,
    dinner: plan.dinner || null,

    nutritionSummary: plan.nutritionSummary || {
      overview: "",
      focus: [],
    },

    hydrationReminder: plan.hydrationReminder || "",

    profile: plan.profile || {},

    disclaimer: plan.disclaimer || "",

    // Use client time so sorting works immediately
    createdAt: new Date().toISOString(),
  };

  const document = await addDoc(
    plansCollection,
    planData
  );

  return {
    id: document.id,
    ...planData,
  };
};

// Get all plans belonging to one user
export const getUserPlans = async (userId) => {
  const plansQuery = query(
    plansCollection,
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(plansQuery);

  const plans = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  // Newest first
  plans.sort((a, b) => {
    return (
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
    );
  });

  return plans;
};

// Get one specific plan
export const getDietPlan = async (planId) => {
  const planRef = doc(db, "dietPlans", planId);
  const snapshot = await getDoc(planRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// Delete one plan
export const deleteDietPlan = async (planId) => {
  const planRef = doc(db, "dietPlans", planId);
  await deleteDoc(planRef);
};
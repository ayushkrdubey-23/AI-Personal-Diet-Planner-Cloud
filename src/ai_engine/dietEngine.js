// ======================================================
// RULE-BASED DIET RECOMMENDATION ENGINE
// Version A - Local AI Simulation
// ======================================================

const mealDatabase = {
  Vegetarian: {
    breakfast: [
      {
        title: "Vegetable Poha",
        description:
          "Poha with peas, vegetables and a side of fruit.",
        tags: ["light", "fiber", "vegetarian"],
      },
      {
        title: "Oats and Fruit Bowl",
        description:
          "Oats with milk or a suitable alternative, banana and seasonal fruit.",
        tags: ["fiber", "breakfast", "vegetarian"],
      },
      {
        title: "Paneer Vegetable Sandwich",
        description:
          "Whole-grain sandwich with paneer and mixed vegetables.",
        tags: ["protein", "vegetarian"],
      },
    ],

    lunch: [
      {
        title: "Dal, Rice and Mixed Vegetables",
        description:
          "Dal with rice, seasonal vegetables and plain curd.",
        tags: ["balanced", "vegetarian"],
      },
      {
        title: "Roti, Dal and Vegetable Curry",
        description:
          "Whole-wheat roti with dal and a mixed vegetable curry.",
        tags: ["balanced", "fiber", "vegetarian"],
      },
      {
        title: "Vegetable Khichdi Bowl",
        description:
          "Mixed-dal vegetable khichdi with curd and salad.",
        tags: ["balanced", "comfort", "vegetarian"],
      },
    ],

    snack: [
      {
        title: "Fruit and Nuts",
        description:
          "Seasonal fruit with a small serving of mixed nuts.",
        tags: ["simple", "vegetarian"],
      },
      {
        title: "Curd and Fruit",
        description:
          "Plain curd with seasonal fruit.",
        tags: ["protein", "vegetarian"],
      },
      {
        title: "Roasted Chana",
        description:
          "Roasted chana with a fruit or unsweetened beverage.",
        tags: ["protein", "fiber", "vegetarian"],
      },
    ],

    dinner: [
      {
        title: "Roti with Paneer and Vegetables",
        description:
          "Whole-wheat roti with paneer preparation and cooked vegetables.",
        tags: ["protein", "vegetarian"],
      },
      {
        title: "Dal, Roti and Salad",
        description:
          "Dal with whole-wheat roti and a fresh salad.",
        tags: ["balanced", "vegetarian"],
      },
      {
        title: "Vegetable Rice Bowl",
        description:
          "Rice with mixed vegetables, dal and curd.",
        tags: ["balanced", "vegetarian"],
      },
    ],
  },

  Vegan: {
    breakfast: [
      {
        title: "Oats, Banana and Seeds",
        description:
          "Oats prepared with a plant-based milk alternative, banana and seeds.",
        tags: ["fiber", "vegan"],
      },
      {
        title: "Vegetable Poha",
        description:
          "Poha with mixed vegetables and seasonal fruit.",
        tags: ["light", "vegan"],
      },
      {
        title: "Peanut and Banana Toast",
        description:
          "Whole-grain toast with peanut spread and banana.",
        tags: ["energy", "vegan"],
      },
    ],

    lunch: [
      {
        title: "Dal, Rice and Vegetables",
        description:
          "Dal with rice, seasonal vegetables and salad.",
        tags: ["balanced", "vegan"],
      },
      {
        title: "Chickpea Roti Bowl",
        description:
          "Whole-wheat roti with chickpeas, vegetables and salad.",
        tags: ["protein", "fiber", "vegan"],
      },
      {
        title: "Vegetable Khichdi",
        description:
          "Rice-and-lentil khichdi with mixed vegetables.",
        tags: ["balanced", "vegan"],
      },
    ],

    snack: [
      {
        title: "Fruit and Nuts",
        description:
          "Seasonal fruit with mixed nuts.",
        tags: ["simple", "vegan"],
      },
      {
        title: "Roasted Chana",
        description:
          "Roasted chana with seasonal fruit.",
        tags: ["protein", "fiber", "vegan"],
      },
      {
        title: "Hummus and Vegetable Sticks",
        description:
          "Hummus with cucumber, carrot and other suitable vegetables.",
        tags: ["fiber", "vegan"],
      },
    ],

    dinner: [
      {
        title: "Roti, Dal and Vegetables",
        description:
          "Whole-wheat roti with dal and cooked vegetables.",
        tags: ["balanced", "vegan"],
      },
      {
        title: "Chickpea Vegetable Rice",
        description:
          "Rice with chickpeas and mixed vegetables.",
        tags: ["protein", "vegan"],
      },
      {
        title: "Tofu and Vegetable Bowl",
        description:
          "Tofu with mixed vegetables and rice or whole grains.",
        tags: ["protein", "vegan"],
      },
    ],
  },

  "Non-Vegetarian": {
    breakfast: [
      {
        title: "Egg and Vegetable Toast",
        description:
          "Eggs with whole-grain toast and mixed vegetables.",
        tags: ["protein", "breakfast"],
      },
      {
        title: "Oats and Fruit Bowl",
        description:
          "Oats with milk or a suitable alternative and seasonal fruit.",
        tags: ["fiber", "breakfast"],
      },
      {
        title: "Vegetable Egg Sandwich",
        description:
          "Whole-grain sandwich with egg and vegetables.",
        tags: ["protein"],
      },
    ],

    lunch: [
      {
        title: "Rice, Dal and Grilled Chicken",
        description:
          "Rice with dal, vegetables and grilled chicken.",
        tags: ["protein", "balanced"],
      },
      {
        title: "Roti with Chicken and Vegetables",
        description:
          "Whole-wheat roti with a chicken preparation and vegetables.",
        tags: ["protein", "balanced"],
      },
      {
        title: "Egg Rice and Vegetable Bowl",
        description:
          "Rice with egg, vegetables and dal.",
        tags: ["protein", "balanced"],
      },
    ],

    snack: [
      {
        title: "Fruit and Nuts",
        description:
          "Seasonal fruit with mixed nuts.",
        tags: ["simple"],
      },
      {
        title: "Boiled Egg and Fruit",
        description:
          "Boiled egg with seasonal fruit.",
        tags: ["protein"],
      },
      {
        title: "Curd and Fruit",
        description:
          "Plain curd with seasonal fruit.",
        tags: ["protein"],
      },
    ],

    dinner: [
      {
        title: "Chicken, Roti and Vegetables",
        description:
          "Chicken with whole-wheat roti and cooked vegetables.",
        tags: ["protein", "balanced"],
      },
      {
        title: "Dal, Rice and Egg",
        description:
          "Dal and rice with egg and vegetables.",
        tags: ["protein", "balanced"],
      },
      {
        title: "Fish, Rice and Vegetables",
        description:
          "Fish with rice and a serving of cooked vegetables.",
        tags: ["protein", "balanced"],
      },
    ],
  },
};

// ------------------------------------------------------
// Utility functions
// ------------------------------------------------------

const normalizeText = (value) => {
  return String(value || "").trim().toLowerCase();
};

const chooseMeal = (meals, seed) => {
  if (!meals || meals.length === 0) {
    return null;
  }

  const index = Math.abs(seed) % meals.length;
  return meals[index];
};

const calculateSeed = (profile) => {
  const text = [
    profile?.name,
    profile?.activity,
    profile?.dietaryPreference,
    profile?.goal,
    profile?.preferences,
  ]
    .filter(Boolean)
    .join("");

  let seed = 0;

  for (let i = 0; i < text.length; i += 1) {
    seed += text.charCodeAt(i);
  }

  return seed;
};

// ------------------------------------------------------
// Goal-based guidance
// ------------------------------------------------------

const getGoalSummary = (goal) => {
  const normalizedGoal = normalizeText(goal);

  if (normalizedGoal.includes("fitness")) {
    return {
      title: "Fitness Demo",
      summary:
        "The plan emphasizes regular balanced meals and varied food sources that can fit an active routine.",
    };
  }

  if (normalizedGoal.includes("healthy")) {
    return {
      title: "General Healthy Eating",
      summary:
        "The plan emphasizes variety, vegetables, fruits, whole grains and protein-containing foods.",
    };
  }

  return {
    title: "Balanced Wellness",
    summary:
      "The plan emphasizes variety and balance across the day's meals using the selected dietary preference.",
  };
};

// ------------------------------------------------------
// Main recommendation function
// ------------------------------------------------------

export const generateDietPlan = (profile) => {
  const dietaryPreference =
    profile?.dietaryPreference || "Vegetarian";

  const meals =
    mealDatabase[dietaryPreference] ||
    mealDatabase.Vegetarian;

  const seed = calculateSeed(profile);

  const breakfast = chooseMeal(
    meals.breakfast,
    seed + 1
  );

  const lunch = chooseMeal(
    meals.lunch,
    seed + 2
  );

  const snack = chooseMeal(
    meals.snack,
    seed + 3
  );

  const dinner = chooseMeal(
    meals.dinner,
    seed + 4
  );

  const goalInfo = getGoalSummary(profile?.goal);

  const activity =
    profile?.activity || "Moderately Active";

  return {
    id: `local-${Date.now()}`,

    createdAt: new Date().toISOString(),

    profile: {
      dietaryPreference,
      activity,
      goal: goalInfo.title,
    },

    breakfast,
    lunch,
    snack,
    dinner,

    nutritionSummary: {
      overview: goalInfo.summary,

      focus: [
        "Include a variety of food groups.",
        "Prefer fruits and vegetables regularly.",
        "Include suitable protein-containing foods.",
        "Choose whole grains where suitable.",
      ],
    },

    hydrationReminder:
      "Keep water available throughout the day and drink regularly according to your thirst and routine.",

    disclaimer:
      "This is a general educational wellness suggestion, not medical or nutritional advice.",
  };
};

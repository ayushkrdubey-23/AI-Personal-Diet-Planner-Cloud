// ======================================================
// DIET PLAN EXPORT SERVICE
// ======================================================

const downloadBlob = (
  content,
  fileName,
  mimeType
) => {
  const blob = new Blob(
    [content],
    {
      type: mimeType,
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};


// ------------------------------------------------------
// Export plan as TXT
// ------------------------------------------------------

export const exportPlanAsText = (plan) => {
  const lines = [
    "AI-PERSONAL DIET PLANNER",
    "=========================",
    "",

    `Goal: ${
      plan?.profile?.goal ||
      "Balanced Wellness"
    }`,

    `Diet Preference: ${
      plan?.profile?.dietaryPreference ||
      "Vegetarian"
    }`,

    `Activity: ${
      plan?.profile?.activity ||
      "Moderately Active"
    }`,

    "",

    "BREAKFAST",
    "---------",

    plan?.breakfast?.title ||
      "Meal suggestion",

    plan?.breakfast?.description ||
      "",

    "",

    "LUNCH",
    "-----",

    plan?.lunch?.title ||
      "Meal suggestion",

    plan?.lunch?.description ||
      "",

    "",

    "SNACK",
    "-----",

    plan?.snack?.title ||
      "Meal suggestion",

    plan?.snack?.description ||
      "",

    "",

    "DINNER",
    "------",

    plan?.dinner?.title ||
      "Meal suggestion",

    plan?.dinner?.description ||
      "",

    "",

    "NUTRITION SUMMARY",
    "-----------------",

    plan?.nutritionSummary?.overview ||
      "",

    "",

    "FOCUS",
    "-----",

    ...(plan?.nutritionSummary?.focus || []).map(
      (item) => `- ${item}`
    ),

    "",

    "HYDRATION REMINDER",
    "------------------",

    plan?.hydrationReminder ||
      "",

    "",

    "DISCLAIMER",
    "----------",

    plan?.disclaimer ||
      "This is a general educational wellness suggestion, not medical or nutritional advice.",

    "",
  ];

  const content =
    lines.join("\n");

  const datePart =
    new Date()
      .toISOString()
      .split("T")[0];

  downloadBlob(
    content,
    `diet-plan-${datePart}.txt`,
    "text/plain;charset=utf-8"
  );
};


// ------------------------------------------------------
// Export plan as JSON
// ------------------------------------------------------

export const exportPlanAsJSON = (plan) => {
  const content =
    JSON.stringify(
      plan,
      null,
      2
    );

  const datePart =
    new Date()
      .toISOString()
      .split("T")[0];

  downloadBlob(
    content,
    `diet-plan-${datePart}.json`,
    "application/json"
  );
};

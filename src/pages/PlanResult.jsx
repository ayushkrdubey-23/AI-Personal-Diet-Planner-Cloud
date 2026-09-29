import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Check,
  Droplets,
  Leaf,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { saveDietPlan } from "../services/planService";

function PlanResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  const plan = location.state?.plan;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (!plan) {
    return (
      <section className="page-container">
        <div className="feature-placeholder">
          <h2>No plan available</h2>

          <p>
            Generate a new plan from the planner page.
          </p>

          <button
            type="button"
            className="secondary-action"
            onClick={() => navigate("/generate-plan")}
          >
            Generate Plan
          </button>
        </div>
      </section>
    );
  }

  const handleSavePlan = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await saveDietPlan(currentUser.uid, plan);

      setSaved(true);
    } catch (err) {
      console.error("Save plan error:", err);
      setError(
        "Unable to save this plan. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderMeal = (label, meal) => (
    <article className="meal-card">
      <span className="meal-label">{label}</span>

      <h3>
        {meal?.title || "Meal suggestion"}
      </h3>

      <p>
        {meal?.description ||
          "A general wellness meal suggestion."}
      </p>

      {meal?.tags?.length > 0 && (
        <div className="meal-tags">
          {meal.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
    </article>
  );

  return (
    <section className="page-container">
      <div className="result-topbar">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/generate-plan")}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <span className="page-eyebrow">
          GENERATED PLAN
        </span>
      </div>

      <div className="result-header">
        <div>
          <div className="result-title-row">
            <div className="result-title-icon">
              <Sparkles size={24} />
            </div>

            <div>
              <h1>Your Meal Plan</h1>

              <p>
                {plan.profile?.goal ||
                  "Balanced Wellness"}{" "}
                ·{" "}
                {plan.profile?.dietaryPreference ||
                  "Vegetarian"}
              </p>
            </div>
          </div>
        </div>

        <div className="result-actions">
          <button
            type="button"
            className={
              saved
                ? "saved-plan-button"
                : "primary-action"
            }
            onClick={handleSavePlan}
            disabled={saving || saved}
          >
            {saved ? (
              <>
                <Check size={17} />
                Plan Saved
              </>
            ) : (
              <>
                <Bookmark size={17} />
                {saving ? "Saving..." : "Save Plan"}
              </>
            )}
          </button>

          <button
            type="button"
            className="secondary-action"
            onClick={() => navigate("/saved-plans")}
          >
            <Bookmark size={17} />
            Saved Plans
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          <span>{error}</span>
        </div>
      )}

      <div className="meal-grid">
        {renderMeal("BREAKFAST", plan.breakfast)}

        {renderMeal("LUNCH", plan.lunch)}

        {renderMeal("SNACK", plan.snack)}

        {renderMeal("DINNER", plan.dinner)}
      </div>

      <div className="result-bottom-grid">
        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-label">
                WELLNESS SUMMARY
              </span>

              <h2>Nutrition Summary</h2>
            </div>

            <div className="panel-icon">
              <Leaf size={20} />
            </div>
          </div>

          <p className="result-summary">
            {plan.nutritionSummary?.overview}
          </p>

          <div className="summary-list">
            {plan.nutritionSummary?.focus?.map(
              (item) => (
                <div
                  key={item}
                  className="summary-item"
                >
                  <span>✓</span>

                  <p>{item}</p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="dashboard-panel hydration-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-label">
                DAILY REMINDER
              </span>

              <h2>Hydration</h2>
            </div>

            <div className="panel-icon">
              <Droplets size={20} />
            </div>
          </div>

          <p className="result-summary">
            {plan.hydrationReminder}
          </p>
        </div>
      </div>

      <div className="result-disclaimer">
        {plan.disclaimer}
      </div>
    </section>
  );
}

export default PlanResult;
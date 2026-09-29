import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Trash2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  deleteDietPlan,
  getUserPlans,
} from "../services/planService";

function SavedPlans() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlans = async () => {
      if (!currentUser) {
        return;
      }

      try {
        setError("");

        const savedPlans = await getUserPlans(
          currentUser.uid
        );

        setPlans(savedPlans);
      } catch (err) {
        console.error("Load plans error:", err);

        setError(
          "Unable to load your saved plans."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [currentUser]);

  const handleDelete = async (planId) => {
    const confirmed = window.confirm(
      "Delete this saved plan?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDietPlan(planId);

      setPlans((previousPlans) =>
        previousPlans.filter(
          (plan) => plan.id !== planId
        )
      );
    } catch (err) {
      console.error("Delete plan error:", err);

      setError(
        "Unable to delete the selected plan."
      );
    }
  };

  const openPlan = (plan) => {
    navigate("/plan-result", {
      state: {
        plan,
      },
    });
  };

  return (
    <section className="page-container">
      <div className="page-header">
        <span className="page-eyebrow">
          YOUR PLANS
        </span>

        <h1>Saved Plans</h1>

        <p>
          View and manage your previously saved meal-plan
          suggestions.
        </p>
      </div>

      {error && (
        <div className="dashboard-error">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="feature-placeholder">
          <h2>Loading saved plans...</h2>

          <p>
            Please wait while your plans are retrieved
            from Firestore.
          </p>
        </div>
      ) : plans.length === 0 ? (
        <div className="feature-placeholder empty-plans">
          <div className="empty-state-icon">
            <Bookmark size={25} />
          </div>

          <h2>No saved plans yet</h2>

          <p>
            Generate a meal plan and click "Save Plan" to
            store it in your cloud database.
          </p>

          <button
            type="button"
            className="primary-action"
            onClick={() => navigate("/generate-plan")}
          >
            Generate Plan
          </button>
        </div>
      ) : (
        <div className="saved-plans-list">
          {plans.map((plan, index) => (
            <article
              className="saved-plan-card"
              key={plan.id}
            >
              <div className="saved-plan-icon">
                <Bookmark size={21} />
              </div>

              <div className="saved-plan-content">
                <div className="saved-plan-top">
                  <span className="panel-label">
                    PLAN {plans.length - index}
                  </span>

                  <span className="saved-plan-date">
                    <CalendarDays size={14} />

                    {plan.createdAt
                      ? new Date(
                          plan.createdAt
                        ).toLocaleDateString()
                      : "Unknown date"}
                  </span>
                </div>

                <h2>
                  {plan.profile?.goal ||
                    "Balanced Wellness"}
                </h2>

                <p>
                  {plan.profile
                    ?.dietaryPreference ||
                    "Vegetarian"}{" "}
                  ·{" "}
                  {plan.profile?.activity ||
                    "Moderately Active"}
                </p>

                <div className="saved-plan-meals">
                  <span>
                    Breakfast:{" "}
                    {plan.breakfast?.title || "—"}
                  </span>

                  <span>
                    Lunch:{" "}
                    {plan.lunch?.title || "—"}
                  </span>

                  <span>
                    Dinner:{" "}
                    {plan.dinner?.title || "—"}
                  </span>
                </div>
              </div>

              <div className="saved-plan-actions">
                <button
                  type="button"
                  className="view-plan-button"
                  onClick={() => openPlan(plan)}
                >
                  <span>View</span>
                  <ChevronRight size={16} />
                </button>

                <button
                  type="button"
                  className="delete-plan-button"
                  onClick={() =>
                    handleDelete(plan.id)
                  }
                  title="Delete plan"
                  aria-label="Delete plan"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default SavedPlans;
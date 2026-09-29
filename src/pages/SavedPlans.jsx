import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Trash2,
  Server,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getPlansFromApi,
  deletePlanFromApi,
} from "../services/planApiService";

/*
 * Firestore fallback.
 *
 * This allows the page to remain usable during local
 * backend downtime while the primary data source is
 * the FastAPI REST API.
 */
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
  const [source, setSource] = useState("FastAPI");

  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      if (!currentUser) {
        if (isMounted) {
          setPlans([]);
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError("");

      /*
       * Primary data source:
       * FastAPI REST API
       */
      try {
        const apiPlans =
          await getPlansFromApi(
            currentUser
          );

        if (!isMounted) {
          return;
        }

        /*
         * Normalize backend response so the existing
         * UI can continue using plan.id.
         */
        const normalizedPlans =
          apiPlans.map((plan) => ({
            ...plan,
            id:
              plan.id ||
              plan.planId ||
              plan.plan_id,
          }));

        setPlans(normalizedPlans);
        setSource("FastAPI REST API");
      } catch (apiError) {
        console.error(
          "FastAPI saved plans error:",
          apiError
        );

        /*
         * Fallback:
         * Existing Firestore frontend service.
         */
        try {
          const firestorePlans =
            await getUserPlans(
              currentUser.uid
            );

          if (!isMounted) {
            return;
          }

          setPlans(firestorePlans);
          setSource("Firestore fallback");

          setError(
            "FastAPI is currently unavailable, so saved plans were loaded directly from Firestore."
          );
        } catch (firestoreError) {
          console.error(
            "Firestore fallback error:",
            firestoreError
          );

          if (!isMounted) {
            return;
          }

          setPlans([]);

          setError(
            "Unable to load your saved plans from the backend or Firestore."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleDelete = async (planId) => {
    if (!currentUser || !planId) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this saved plan?"
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      /*
       * When FastAPI is active, delete through the
       * authenticated backend endpoint.
       */
      if (
        source === "FastAPI REST API"
      ) {
        await deletePlanFromApi(
          currentUser,
          planId
        );
      } else {
        /*
         * Delete through existing Firestore fallback.
         */
        await deleteDietPlan(
          planId
        );
      }

      setPlans((previousPlans) =>
        previousPlans.filter(
          (plan) =>
            (plan.id ||
              plan.planId ||
              plan.plan_id) !==
            planId
        )
      );
    } catch (err) {
      console.error(
        "Delete plan error:",
        err
      );

      setError(
        err?.message ||
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

        <h1>
          Saved Plans
        </h1>

        <p>
          View and manage your previously saved
          meal-plan suggestions.
        </p>
      </div>

      {/* API source indicator */}
      <div className="storage-info-panel">
        <div className="storage-info-icon">
          <Server size={21} />
        </div>

        <div>
          <h3>
            Plan data source: {source}
          </h3>

          <p>
            Saved plans are retrieved through the
            authenticated FastAPI REST API whenever
            the backend is available.
          </p>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          <CircleAlert size={18} />

          <span>
            {error}
          </span>
        </div>
      )}

      {loading ? (
        <div className="feature-placeholder">
          <h2>
            Loading saved plans...
          </h2>

          <p>
            Your plans are being retrieved from
            the cloud-backed application.
          </p>
        </div>
      ) : plans.length === 0 ? (
        <div className="feature-placeholder empty-plans">
          <div className="empty-state-icon">
            <Bookmark size={25} />
          </div>

          <h2>
            No saved plans yet
          </h2>

          <p>
            Generate a meal plan and click
            "Save Plan" to store it in your
            cloud database.
          </p>

          <button
            type="button"
            className="primary-action"
            onClick={() =>
              navigate("/generate-plan")
            }
          >
            Generate Plan
          </button>
        </div>
      ) : (
        <div className="saved-plans-list">
          {plans.map((plan, index) => {
            const planId =
              plan.id ||
              plan.planId ||
              plan.plan_id;

            return (
              <article
                className="saved-plan-card"
                key={planId}
              >
                <div className="saved-plan-icon">
                  <Bookmark size={21} />
                </div>

                <div className="saved-plan-content">
                  <div className="saved-plan-top">
                    <span className="panel-label">
                      PLAN{" "}
                      {plans.length - index}
                    </span>

                    <span className="saved-plan-date">
                      <CalendarDays
                        size={14}
                      />

                      {plan.createdAt
                        ? new Date(
                            plan.createdAt
                          ).toLocaleDateString()
                        : plan.created_at
                        ? new Date(
                            plan.created_at
                          ).toLocaleDateString()
                        : "Unknown date"}
                    </span>
                  </div>

                  <h2>
                    {plan.profile?.goal ||
                      plan.goal ||
                      "Balanced Wellness"}
                  </h2>

                  <p>
                    {plan.profile
                      ?.dietaryPreference ||
                      plan.dietaryPreference ||
                      "Vegetarian"}{" "}
                    ·{" "}
                    {plan.profile
                      ?.activity ||
                      plan.activity ||
                      "Moderately Active"}
                  </p>

                  <div className="saved-plan-meals">
                    <span>
                      Breakfast:{" "}
                      {plan.breakfast
                        ?.title || "—"}
                    </span>

                    <span>
                      Lunch:{" "}
                      {plan.lunch
                        ?.title || "—"}
                    </span>

                    <span>
                      Dinner:{" "}
                      {plan.dinner
                        ?.title || "—"}
                    </span>
                  </div>
                </div>

                <div className="saved-plan-actions">
                  <button
                    type="button"
                    className="view-plan-button"
                    onClick={() =>
                      openPlan(plan)
                    }
                  >
                    <span>
                      View
                    </span>

                    <ChevronRight
                      size={16}
                    />
                  </button>

                  <button
                    type="button"
                    className="delete-plan-button"
                    onClick={() =>
                      handleDelete(
                        planId
                      )
                    }
                    title="Delete plan"
                    aria-label={`Delete plan ${
                      index + 1
                    }`}
                  >
                    <Trash2
                      size={17}
                    />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default SavedPlans;
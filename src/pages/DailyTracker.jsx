import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CircleAlert,
  Droplets,
  Save,
  Utensils,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  getDailyTracker,
  saveDailyTracker,
} from "../services/trackerService";

function DailyTracker() {
  const { currentUser } = useAuth();

  const today = useMemo(() => {
    return new Date()
      .toISOString()
      .split("T")[0];
  }, []);

  const [form, setForm] = useState({
    breakfastCompleted: false,
    lunchCompleted: false,
    snackCompleted: false,
    dinnerCompleted: false,
    waterServings: 0,
    note: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTracker = async () => {
      if (!currentUser) {
        return;
      }

      try {
        setError("");

        const existingTracker =
          await getDailyTracker(
            currentUser.uid,
            today
          );

        if (existingTracker) {
          setForm({
            breakfastCompleted:
              Boolean(
                existingTracker.breakfastCompleted
              ),

            lunchCompleted:
              Boolean(
                existingTracker.lunchCompleted
              ),

            snackCompleted:
              Boolean(
                existingTracker.snackCompleted
              ),

            dinnerCompleted:
              Boolean(
                existingTracker.dinnerCompleted
              ),

            waterServings:
              Number(
                existingTracker.waterServings
              ) || 0,

            note:
              existingTracker.note || "",
          });
        }
      } catch (err) {
        console.error(
          "Tracker loading error:",
          err
        );

        setError(
          "Unable to load today's tracker."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTracker();
  }, [currentUser, today]);

  const handleMealToggle = (field) => {
    setForm((previousForm) => ({
      ...previousForm,
      [field]:
        !previousForm[field],
    }));
  };

  const handleWaterChange = (change) => {
    setForm((previousForm) => ({
      ...previousForm,
      waterServings: Math.max(
        0,
        Math.min(
          20,
          Number(
            previousForm.waterServings
          ) + change
        )
      ),
    }));
  };

  const handleNoteChange = (event) => {
    setForm((previousForm) => ({
      ...previousForm,
      note: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      setError(
        "Please login before using the daily tracker."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await saveDailyTracker(
        currentUser.uid,
        today,
        form
      );

      setMessage(
        "Today's tracker has been saved to Firestore."
      );
    } catch (err) {
      console.error(
        "Tracker save error:",
        err
      );

      setError(
        "Unable to save today's tracker."
      );
    } finally {
      setSaving(false);
    }
  };

  const completedMeals = [
    form.breakfastCompleted,
    form.lunchCompleted,
    form.snackCompleted,
    form.dinnerCompleted,
  ].filter(Boolean).length;

  const completionPercent =
    Math.round(
      (completedMeals / 4) * 100
    );

  if (loading) {
    return (
      <section className="page-container">
        <div className="feature-placeholder">
          <h2>Loading daily tracker...</h2>

          <p>
            Retrieving today's cloud-saved tracker.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <div className="page-header">
        <span className="page-eyebrow">
          DAILY TRACKER
        </span>

        <h1>Today's Tracker</h1>

        <p>
          Record simple daily meal completion and
          hydration activity for your progress dashboard.
        </p>
      </div>

      {message && (
        <div className="tracker-success">
          <Check size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="dashboard-error">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="tracker-layout">
          {/* Meal checklist */}
          <div className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-label">
                  DAILY MEALS
                </span>

                <h2>
                  Meal Completion
                </h2>
              </div>

              <div className="panel-icon">
                <Utensils size={20} />
              </div>
            </div>

            <div className="meal-checklist">
              <button
                type="button"
                className={
                  form.breakfastCompleted
                    ? "meal-check-item completed"
                    : "meal-check-item"
                }
                onClick={() =>
                  handleMealToggle(
                    "breakfastCompleted"
                  )
                }
              >
                <span className="meal-check-box">
                  {form.breakfastCompleted && (
                    <Check size={15} />
                  )}
                </span>

                <span>
                  <strong>Breakfast</strong>
                  <small>
                    Mark when completed
                  </small>
                </span>
              </button>

              <button
                type="button"
                className={
                  form.lunchCompleted
                    ? "meal-check-item completed"
                    : "meal-check-item"
                }
                onClick={() =>
                  handleMealToggle(
                    "lunchCompleted"
                  )
                }
              >
                <span className="meal-check-box">
                  {form.lunchCompleted && (
                    <Check size={15} />
                  )}
                </span>

                <span>
                  <strong>Lunch</strong>
                  <small>
                    Mark when completed
                  </small>
                </span>
              </button>

              <button
                type="button"
                className={
                  form.snackCompleted
                    ? "meal-check-item completed"
                    : "meal-check-item"
                }
                onClick={() =>
                  handleMealToggle(
                    "snackCompleted"
                  )
                }
              >
                <span className="meal-check-box">
                  {form.snackCompleted && (
                    <Check size={15} />
                  )}
                </span>

                <span>
                  <strong>Snack</strong>
                  <small>
                    Mark when completed
                  </small>
                </span>
              </button>

              <button
                type="button"
                className={
                  form.dinnerCompleted
                    ? "meal-check-item completed"
                    : "meal-check-item"
                }
                onClick={() =>
                  handleMealToggle(
                    "dinnerCompleted"
                  )
                }
              >
                <span className="meal-check-box">
                  {form.dinnerCompleted && (
                    <Check size={15} />
                  )}
                </span>

                <span>
                  <strong>Dinner</strong>
                  <small>
                    Mark when completed
                  </small>
                </span>
              </button>
            </div>

            <div className="tracker-progress">
              <div className="tracker-progress-header">
                <span>
                  Meal completion
                </span>

                <strong>
                  {completionPercent}%
                </strong>
              </div>

              <div className="tracker-progress-bar">
                <div
                  style={{
                    width: `${completionPercent}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Hydration */}
          <div className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-label">
                  HYDRATION
                </span>

                <h2>
                  Water Servings
                </h2>
              </div>

              <div className="panel-icon">
                <Droplets size={20} />
              </div>
            </div>

            <div className="water-counter">
              <div className="water-number">
                {form.waterServings}
              </div>

              <span>
                servings recorded today
              </span>
            </div>

            <div className="water-actions">
              <button
                type="button"
                onClick={() =>
                  handleWaterChange(-1)
                }
                disabled={
                  form.waterServings <= 0
                }
              >
                −
              </button>

              <button
                type="button"
                onClick={() =>
                  handleWaterChange(1)
                }
                disabled={
                  form.waterServings >= 20
                }
              >
                +
              </button>
            </div>

            <p className="tracker-helper">
              This is a simple activity tracker. It does
              not calculate medical hydration requirements.
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className="dashboard-panel tracker-notes-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-label">
                OPTIONAL
              </span>

              <h2>Daily Note</h2>
            </div>
          </div>

          <textarea
            value={form.note}
            onChange={handleNoteChange}
            placeholder="Example: Completed my planned meals today."
            rows={4}
            maxLength={500}
          />

          <div className="tracker-form-footer">
            <span>
              {today}
            </span>

            <button
              type="submit"
              className="primary-action"
              disabled={saving}
            >
              <Save size={17} />

              {saving
                ? "Saving..."
                : "Save Today's Tracker"}
            </button>
          </div>
        </div>
      </form>

      <div className="result-disclaimer">
        This tracker is an educational/general wellness
        feature and does not provide medical or
        nutritional advice.
      </div>
    </section>
  );
}

export default DailyTracker;

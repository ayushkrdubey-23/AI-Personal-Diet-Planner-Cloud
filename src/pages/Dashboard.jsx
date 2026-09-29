import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Target,
  Utensils,
  Sparkles,
  Bookmark,
  Cloud,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  CalendarDays,
  Trash2,
  Droplets,
  Activity,
  ClipboardCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import { getUserProfile } from "../services/userService";

import {
  getUserPlans,
  deleteDietPlan,
} from "../services/planService";

import {
  getUserTrackers,
} from "../services/trackerService";

import {
  getLocalFiles,
} from "../services/storageService";

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [plans, setPlans] = useState([]);
  const [trackers, setTrackers] = useState([]);
  const [fileCount, setFileCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      if (!currentUser) {
        return;
      }

      try {
        setError("");

        const [
          userProfile,
          userPlans,
          userTrackers,
        ] = await Promise.all([
          getUserProfile(currentUser.uid),
          getUserPlans(currentUser.uid),
          getUserTrackers(currentUser.uid),
        ]);

        setProfile(userProfile);
        setPlans(userPlans);
        setTrackers(userTrackers);

        // Files are currently stored through the
        // local object-storage simulation.
        const localFiles = getLocalFiles(
          currentUser.uid
        );

        setFileCount(localFiles.length);
      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          "Unable to load your dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [currentUser]);

  const handleDeletePlan = async (planId) => {
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
      console.error(
        "Delete plan error:",
        err
      );

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

  const displayName =
    profile?.name ||
    currentUser?.email?.split("@")[0] ||
    "User";

  const profileComplete = Boolean(
    profile?.name &&
      profile?.age &&
      profile?.dietaryPreference &&
      profile?.goal
  );

  const latestPlan = plans[0];

  const previousPlans = plans.slice(
    1,
    4
  );

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const todayTracker = trackers.find(
    (tracker) =>
      tracker.date === today
  );

  const getMealCompletionCount = (
    tracker
  ) => {
    if (!tracker) {
      return 0;
    }

    return [
      tracker.breakfastCompleted,
      tracker.lunchCompleted,
      tracker.snackCompleted,
      tracker.dinnerCompleted,
    ].filter(Boolean).length;
  };

  const todayMealCount =
    getMealCompletionCount(
      todayTracker
    );

  const todayMealPercent = Math.round(
    (todayMealCount / 4) * 100
  );

  const trackedDays = trackers.length;

  const averageMealCompletion =
    trackers.length > 0
      ? Math.round(
          (trackers.reduce(
            (sum, tracker) =>
              sum +
              getMealCompletionCount(
                tracker
              ),
            0
          ) /
            (trackers.length * 4)) *
            100
        )
      : 0;

  const averageWater =
    trackers.length > 0
      ? (
          trackers.reduce(
            (sum, tracker) =>
              sum +
              (Number(
                tracker.waterServings
              ) || 0),
            0
          ) / trackers.length
        ).toFixed(1)
      : "0.0";

  // Last seven calendar days
  const lastSevenDays =
    useMemo(() => {
      const days = [];

      for (let i = 6; i >= 0; i -= 1) {
        const date = new Date();

        date.setDate(
          date.getDate() - i
        );

        const dateString =
          date
            .toISOString()
            .split("T")[0];

        const tracker =
          trackers.find(
            (item) =>
              item.date ===
              dateString
          );

        days.push({
          date: dateString,
          label: date.toLocaleDateString(
            undefined,
            {
              weekday: "short",
            }
          ),
          percent: tracker
            ? Math.round(
                (getMealCompletionCount(
                  tracker
                ) /
                  4) *
                  100
              )
            : 0,
          tracked: Boolean(tracker),
        });
      }

      return days;
    }, [trackers]);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Unknown date";
    }

    return new Date(
      dateValue
    ).toLocaleDateString();
  };

  if (loading) {
    return (
      <section className="page-container dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>

          <p>
            Loading your progress dashboard...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <span className="page-eyebrow">
            PROGRESS DASHBOARD
          </span>

          <h1>
            Welcome, {displayName}
          </h1>

          <p>
            Review your saved plans and simple daily
            wellness activity from one place.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={() =>
            navigate("/daily-tracker")
          }
        >
          <ClipboardCheck size={18} />
          Open Daily Tracker
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Profile overview */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <Target size={21} />
          </div>

          <div>
            <span className="dashboard-card-label">
              Current Goal
            </span>

            <h3>
              {profile?.goal ||
                "Not set"}
            </h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <Utensils size={21} />
          </div>

          <div>
            <span className="dashboard-card-label">
              Diet Preference
            </span>

            <h3>
              {profile?.dietaryPreference ||
                "Not set"}
            </h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <Bookmark size={21} />
          </div>

          <div>
            <span className="dashboard-card-label">
              Saved Plans
            </span>

            <h3>
              {plans.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Progress metrics */}
      <div className="dashboard-grid progress-metrics-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <Activity size={21} />
          </div>

          <div>
            <span className="dashboard-card-label">
              Tracked Days
            </span>

            <h3>
              {trackedDays}
            </h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <ClipboardCheck size={21} />
          </div>

          <div>
            <span className="dashboard-card-label">
              Average Meal Completion
            </span>

            <h3>
              {averageMealCompletion}%
            </h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <Droplets size={21} />
          </div>

          <div>
            <span className="dashboard-card-label">
              Avg. Water Servings
            </span>

            <h3>
              {averageWater}
            </h3>
          </div>
        </div>
      </div>

      {/* Today's progress */}
      <div className="dashboard-panel today-progress-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-label">
              TODAY
            </span>

            <h2>
              Today's Progress
            </h2>
          </div>

          <div className="panel-icon">
            <Activity size={20} />
          </div>
        </div>

        <div className="today-progress-layout">
          <div className="today-progress-circle">
            <strong>
              {todayMealPercent}%
            </strong>

            <span>
              meals completed
            </span>
          </div>

          <div className="today-progress-details">
            <div>
              <span>Breakfast</span>

              <strong>
                {todayTracker
                  ?.breakfastCompleted
                  ? "Completed"
                  : "Not marked"}
              </strong>
            </div>

            <div>
              <span>Lunch</span>

              <strong>
                {todayTracker
                  ?.lunchCompleted
                  ? "Completed"
                  : "Not marked"}
              </strong>
            </div>

            <div>
              <span>Snack</span>

              <strong>
                {todayTracker
                  ?.snackCompleted
                  ? "Completed"
                  : "Not marked"}
              </strong>
            </div>

            <div>
              <span>Dinner</span>

              <strong>
                {todayTracker
                  ?.dinnerCompleted
                  ? "Completed"
                  : "Not marked"}
              </strong>
            </div>

            <div>
              <span>Water servings</span>

              <strong>
                {todayTracker
                  ?.waterServings || 0}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="secondary-action"
            onClick={() =>
              navigate("/daily-tracker")
            }
          >
            Update Today
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Seven-day activity */}
      <div className="dashboard-panel weekly-progress-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-label">
              ACTIVITY HISTORY
            </span>

            <h2>
              Last 7 Days
            </h2>
          </div>

          <div className="panel-icon">
            <CalendarDays size={20} />
          </div>
        </div>

        <div className="weekly-bars">
          {lastSevenDays.map(
            (day) => (
              <div
                className="weekly-bar-item"
                key={day.date}
              >
                <div className="weekly-bar-value">
                  {day.percent}%
                </div>

                <div className="weekly-bar-track">
                  <div
                    style={{
                      height: `${Math.max(
                        day.percent,
                        day.tracked
                          ? 5
                          : 0
                      )}%`,
                    }}
                  ></div>
                </div>

                <span>
                  {day.label}
                </span>
              </div>
            )
          )}
        </div>

        <p className="dashboard-helper-text">
          Days without a saved tracker are shown as
          untracked. This is an activity visualization,
          not a medical progress assessment.
        </p>
      </div>

      {/* Latest + Previous Plans */}
      <div className="dashboard-sections">
        {/* Latest Plan */}
        <div className="dashboard-panel latest-plan-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-label">
                MOST RECENT
              </span>

              <h2>
                Latest Plan
              </h2>
            </div>

            <div className="panel-icon">
              <Sparkles size={20} />
            </div>
          </div>

          {latestPlan ? (
            <div className="latest-plan-card">
              <div className="latest-plan-meta">
                <span>
                  {latestPlan.profile
                    ?.dietaryPreference ||
                    "Vegetarian"}
                </span>

                <span>
                  <CalendarDays size={14} />

                  {formatDate(
                    latestPlan.createdAt
                  )}
                </span>
              </div>

              <h3>
                {latestPlan.profile?.goal ||
                  "Balanced Wellness"}
              </h3>

              <div className="latest-plan-meals">
                <div>
                  <small>
                    Breakfast
                  </small>

                  <strong>
                    {latestPlan.breakfast
                      ?.title || "—"}
                  </strong>
                </div>

                <div>
                  <small>
                    Lunch
                  </small>

                  <strong>
                    {latestPlan.lunch
                      ?.title || "—"}
                  </strong>
                </div>

                <div>
                  <small>
                    Snack
                  </small>

                  <strong>
                    {latestPlan.snack
                      ?.title || "—"}
                  </strong>
                </div>

                <div>
                  <small>
                    Dinner
                  </small>

                  <strong>
                    {latestPlan.dinner
                      ?.title || "—"}
                  </strong>
                </div>
              </div>

              <div className="latest-plan-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() =>
                    openPlan(
                      latestPlan
                    )
                  }
                >
                  View Latest Plan
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className="delete-plan-button"
                  onClick={() =>
                    handleDeletePlan(
                      latestPlan.id
                    )
                  }
                  title="Delete latest plan"
                  aria-label="Delete latest plan"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Sparkles size={25} />
              </div>

              <h3>
                No plan generated yet
              </h3>

              <p>
                Create your first general wellness
                meal-plan suggestion.
              </p>

              <button
                type="button"
                className="secondary-action"
                onClick={() =>
                  navigate(
                    "/generate-plan"
                  )
                }
              >
                Generate Plan
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>

        {/* Previous Plans */}
        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-label">
                HISTORY
              </span>

              <h2>
                Previous Plans
              </h2>
            </div>

            <div className="panel-icon">
              <Bookmark size={20} />
            </div>
          </div>

          {previousPlans.length > 0 ? (
            <div className="previous-plans-list">
              {previousPlans.map(
                (plan) => (
                  <div
                    className="previous-plan-item"
                    key={plan.id}
                  >
                    <div>
                      <strong>
                        {plan.profile?.goal ||
                          "Balanced Wellness"}
                      </strong>

                      <span>
                        {plan.profile
                          ?.dietaryPreference ||
                          "Vegetarian"}
                      </span>

                      <small>
                        {formatDate(
                          plan.createdAt
                        )}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="previous-plan-view"
                      onClick={() =>
                        openPlan(plan)
                      }
                      aria-label="View plan"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="empty-state compact">
              <div className="empty-state-icon">
                <Bookmark size={23} />
              </div>

              <h3>
                No previous plans
              </h3>

              <p>
                Save additional plans and
                they'll appear here.
              </p>

              <button
                type="button"
                className="text-action"
                onClick={() =>
                  navigate(
                    "/saved-plans"
                  )
                }
              >
                Open Saved Plans
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-panel quick-actions-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-label">
              QUICK ACTIONS
            </span>

            <h2>
              Manage Your Planner
            </h2>
          </div>
        </div>

        <div className="quick-actions-grid">
          <button
            type="button"
            className="quick-action"
            onClick={() =>
              navigate("/profile")
            }
          >
            <span className="quick-action-icon">
              <User size={20} />
            </span>

            <span className="quick-action-content">
              <strong>
                Update Profile
              </strong>

              <small>
                Manage your wellness preferences
              </small>
            </span>

            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            className="quick-action"
            onClick={() =>
              navigate(
                "/generate-plan"
              )
            }
          >
            <span className="quick-action-icon">
              <Sparkles size={20} />
            </span>

            <span className="quick-action-content">
              <strong>
                Generate Plan
              </strong>

              <small>
                Create a new meal-plan suggestion
              </small>
            </span>

            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            className="quick-action"
            onClick={() =>
              navigate(
                "/saved-plans"
              )
            }
          >
            <span className="quick-action-icon">
              <Bookmark size={20} />
            </span>

            <span className="quick-action-content">
              <strong>
                Saved Plans
              </strong>

              <small>
                View your saved plans
              </small>
            </span>

            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            className="quick-action"
            onClick={() =>
              navigate(
                "/cloud-files"
              )
            }
          >
            <span className="quick-action-icon">
              <Cloud size={20} />
            </span>

            <span className="quick-action-content">
              <strong>
                Cloud Files
              </strong>

              <small>
                {fileCount} file
                {fileCount === 1
                  ? ""
                  : "s"} in storage
              </small>
            </span>

            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* Profile status */}
      {!profileComplete && (
        <div className="profile-notice">
          <div className="profile-notice-icon">
            <CircleAlert size={20} />
          </div>

          <div className="profile-notice-content">
            <h3>
              Complete your profile
            </h3>

            <p>
              Add your basic profile and food preferences
              before generating a plan.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
          >
            Complete Profile
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {profileComplete && (
        <div className="profile-success">
          <CheckCircle2 size={20} />

          <div>
            <strong>
              Your profile is ready.
            </strong>

            <p>
              Continue tracking activity or generating
              general wellness plans.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default Dashboard;
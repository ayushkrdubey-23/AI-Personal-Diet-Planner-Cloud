import { useEffect, useState } from "react";
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
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";
import {
  getUserPlans,
  deleteDietPlan,
} from "../services/planService";

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      if (!currentUser) {
        return;
      }

      try {
        setError("");

        const [userProfile, userPlans] =
          await Promise.all([
            getUserProfile(currentUser.uid),
            getUserPlans(currentUser.uid),
          ]);

        setProfile(userProfile);
        setPlans(userPlans);
      } catch (err) {
        console.error("Dashboard loading error:", err);

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
  const previousPlans = plans.slice(1, 4);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Unknown date";
    }

    return new Date(dateValue).toLocaleDateString();
  };

  if (loading) {
    return (
      <section className="page-container dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>

          <p>Loading your dashboard...</p>
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
            PERSONAL WELLNESS DASHBOARD
          </span>

          <h1>
            Welcome, {displayName}
          </h1>

          <p>
            Manage your profile, create general wellness
            meal-plan suggestions, and review your saved
            plans.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={() =>
            navigate("/generate-plan")
          }
        >
          <Sparkles size={18} />
          Generate New Plan
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Overview */}
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
              {profile?.goal || "Not set"}
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

            <h3>{plans.length}</h3>
          </div>
        </div>
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

              <h2>Latest Plan</h2>
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
                  <small>Breakfast</small>
                  <strong>
                    {latestPlan.breakfast?.title ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <small>Lunch</small>
                  <strong>
                    {latestPlan.lunch?.title ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <small>Snack</small>
                  <strong>
                    {latestPlan.snack?.title ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <small>Dinner</small>
                  <strong>
                    {latestPlan.dinner?.title ||
                      "—"}
                  </strong>
                </div>
              </div>

              <div className="latest-plan-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() =>
                    openPlan(latestPlan)
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

              <h3>No plan generated yet</h3>

              <p>
                Create your first general wellness meal-plan
                suggestion using your saved profile preferences.
              </p>

              <button
                type="button"
                className="secondary-action"
                onClick={() =>
                  navigate("/generate-plan")
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

              <h2>Previous Plans</h2>
            </div>

            <div className="panel-icon">
              <Bookmark size={20} />
            </div>
          </div>

          {previousPlans.length > 0 ? (
            <div className="previous-plans-list">
              {previousPlans.map((plan) => (
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
              ))}
            </div>
          ) : (
            <div className="empty-state compact">
              <div className="empty-state-icon">
                <Bookmark size={23} />
              </div>

              <h3>No previous plans</h3>

              <p>
                After you save more plans, previous
                plans will appear here.
              </p>

              <button
                type="button"
                className="text-action"
                onClick={() =>
                  navigate("/saved-plans")
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

            <h2>Manage Your Planner</h2>
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
              <strong>Update Profile</strong>

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
              navigate("/generate-plan")
            }
          >
            <span className="quick-action-icon">
              <Sparkles size={20} />
            </span>

            <span className="quick-action-content">
              <strong>Generate Plan</strong>

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
              navigate("/saved-plans")
            }
          >
            <span className="quick-action-icon">
              <Bookmark size={20} />
            </span>

            <span className="quick-action-content">
              <strong>Saved Plans</strong>

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
              navigate("/cloud-files")
            }
          >
            <span className="quick-action-icon">
              <Cloud size={20} />
            </span>

            <span className="quick-action-content">
              <strong>Cloud Files</strong>

              <small>
                Manage uploaded demo files
              </small>
            </span>

            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* Profile Status */}
      {!profileComplete && (
        <div className="profile-notice">
          <div className="profile-notice-icon">
            <CircleAlert size={20} />
          </div>

          <div className="profile-notice-content">
            <h3>Complete your profile</h3>

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
              You can continue generating and saving plans.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default Dashboard;
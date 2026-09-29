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
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      if (!currentUser) {
        return;
      }

      try {
        setError("");

        const userProfile = await getUserProfile(
          currentUser.uid
        );

        setProfile(userProfile);
      } catch (err) {
        console.error("Dashboard profile error:", err);
        setError("Unable to load your profile information.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [currentUser]);

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
            Manage your profile and create general wellness
            meal-plan suggestions from one place.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={() => navigate("/generate-plan")}
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

      {/* Overview cards */}
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
              {profile?.dietaryPreference || "Not set"}
            </h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <User size={21} />
          </div>

          <div>
            <span className="dashboard-card-label">
              Profile Status
            </span>

            <h3>
              {profileComplete
                ? "Complete"
                : "Needs Update"}
            </h3>
          </div>
        </div>
      </div>

      {/* Main dashboard sections */}
      <div className="dashboard-sections">
        {/* Latest Plan */}
        <div className="dashboard-panel latest-plan-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-label">
                DIET PLANS
              </span>

              <h2>Latest Plan</h2>
            </div>

            <div className="panel-icon">
              <Sparkles size={20} />
            </div>
          </div>

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
              onClick={() => navigate("/generate-plan")}
            >
              Generate Plan
              <ArrowRight size={17} />
            </button>
          </div>
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

          <div className="empty-state compact">
            <div className="empty-state-icon">
              <Bookmark size={23} />
            </div>

            <h3>No saved plans</h3>

            <p>
              Your generated plans will appear here after
              the plan-storage module is connected.
            </p>

            <button
              type="button"
              className="text-action"
              onClick={() => navigate("/saved-plans")}
            >
              Open Saved Plans
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
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
            onClick={() => navigate("/profile")}
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
            onClick={() => navigate("/generate-plan")}
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
            onClick={() => navigate("/saved-plans")}
          >
            <span className="quick-action-icon">
              <Bookmark size={20} />
            </span>

            <span className="quick-action-content">
              <strong>Saved Plans</strong>
              <small>
                View previously generated plans
              </small>
            </span>

            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            className="quick-action"
            onClick={() => navigate("/cloud-files")}
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

      {/* Profile completion notice */}
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
            onClick={() => navigate("/profile")}
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
            <strong>Your profile is ready.</strong>

            <p>
              You can now continue to the plan generator.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default Dashboard;
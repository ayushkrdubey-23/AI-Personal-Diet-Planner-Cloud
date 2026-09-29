import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  User,
  Utensils,
  Target,
  WandSparkles,
  CircleAlert,
  Server,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";
import { generateDietPlan } from "../ai_engine/dietEngine";
import { generatePlanFromAPI } from "../services/apiService";

function GeneratePlan() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");
  const [generationSource, setGenerationSource] =
    useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        return;
      }

      try {
        setError("");

        const data = await getUserProfile(
          currentUser.uid
        );

        setProfile(data);
      } catch (err) {
        console.error("Profile loading error:", err);

        setError(
          "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleGenerate = async () => {
    if (!profile || !currentUser) {
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setGenerationSource("");

      let plan;

      try {
        // Preferred path:
        // React -> FastAPI -> Backend AI Engine
        plan = await generatePlanFromAPI(
          profile,
          currentUser.uid
        );

        setGenerationSource("backend");
      } catch (backendError) {
        // Required fallback:
        // If the API is unavailable, use
        // the local rule-based recommendation engine.
        console.warn(
          "Backend unavailable. Using local fallback.",
          backendError
        );

        plan = generateDietPlan(profile);

        setGenerationSource("local-fallback");
      }

      navigate("/plan-result", {
        state: {
          plan,
        },
      });
    } catch (err) {
      console.error(
        "Plan generation error:",
        err
      );

      setError(
        "Unable to generate a meal plan."
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <section className="page-container">
        <div className="feature-placeholder">
          <h2>Loading profile...</h2>

          <p>
            Please wait while your profile preferences
            are loaded.
          </p>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="page-container">
        <div className="feature-placeholder">
          <div className="empty-state-icon">
            <User size={24} />
          </div>

          <h2>Complete your profile first</h2>

          <p>
            Add your basic profile and dietary
            preferences before generating a plan.
          </p>

          <button
            type="button"
            className="secondary-action"
            onClick={() =>
              navigate("/profile")
            }
          >
            Go to Profile
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <div className="page-header">
        <span className="page-eyebrow">
          AI PLANNER · REST API
        </span>

        <h1>Generate Diet Plan</h1>

        <p>
          Your saved profile preferences are sent to
          the FastAPI recommendation service. A local
          rule-based engine remains available as a
          fallback.
        </p>
      </div>

      {error && (
        <div className="dashboard-error">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {generationSource === "backend" && (
        <div className="generation-success">
          <Server size={18} />

          <div>
            <strong>
              Generated through FastAPI
            </strong>

            <span>
              React successfully received the plan
              from the backend AI engine.
            </span>
          </div>
        </div>
      )}

      {generationSource === "local-fallback" && (
        <div className="generation-fallback">
          <ShieldCheck size={18} />

          <div>
            <strong>
              Local fallback was used
            </strong>

            <span>
              The backend was unavailable, so the
              local rule-based recommendation engine
              generated the plan.
            </span>
          </div>
        </div>
      )}

      <div className="planner-layout">
        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-label">
                YOUR INPUTS
              </span>

              <h2>Profile Preferences</h2>
            </div>

            <div className="panel-icon">
              <User size={20} />
            </div>
          </div>

          <div className="planner-info-grid">
            <div className="planner-info">
              <span>
                <Utensils size={16} />
                Diet Preference
              </span>

              <strong>
                {profile.dietaryPreference ||
                  "Not set"}
              </strong>
            </div>

            <div className="planner-info">
              <span>
                <Target size={16} />
                Goal
              </span>

              <strong>
                {profile.goal ||
                  "Not set"}
              </strong>
            </div>

            <div className="planner-info">
              <span>
                <Sparkles size={16} />
                Activity
              </span>

              <strong>
                {profile.activity ||
                  "Not set"}
              </strong>
            </div>

            <div className="planner-info">
              <span>
                <WandSparkles size={16} />
                Preferences
              </span>

              <strong>
                {profile.preferences ||
                  "No extra preference"}
              </strong>
            </div>
          </div>

          <div className="planner-disclaimer">
            <CircleAlert size={17} />

            <p>
              This feature demonstrates a recommendation
              engine for educational/general wellness
              purposes. It does not provide medical or
              nutritional advice.
            </p>
          </div>

          <button
            type="button"
            className="primary-action planner-generate-button"
            onClick={handleGenerate}
            disabled={generating}
          >
            <Sparkles size={18} />

            {generating
              ? "Generating..."
              : "Generate Meal Plan"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default GeneratePlan;
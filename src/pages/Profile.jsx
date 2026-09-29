import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../services/userService";

function Profile() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    activity: "Moderately Active",
    dietaryPreference: "Vegetarian",
    goal: "Balanced Wellness",
    allergies: "",
    preferences: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load profile after Firebase finishes checking authentication
  useEffect(() => {
    if (authLoading) {
      return;
    }

    const loadProfile = async () => {
      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setError("");

        const profile = await getUserProfile(currentUser.uid);

        if (profile) {
          setForm({
            name: profile.name || "",
            age: profile.age || "",
            height: profile.height || "",
            weight: profile.weight || "",
            activity:
              profile.activity || "Moderately Active",
            dietaryPreference:
              profile.dietaryPreference || "Vegetarian",
            goal:
              profile.goal || "Balanced Wellness",
            allergies: profile.allergies || "",
            preferences: profile.preferences || "",
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, authLoading, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // Save profile to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const existingProfile = await getUserProfile(currentUser.uid);

      if (existingProfile) {
        await updateUserProfile(currentUser.uid, form);
      } else {
        await createUserProfile(currentUser.uid, form);
      }

      setMessage("Profile saved successfully.");
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Wait for Firebase authentication
  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>Checking authentication...</h2>
          <p className="auth-subtitle">
            Please wait while we verify your login session.
          </p>
        </div>
      </div>
    );
  }

  // This is normally handled by ProtectedRoute
  if (!currentUser) {
    return null;
  }

  // Wait while Firestore profile is loading
  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>Loading profile...</h2>
          <p className="auth-subtitle">
            Please wait while your profile is being loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Your Profile</h1>

        <p className="auth-subtitle">
          Enter your general wellness preferences.
        </p>

        {message && (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>

          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />

          <label htmlFor="age">Age</label>

          <input
            id="age"
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            placeholder="Enter age"
            min="1"
            required
          />

          <label htmlFor="height">Height</label>

          <input
            id="height"
            type="text"
            name="height"
            value={form.height}
            onChange={handleChange}
            placeholder="Example: 170 cm"
          />

          <label htmlFor="weight">Weight</label>

          <input
            id="weight"
            type="text"
            name="weight"
            value={form.weight}
            onChange={handleChange}
            placeholder="Example: 60 kg"
          />

          <label htmlFor="activity">Activity Level</label>

          <select
            id="activity"
            name="activity"
            value={form.activity}
            onChange={handleChange}
          >
            <option value="Sedentary">Sedentary</option>
            <option value="Lightly Active">
              Lightly Active
            </option>
            <option value="Moderately Active">
              Moderately Active
            </option>
            <option value="Very Active">Very Active</option>
          </select>

          <label htmlFor="dietaryPreference">
            Dietary Preference
          </label>

          <select
            id="dietaryPreference"
            name="dietaryPreference"
            value={form.dietaryPreference}
            onChange={handleChange}
          >
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="Non-Vegetarian">
              Non-Vegetarian
            </option>
          </select>

          <label htmlFor="goal">Goal</label>

          <select
            id="goal"
            name="goal"
            value={form.goal}
            onChange={handleChange}
          >
            <option value="Balanced Wellness">
              Balanced Wellness
            </option>

            <option value="Fitness Demo">
              Fitness Demo
            </option>

            <option value="General Healthy Eating">
              General Healthy Eating
            </option>
          </select>

          <label htmlFor="allergies">Allergies</label>

          <input
            id="allergies"
            type="text"
            name="allergies"
            value={form.allergies}
            onChange={handleChange}
            placeholder="Optional"
          />

          <label htmlFor="preferences">
            Food Preferences
          </label>

          <input
            id="preferences"
            type="text"
            name="preferences"
            value={form.preferences}
            onChange={handleChange}
            placeholder="Optional"
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{
            background: "#6b7280",
            marginTop: "8px",
          }}
        >
          Back to Dashboard
        </button>

        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginTop: "20px",
            lineHeight: "1.5",
          }}
        >
          This project provides general wellness and
          educational information. It is not medical or
          nutritional advice.
        </p>
      </div>
    </div>
  );
}

export default Profile;
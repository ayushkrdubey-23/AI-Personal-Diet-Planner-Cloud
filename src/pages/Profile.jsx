import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Server } from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../services/userService";

import {
  getProfileFromApi,
  saveProfileToApi,
} from "../services/profileApiService";


function Profile() {
  const {
    currentUser,
    loading: authLoading,
  } = useAuth();

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


  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [source, setSource] =
    useState("FastAPI REST API");


  // ------------------------------------------------------
  // Load profile
  // ------------------------------------------------------

  useEffect(() => {
    if (authLoading) {
      return;
    }


    const loadProfile =
      async () => {
        if (!currentUser) {
          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;
        }


        setLoading(true);
        setError("");
        setMessage("");


        try {
          /*
           * Primary source:
           * FastAPI REST API
           */

          const apiProfile =
            await getProfileFromApi(
              currentUser
            );


          if (apiProfile) {
            setForm({
              name:
                apiProfile.name || "",

              age:
                apiProfile.age || "",

              height:
                apiProfile.height || "",

              weight:
                apiProfile.weight || "",

              activity:
                apiProfile.activity ||
                "Moderately Active",

              dietaryPreference:
                apiProfile.dietaryPreference ||
                "Vegetarian",

              goal:
                apiProfile.goal ||
                "Balanced Wellness",

              allergies:
                apiProfile.allergies || "",

              preferences:
                apiProfile.preferences || "",
            });

            setSource(
              "FastAPI REST API"
            );

            return;
          }


          /*
           * No profile exists in API yet.
           *
           * Check existing Firestore profile so
           * previously stored data remains available.
           */

          try {
            const firestoreProfile =
              await getUserProfile(
                currentUser.uid
              );


            if (firestoreProfile) {
              setForm({
                name:
                  firestoreProfile.name ||
                  "",

                age:
                  firestoreProfile.age ||
                  "",

                height:
                  firestoreProfile.height ||
                  "",

                weight:
                  firestoreProfile.weight ||
                  "",

                activity:
                  firestoreProfile.activity ||
                  "Moderately Active",

                dietaryPreference:
                  firestoreProfile.dietaryPreference ||
                  "Vegetarian",

                goal:
                  firestoreProfile.goal ||
                  "Balanced Wellness",

                allergies:
                  firestoreProfile.allergies ||
                  "",

                preferences:
                  firestoreProfile.preferences ||
                  "",
              });

              setSource(
                "Firestore fallback"
              );
            }
          } catch (firestoreError) {
            console.error(
              "Firestore profile fallback error:",
              firestoreError
            );
          }
        } catch (apiError) {
          console.error(
            "FastAPI profile error:",
            apiError
          );


          /*
           * Fallback to existing Firestore service.
           */

          try {
            const firestoreProfile =
              await getUserProfile(
                currentUser.uid
              );


            if (firestoreProfile) {
              setForm({
                name:
                  firestoreProfile.name ||
                  "",

                age:
                  firestoreProfile.age ||
                  "",

                height:
                  firestoreProfile.height ||
                  "",

                weight:
                  firestoreProfile.weight ||
                  "",

                activity:
                  firestoreProfile.activity ||
                  "Moderately Active",

                dietaryPreference:
                  firestoreProfile.dietaryPreference ||
                  "Vegetarian",

                goal:
                  firestoreProfile.goal ||
                  "Balanced Wellness",

                allergies:
                  firestoreProfile.allergies ||
                  "",

                preferences:
                  firestoreProfile.preferences ||
                  "",
              });
            }

            setSource(
              "Firestore fallback"
            );

            setError(
              "FastAPI is currently unavailable, so your profile was loaded directly from Firestore."
            );
          } catch (firestoreError) {
            console.error(
              "Firestore profile error:",
              firestoreError
            );

            setError(
              "Unable to load your profile."
            );
          }
        } finally {
          setLoading(false);
        }
      };


    loadProfile();
  }, [
    currentUser,
    authLoading,
    navigate,
  ]);


  // ------------------------------------------------------
  // Input changes
  // ------------------------------------------------------

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;


    setForm(
      (previousForm) => ({
        ...previousForm,
        [name]: value,
      })
    );


    if (error) {
      setError("");
    }


    if (message) {
      setMessage("");
    }
  };


  // ------------------------------------------------------
  // Save profile
  // ------------------------------------------------------

  const handleSubmit =
    async (event) => {
      event.preventDefault();


      if (!currentUser) {
        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }


      setError("");
      setMessage("");
      setSaving(true);


      try {
        /*
         * Primary source:
         * FastAPI
         */

        await saveProfileToApi(
          currentUser,
          form
        );


        setSource(
          "FastAPI REST API"
        );

        setMessage(
          "Profile saved successfully through FastAPI and Firestore."
        );
      } catch (apiError) {
        console.error(
          "FastAPI profile save error:",
          apiError
        );


        /*
         * Fallback:
         * Existing Firestore service
         */

        try {
          const existingProfile =
            await getUserProfile(
              currentUser.uid
            );


          if (existingProfile) {
            await updateUserProfile(
              currentUser.uid,
              form
            );
          } else {
            await createUserProfile(
              currentUser.uid,
              form
            );
          }


          setSource(
            "Firestore fallback"
          );

          setMessage(
            "Profile saved successfully to Firestore."
          );
        } catch (firestoreError) {
          console.error(
            "Firestore profile save error:",
            firestoreError
          );

          setError(
            "Unable to save your profile. Please try again."
          );
        }
      } finally {
        setSaving(false);
      }
    };


  // ------------------------------------------------------
  // Authentication loading
  // ------------------------------------------------------

  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>
            Checking authentication...
          </h2>

          <p className="auth-subtitle">
            Please wait while we verify
            your login session.
          </p>
        </div>
      </div>
    );
  }


  // ------------------------------------------------------
  // No user
  // ------------------------------------------------------

  if (!currentUser) {
    return null;
  }


  // ------------------------------------------------------
  // Profile loading
  // ------------------------------------------------------

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>
            Loading profile...
          </h2>

          <p className="auth-subtitle">
            Please wait while your profile
            is being loaded.
          </p>
        </div>
      </div>
    );
  }


  // ------------------------------------------------------
  // Main UI
  // ------------------------------------------------------

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>
          Your Profile
        </h1>

        <p className="auth-subtitle">
          Enter your general wellness
          preferences.
        </p>


        {/* API source */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            marginBottom: "16px",
            borderRadius: "8px",
            background: "#eff6ff",
            color: "#1e40af",
            fontSize: "13px",
          }}
        >
          <Server size={16} />

          <span>
            Data source:{" "}
            <strong>
              {source}
            </strong>
          </span>
        </div>


        {/* Success */}
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


        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* Form */}
        <form
          onSubmit={
            handleSubmit
          }
        >

          {/* Name */}
          <label htmlFor="name">
            Name
          </label>

          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={
              handleChange
            }
            placeholder="Enter your name"
            required
          />


          {/* Age */}
          <label htmlFor="age">
            Age
          </label>

          <input
            id="age"
            type="number"
            name="age"
            value={form.age}
            onChange={
              handleChange
            }
            placeholder="Enter age"
            min="1"
            required
          />


          {/* Height */}
          <label htmlFor="height">
            Height
          </label>

          <input
            id="height"
            type="text"
            name="height"
            value={form.height}
            onChange={
              handleChange
            }
            placeholder="Example: 170 cm"
          />


          {/* Weight */}
          <label htmlFor="weight">
            Weight
          </label>

          <input
            id="weight"
            type="text"
            name="weight"
            value={form.weight}
            onChange={
              handleChange
            }
            placeholder="Example: 60 kg"
          />


          {/* Activity */}
          <label htmlFor="activity">
            Activity Level
          </label>

          <select
            id="activity"
            name="activity"
            value={
              form.activity
            }
            onChange={
              handleChange
            }
          >
            <option value="Sedentary">
              Sedentary
            </option>

            <option value="Lightly Active">
              Lightly Active
            </option>

            <option value="Moderately Active">
              Moderately Active
            </option>

            <option value="Very Active">
              Very Active
            </option>
          </select>


          {/* Dietary preference */}
          <label htmlFor="dietaryPreference">
            Dietary Preference
          </label>

          <select
            id="dietaryPreference"
            name="dietaryPreference"
            value={
              form.dietaryPreference
            }
            onChange={
              handleChange
            }
          >
            <option value="Vegetarian">
              Vegetarian
            </option>

            <option value="Vegan">
              Vegan
            </option>

            <option value="Non-Vegetarian">
              Non-Vegetarian
            </option>
          </select>


          {/* Goal */}
          <label htmlFor="goal">
            Goal
          </label>

          <select
            id="goal"
            name="goal"
            value={form.goal}
            onChange={
              handleChange
            }
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


          {/* Allergies */}
          <label htmlFor="allergies">
            Allergies
          </label>

          <input
            id="allergies"
            type="text"
            name="allergies"
            value={
              form.allergies
            }
            onChange={
              handleChange
            }
            placeholder="Optional"
          />


          {/* Preferences */}
          <label htmlFor="preferences">
            Food Preferences
          </label>

          <input
            id="preferences"
            type="text"
            name="preferences"
            value={
              form.preferences
            }
            onChange={
              handleChange
            }
            placeholder="Optional"
          />


          {/* Save */}
          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Profile"}
          </button>

        </form>


        {/* Back */}
        <button
          type="button"
          onClick={() =>
            navigate("/dashboard")
          }
          style={{
            background: "#6b7280",
            marginTop: "8px",
          }}
        >
          Back to Dashboard
        </button>


        {/* Disclaimer */}
        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginTop: "20px",
            lineHeight: "1.5",
          }}
        >
          This project provides general
          wellness and educational
          information. It is not medical
          or nutritional advice.
        </p>

      </div>
    </div>
  );
}


export default Profile;
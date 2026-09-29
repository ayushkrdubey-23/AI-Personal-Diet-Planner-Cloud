import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import GeneratePlan from "./pages/GeneratePlan";
import SavedPlans from "./pages/SavedPlans";
import CloudFiles from "./pages/CloudFiles";
import PlanResult from "./pages/PlanResult";
import DailyTracker from "./pages/DailyTracker";
import Landing from "./pages/Landing";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route
          path="/"
          element={<Landing />}
        />

        {/* Public Authentication Pages */}
        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Protected Application */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/generate-plan"
              element={<GeneratePlan />}
            />

            <Route
              path="/saved-plans"
              element={<SavedPlans />}
            />

            <Route
              path="/cloud-files"
              element={<CloudFiles />}
            />

            <Route
              path="/daily-tracker"
              element={<DailyTracker />}
            />

            <Route
              path="/plan-result"
              element={<PlanResult />}
            />
          </Route>
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
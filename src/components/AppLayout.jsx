import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>
          AI Personal Diet Planner · General wellness
          and educational project
        </p>

        <p>
          This application does not provide medical
          or nutritional advice.
        </p>
      </footer>
    </div>
  );
}

export default AppLayout;

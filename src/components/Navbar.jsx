import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  Sparkles,
  Bookmark,
  Cloud,
  LogOut,
  Leaf,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setMobileOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/profile",
      label: "Profile",
      icon: User,
    },
    {
      to: "/generate-plan",
      label: "Generate Plan",
      icon: Sparkles,
    },
    {
      to: "/saved-plans",
      label: "Saved Plans",
      icon: Bookmark,
    },
    {
      to: "/cloud-files",
      label: "Cloud Files",
      icon: Cloud,
    },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink
          to="/dashboard"
          className="navbar-brand"
          onClick={closeMobileMenu}
        >
          <span className="brand-icon">
            <Leaf size={21} />
          </span>

          <span className="brand-text">
            AI Diet Planner
          </span>
        </NavLink>

        <nav className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="navbar-user desktop-user">
          <span className="user-email">
            {currentUser?.email}
          </span>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive
                    ? "mobile-nav-link active"
                    : "mobile-nav-link"
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="mobile-user">
            <span>{currentUser?.email}</span>

            <button
              type="button"
              className="mobile-logout"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

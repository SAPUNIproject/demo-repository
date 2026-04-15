import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Layout.css";

export default function Layout() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const role = localStorage.getItem("role");
  const nav = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    nav("/");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2 className="logo">DocFlow</h2>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/documents">Documents</NavLink>

          {role === "ADMIN" && <NavLink to="/users">Users</NavLink>}
        </nav>
      </aside>

      <div className="layout-main">
        <header className="topbar">
          <h1>Document Versioning System</h1>

          <div className="profile-menu-wrapper">
            <button
              className="profile-btn"
              onClick={() => setShowProfileMenu((prev) => !prev)}
            >
              <div className="avatar">A</div>
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link
                  to="/profile"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Profile
                </Link>

                <Link
                  to="/settings"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Settings
                </Link>

                <button
                  className="profile-dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
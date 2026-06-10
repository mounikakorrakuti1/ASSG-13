import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ darkMode, setDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">💼</span>
          <span className="brand-text">Mini<span className="brand-accent">Job</span>Portal</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive("/")}`}>
            Browse Jobs
          </Link>

          {/* Recruiter links */}
          {isAuthenticated && user?.role === "recruiter" && (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive("/dashboard")}`}>
                Dashboard
              </Link>
              <Link to="/post-job" className={`nav-link ${isActive("/post-job")}`}>
                Post a Job
              </Link>
            </>
          )}

          {/* Candidate links */}
          {isAuthenticated && user?.role === "jobseeker" && (
            <>
              <Link to="/candidate/dashboard" className={`nav-link ${isActive("/candidate/dashboard")}`}>
                My Dashboard
              </Link>
              <Link to="/candidate/saved-jobs" className={`nav-link ${isActive("/candidate/saved-jobs")}`}>
                Saved Jobs
              </Link>
            </>
          )}
        </div>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <>
              <span className="nav-user" title={user?.email}>
                {user?.role === "jobseeker" ? "🎓" : "👤"} {user?.name?.split(" ")[0]}
              </span>
              <button className="btn btn-outline-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary-sm">Register</Link>
            </>
          )}

          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { Link, useNavigate } from "react-router-dom";
import { projectConfig } from "../../config/projectConfig";
import { useAuth } from "../../hooks/useAuth";

export function Navbar() {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-logo">{projectConfig.branding.logoText}</span>
        <span>{projectConfig.projectName}</span>
      </Link>
      <nav className="navbar-actions">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">
              Dashboard
            </Link>
            <button className="btn btn-secondary btn-sm" onClick={handleSignOut}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <header className="app-topbar">
          <span className="app-topbar-user">{user?.email}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>
            Log out
          </button>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;

import { NavLink } from "react-router-dom";
import { getEnabledNavItems } from "../../config/navigationConfig";
import { projectConfig } from "../../config/projectConfig";

export function Sidebar() {
  const items = getEnabledNavItems();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="navbar-logo">{projectConfig.branding.logoText}</span>
        <span>{projectConfig.shortName}</span>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;

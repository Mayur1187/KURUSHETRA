/**
 * Navigation is config-driven so the sidebar/navbar can be changed
 * (or items enabled/disabled per feature flag) without touching the
 * layout components themselves.
 */
import { projectConfig } from "./projectConfig";

export const navigationConfig = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: "home", enabled: true },
  { id: "workspace", label: "Workspace", path: "/workspace", icon: "layers", enabled: true },
  {
    id: "history",
    label: "History",
    path: "/history",
    icon: "clock",
    enabled: projectConfig.features.history,
  },
  { id: "profile", label: "Profile", path: "/profile", icon: "user", enabled: true },
];

export const getEnabledNavItems = () => navigationConfig.filter((item) => item.enabled);

export default navigationConfig;

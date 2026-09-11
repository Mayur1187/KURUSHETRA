import { Link } from "react-router-dom";
import { Card } from "../common/Card";
import { EmptyState } from "../common/EmptyState";

export function RecentProjects({ projects = [] }) {
  return (
    <Card title="Recent projects">
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet."
          description="Create your first project to get started."
          action={
            <Link to="/workspace" className="btn btn-primary btn-sm">
              New Project
            </Link>
          }
        />
      ) : (
        <ul className="list">
          {projects.slice(0, 5).map((p) => (
            <li key={p.id} className="list-item">
              <div>
                <p className="list-item-title">{p.title}</p>
                <p className="list-item-subtitle">{p.status}</p>
              </div>
              <Link to="/workspace" className="btn btn-ghost btn-sm">
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default RecentProjects;

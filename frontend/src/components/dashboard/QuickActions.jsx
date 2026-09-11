import { Link } from "react-router-dom";
import { projectConfig } from "../../config/projectConfig";
import { Card } from "../common/Card";

export function QuickActions() {
  return (
    <Card title="Quick actions">
      <div className="quick-actions">
        {projectConfig.quickActions.map((action) => (
          <Link key={action.id} to={action.path} className="btn btn-primary">
            {action.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}

export default QuickActions;

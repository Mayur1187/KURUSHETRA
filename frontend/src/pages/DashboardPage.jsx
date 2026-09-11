import { useEffect } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import { QuickActions } from "../components/dashboard/QuickActions";
import { RecentProjects } from "../components/dashboard/RecentProjects";
import { Card } from "../components/common/Card";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { Loader } from "../components/common/Loader";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();
  const { data: projects, error, loading, run } = useApi(api.projects.list);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <AppLayout>
      <h1>Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ""}</h1>

      <div className="dashboard-grid">
        <QuickActions />

        {loading && <Loader label="Loading your projects..." />}
        {error && <ErrorMessage error={error} onRetry={run} />}
        {!loading && !error && <RecentProjects projects={projects || []} />}

        <Card title="Recent activity">
          <p className="muted">Activity will appear here as you use the platform.</p>
        </Card>
      </div>
    </AppLayout>
  );
}

export default DashboardPage;

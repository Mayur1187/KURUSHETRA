import { useEffect, useState } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import { Card } from "../components/common/Card";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { Loader } from "../components/common/Loader";
import { ProcessingStatus } from "../components/forms/ProcessingStatus";
import { ResultViewer } from "../components/results/ResultViewer";
import { DomainInputForm } from "../modules/domain/components/DomainInputForm";
import { domainConfig } from "../modules/domain/config/domainConfig";
import { api } from "../services/api";
import { useApi } from "../hooks/useApi";

export function WorkspacePage() {
  const { data: projects, run: loadProjects } = useApi(api.projects.list);
  const [projectId, setProjectId] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (!projectId && projects && projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const ensureProject = async () => {
    if (projectId) return projectId;
    setCreatingProject(true);
    try {
      const project = await api.projects.create({ title: "Untitled Project" });
      setProjectId(project.id);
      return project.id;
    } finally {
      setCreatingProject(false);
    }
  };

  const handleSubmit = async (inputData) => {
    setError(null);
    setOutcome(null);
    setProcessing(true);
    try {
      const activeProjectId = await ensureProject();
      const result = await api.processing.submit({
        project_id: activeProjectId,
        request_type: domainConfig.requestType,
        input_data: inputData,
      });
      setOutcome(result);
    } catch (err) {
      setError(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppLayout>
      <h1>Workspace</h1>
      <p className="muted">
        Provide input below. It will be sent to Flask, processed by the configured AI provider,
        and the result will be saved to your history.
      </p>

      <div className="workspace-grid">
        <Card title={domainConfig.inputLabel}>
          {creatingProject && <Loader label="Setting up your project..." />}
          <DomainInputForm onSubmit={handleSubmit} submitting={processing || creatingProject} />
        </Card>

        <Card title={domainConfig.resultLabel}>
          <ProcessingStatus active={processing} />
          <ErrorMessage error={error} />
          {!processing && outcome?.result && (
            <ResultViewer
              resultData={outcome.result.result_data}
              metadata={outcome.result.metadata}
            />
          )}
          {!processing && !outcome && !error && (
            <p className="muted">Your result will appear here after processing.</p>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

export default WorkspacePage;

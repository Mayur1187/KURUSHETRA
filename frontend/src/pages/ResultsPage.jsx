import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { Card } from "../components/common/Card";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { Loader } from "../components/common/Loader";
import { ResultViewer } from "../components/results/ResultViewer";
import { api } from "../services/api";
import { useApi } from "../hooks/useApi";

export function ResultsPage() {
  const { id } = useParams();
  const { data: result, error, loading, run } = useApi(api.results.get);

  useEffect(() => {
    if (id) run(id);
  }, [id, run]);

  return (
    <AppLayout>
      <h1>Result</h1>
      {loading && <Loader label="Loading result..." />}
      {error && <ErrorMessage error={error} onRetry={() => run(id)} />}
      {!loading && !error && result && (
        <Card title="Result detail">
          <ResultViewer resultData={result.result_data} metadata={result.metadata} />
        </Card>
      )}
    </AppLayout>
  );
}

export default ResultsPage;

import { useEffect, useState } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { Loader } from "../components/common/Loader";
import { ConfirmationDialog } from "../components/common/Modal";
import { ResultViewer } from "../components/results/ResultViewer";
import { api } from "../services/api";
import { useApi } from "../hooks/useApi";

export function HistoryPage() {
  const { data: results, error, loading, run } = useApi(api.results.list);
  const [selected, setSelected] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    run();
  }, [run]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await api.results.delete(pendingDelete);
    setPendingDelete(null);
    setSelected(null);
    run();
  };

  return (
    <AppLayout>
      <h1>History</h1>

      {loading && <Loader label="Loading your history..." />}
      {error && <ErrorMessage error={error} onRetry={run} />}

      {!loading && !error && (!results || results.length === 0) && (
        <EmptyState
          title="No results yet."
          description="Results you generate in the Workspace will show up here."
        />
      )}

      {!loading && !error && results && results.length > 0 && (
        <div className="history-grid">
          <Card title="Past results">
            <ul className="list">
              {results.map((r) => (
                <li key={r.id} className="list-item">
                  <div>
                    <p className="list-item-title">
                      {r.result_data?.summary?.slice(0, 60) || "Result"}
                    </p>
                    <p className="list-item-subtitle">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="list-item-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(r)}>
                      View
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setPendingDelete(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Detail">
            {selected ? (
              <ResultViewer resultData={selected.result_data} metadata={selected.metadata} />
            ) : (
              <p className="muted">Select a result to view its detail.</p>
            )}
          </Card>
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(pendingDelete)}
        title="Delete result"
        message="This can't be undone. Delete this result?"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AppLayout>
  );
}

export default HistoryPage;

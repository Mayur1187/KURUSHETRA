import { useCallback, useState } from "react";

/**
 * Standardizes the loading / error / data pattern used across every
 * page that calls the backend, so components don't each reinvent it.
 */
export function useApi(apiFn) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  return { data, error, loading, run, setData };
}

export default useApi;

import { useState, useEffect, useCallback, useRef } from 'react';

export function useLiveQuery<T>(
  queryFn: () => Promise<T>,
  intervalMs: number = 15000,
  options?: { enabled?: boolean }
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const enabled = options?.enabled ?? true;
  const queryFnRef = useRef(queryFn);

  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  const fetchRef = useRef(async (isSilent: boolean) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await queryFnRef.current();
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  });

  const refetch = useCallback(() => {
    fetchRef.current(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Fetch on mount
    fetchRef.current(false);

    // Setup interval
    const tick = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        fetchRef.current(true);
      }
    };
    const intervalId = setInterval(tick, intervalMs);

    // Focus listener
    const onFocus = () => {
      if (navigator.onLine) {
        fetchRef.current(true);
      }
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [enabled, intervalMs]);

  return { data, error, isLoading, isRefreshing, refetch };
}

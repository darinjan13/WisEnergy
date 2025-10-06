import { useState, useEffect, useRef } from 'react';

export function useCachedData(fetchFunction, dependencies = [], cacheTime = 5 * 60 * 1000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchTime = useRef(null);
  const cacheRef = useRef(null);

  useEffect(() => {
    const now = Date.now();
    const shouldFetch = !lastFetchTime.current || (now - lastFetchTime.current) > cacheTime;

    if (!shouldFetch && cacheRef.current) {
      setData(cacheRef.current);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchFunction();

        if (isMounted) {
          setData(result);
          cacheRef.current = result;
          lastFetchTime.current = Date.now();
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          console.error('useCachedData error:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const invalidateCache = () => {
    lastFetchTime.current = null;
    cacheRef.current = null;
  };

  const refetch = async () => {
    invalidateCache();
    setLoading(true);
    try {
      const result = await fetchFunction();
      setData(result);
      cacheRef.current = result;
      lastFetchTime.current = Date.now();
      setError(null);
    } catch (err) {
      setError(err);
      console.error('useCachedData refetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch, invalidateCache };
}

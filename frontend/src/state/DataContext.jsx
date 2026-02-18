import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const fetchItems = useCallback(async ({ page = 1, limit = 10, q = '', signal } = {}) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });

      if (q.trim()) {
        params.set('q', q.trim());
      }

      const res = await fetch(`/api/items?${params.toString()}`, { signal });

      if (!res.ok) {
        throw new Error('Failed to fetch items');
      }

      const json = await res.json();

      if (signal?.aborted) {
        return;
      }

      setItems(json.items || []);
      setPagination(
        json.pagination || {
          page: 1,
          limit,
          total: 0,
          totalPages: 1
        }
      );
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      setError(err.message || 'Something went wrong');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  return (
    <DataContext.Provider value={{ items, loading, error, pagination, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);

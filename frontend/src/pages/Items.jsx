import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';

const PAGE_SIZE = 20;
const ROW_HEIGHT = 56;
const LIST_HEIGHT = 420;

function ItemRow({ index, style, data }) {
  const item = data[index];

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '0 12px',
        borderBottom: '1px solid #ececec',
        boxSizing: 'border-box'
      }}
    >
      <Link to={'/items/' + item.id}>{item.name}</Link>
      <span>
        {item.category} | ${item.price}
      </span>
    </div>
  );
}

function Items() {
  const { items, loading, error, pagination, fetchItems } = useData();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    fetchItems({
      page,
      limit: PAGE_SIZE,
      q: query,
      signal: controller.signal
    }).catch(console.error);

    return () => {
      controller.abort();
    };
  }, [fetchItems, page, query]);

  const hasNoResults = !loading && items.length === 0;

  const onSearchChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Items</h2>

      <div style={{ marginBottom: 12 }}>
        <input
          type="search"
          value={query}
          onChange={onSearchChange}
          placeholder="Search by name or category"
          aria-label="Search items"
          style={{ width: '100%', maxWidth: 360, padding: 8 }}
        />
      </div>

      {error ? <p role="alert">Error: {error}</p> : null}
      {loading ? <p>Loading...</p> : null}
      {hasNoResults ? <p>No items found.</p> : null}

      {!hasNoResults ? (
        <div style={{ border: '1px solid #ddd', borderRadius: 6, overflow: 'hidden' }}>
          <List
            height={LIST_HEIGHT}
            itemCount={items.length}
            itemSize={ROW_HEIGHT}
            width="100%"
            itemData={items}
          >
            {ItemRow}
          </List>
        </div>
      ) : null}

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={pagination.page <= 1 || loading}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
          disabled={pagination.page >= pagination.totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Items;

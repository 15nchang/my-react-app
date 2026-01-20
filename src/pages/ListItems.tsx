import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listItems, searchItems } from '../api'
import type { Item } from '../api'

export default function ListItems() {
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setLoading(true)
    if (searchQuery.trim()) {
      searchItems(searchQuery, page)
        .then((data) => {
          setItems(data.items)
          setTotal(data.total)
        })
        .catch((err) => setError(String(err)))
        .finally(() => setLoading(false))
    } else {
      listItems(page)
        .then((data) => {
          setItems(data.items)
          setTotal(data.total)
        })
        .catch((err) => setError(String(err)))
        .finally(() => setLoading(false))
    }
  }, [page, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(0)
  }

  const limit = 10
  const totalPages = Math.ceil(total / limit)
  const canPrevious = page > 0
  const canNext = page < totalPages - 1

  return (
    <section>
      <h2>Items</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by ID or content..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}
      {!loading && !items.length && <p className="muted">No items found.</p>}

      <div className="items-list">
        {items.map((it) => {
          const summary = it.description && it.description.length > 150 
            ? it.description.slice(0, 150) + '...' 
            : it.description
          return (
            <article key={it.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>{it.title}</h3>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>ID: {it.id}</span>
              </div>
              <div className="item-meta">{new Date(it.created_at).toLocaleString()}</div>
              {summary && <p className="muted">{summary}</p>}
              {it.file_location && (
                <p style={{ marginTop: 8 }}>
                  <Link to={`/items/${it.id}`}>View details.</Link>
                </p>
              )}
            </article>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={!canPrevious}
            className="btn"
            style={{ opacity: canPrevious ? 1 : 0.5, cursor: canPrevious ? 'pointer' : 'not-allowed' }}
          >
            ← Previous
          </button>
          <span style={{ color: '#888' }}>Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!canNext}
            className="btn"
            style={{ opacity: canNext ? 1 : 0.5, cursor: canNext ? 'pointer' : 'not-allowed' }}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listItems } from '../api'
import type { Item } from '../api'

export default function Trash() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    listItems(page, 'eliminate')
      .then((data) => {
        setItems(data.items)
        setTotal(data.total)
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [page])

  const limit = 10
  const totalPages = Math.ceil(total / limit)
  const canPrevious = page > 0
  const canNext = page < totalPages - 1

  return (
    <section>
      <h2>Trash</h2>
      <p className="muted">Items marked for elimination.</p>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}
      {!loading && !items.length && <p className="muted">No items in trash.</p>}

      <div className="items-list">
        {items.map((it) => {
          const summary = it.description && it.description.length > 150 
            ? it.description.slice(0, 150) + '...' 
            : it.description
          return (
            <article key={it.id} className="card">
              <h3>{it.title}</h3>
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

      <p style={{ marginTop: 20 }}>
        <Link to="/">← Back to Inbox</Link>
      </p>
    </section>
  )
}

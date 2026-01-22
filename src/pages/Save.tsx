import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listItems } from '../api'
import type { Item } from '../api'

export default function Save() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'eliminate' | 'incubate' | 'file'>('all')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    if (filter === 'all') {
      // Fetch all non-actionable items
      Promise.all([
        listItems(page, 'eliminate'),
        listItems(page, 'incubate'),
        listItems(page, 'file')
      ])
        .then(([eliminate, incubate, file]) => {
          const allItems = [
            ...eliminate.items,
            ...incubate.items,
            ...file.items
          ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          setItems(allItems)
          setTotal(eliminate.total + incubate.total + file.total)
        })
        .catch((err) => setError(String(err)))
        .finally(() => setLoading(false))
    } else {
      listItems(page, filter)
        .then((data) => {
          setItems(data.items)
          setTotal(data.total)
        })
        .catch((err) => setError(String(err)))
        .finally(() => setLoading(false))
    }
  }, [page, filter])

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'eliminate':
        return 'Trash'
      case 'incubate':
        return 'Someday/Maybe'
      case 'file':
        return 'Reference'
      default:
        return category
    }
  }

  const limit = 10
  const totalPages = filter === 'all' ? 1 : Math.ceil(total / limit)
  const canPrevious = page > 0
  const canNext = page < totalPages - 1

  return (
    <section>
      <h2>Saved Items</h2>
      <p className="muted">Items marked as eliminate, incubate, or file.</p>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setFilter('all'); setPage(0); }}
          className={filter === 'all' ? 'btn' : 'btn secondary'}
          style={{ fontSize: '0.9rem' }}
        >
          All
        </button>
        <button
          onClick={() => { setFilter('eliminate'); setPage(0); }}
          className={filter === 'eliminate' ? 'btn' : 'btn secondary'}
          style={{ fontSize: '0.9rem' }}
        >
          Trash
        </button>
        <button
          onClick={() => { setFilter('incubate'); setPage(0); }}
          className={filter === 'incubate' ? 'btn' : 'btn secondary'}
          style={{ fontSize: '0.9rem' }}
        >
          Someday/Maybe
        </button>
        <button
          onClick={() => { setFilter('file'); setPage(0); }}
          className={filter === 'file' ? 'btn' : 'btn secondary'}
          style={{ fontSize: '0.9rem' }}
        >
          Reference
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}
      {!loading && !items.length && <p className="muted">No saved items.</p>}

      <div className="items-list">
        {items.map((it) => {
          const summary = it.description && it.description.length > 150 
            ? it.description.slice(0, 150) + '...' 
            : it.description
          return (
            <article key={it.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0' }}>{it.title}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#6366f1', marginBottom: 8 }}>
                    {getCategoryLabel(it.category)}
                  </div>
                  <div className="item-meta">{new Date(it.created_at).toLocaleString()}</div>
                  {summary && <p className="muted">{summary}</p>}
                  {it.file_location && (
                    <p style={{ marginTop: 8 }}>
                      <Link to={`/items/${it.id}`}>View details.</Link>
                    </p>
                  )}
                </div>
              </div>
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

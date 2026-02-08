import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listItems, searchItems, updateItemFields } from '../api'
import type { Item } from '../api'
import { useSettings } from '../hooks/useSettings'
import Settings from './Settings'

export default function Action() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const { settings } = useSettings()
  const [showSettings, setShowSettings] = useState(false)

  const statusColor = (it: Item) => {
    if (it.done) return settings.doneColor
    if (it.due_date) {
      const due = new Date(it.due_date)
      const now = new Date()
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays < 0) return settings.overdueColor
      if (diffDays <= settings.warningDays) return settings.warningColor
    }
    return settings.defaultColor
  }

  useEffect(() => {
    setLoading(true)
    if (searchQuery.trim()) {
      searchItems(searchQuery, page, 'actionable')
        .then((data) => {
          setItems(data.items)
          setTotal(data.total)
        })
        .catch((err) => setError(String(err)))
        .finally(() => setLoading(false))
    } else {
      listItems(page, 'actionable')
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
      <h2>Actions</h2>
      <p className="muted">Items marked as actionable.</p>
      
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search actions..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '8px 12px', 
            fontSize: '0.95rem',
            border: '1px solid #ddd',
            borderRadius: '6px'
          }}
        />
        <div style={{ marginTop: 8 }}>
          <button
            className="btn secondary"
            onClick={() => setShowSettings(s => !s)}
            style={{ fontSize: '0.9rem', padding: '6px 12px' }}
          >
            {showSettings ? 'Hide Settings' : 'Show Settings'}
          </button>
        </div>
      </div>

      {showSettings && (
        <div style={{ marginBottom: 20 }}>
          <Settings showBackLink={false} />
        </div>
      )}
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}
      {!loading && !items.length && <p className="muted">No actions. All caught up!</p>}

      <div className="items-list">
        {items.map((it) => {
          const summary = it.description && it.description.length > 150 
            ? it.description.slice(0, 150) + '...' 
            : it.description
          return (
            <article key={it.id} className="card" style={{ borderLeft: `6px solid ${statusColor(it)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0' }}>{it.title}</h3>
                  <div className="item-meta">{new Date(it.created_at).toLocaleString()}</div>
                  {it.due_date && (
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>Due: {new Date(it.due_date).toLocaleDateString()}</div>
                  )}
                  {it.done && (
                    <div style={{ fontSize: '0.85rem', color: '#22c55e', marginTop: 4 }}>Done</div>
                  )}
                  {summary && <p className="muted" style={{ marginTop: 8 }}>{summary}</p>}
                  {it.file_location && (
                    <p style={{ marginTop: 8 }}>
                      <Link to={`/items/${it.id}`}>View details.</Link>
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 12 }}>
                  <button
                    className="btn secondary"
                    disabled={updatingId === it.id}
                    onClick={async () => {
                      setUpdatingId(it.id)
                      try {
                        await updateItemFields(it.id, { done: !it.done })
                        setItems(prev => prev.map(x => x.id === it.id ? { ...x, done: !x.done } : x))
                      } catch (e) {
                        setError(String(e))
                      } finally {
                        setUpdatingId(null)
                      }
                    }}
                    style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                  >
                    {updatingId === it.id ? 'Updating...' : (it.done ? 'Mark Undone' : 'Mark Done')}
                  </button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn secondary"
                      disabled={updatingId === it.id}
                      onClick={async () => {
                        const val = window.prompt('Enter due date (YYYY-MM-DD)', it.due_date ? it.due_date.substring(0, 10) : '')
                        if (val === null) return
                        const trimmed = val.trim()
                        if (!trimmed) {
                          // clear due date
                          setUpdatingId(it.id)
                          try {
                            await updateItemFields(it.id, { due_date: null })
                            setItems(prev => prev.map(x => x.id === it.id ? { ...x, due_date: null } : x))
                          } catch (e) {
                            setError(String(e))
                          } finally {
                            setUpdatingId(null)
                          }
                          return
                        }
                        const iso = new Date(trimmed)
                        if (isNaN(iso.getTime())) {
                          setError('Invalid date format')
                          return
                        }
                        setUpdatingId(it.id)
                        try {
                          await updateItemFields(it.id, { due_date: iso.toISOString() })
                          setItems(prev => prev.map(x => x.id === it.id ? { ...x, due_date: iso.toISOString() } : x))
                        } catch (e) {
                          setError(String(e))
                        } finally {
                          setUpdatingId(null)
                        }
                      }}
                      style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                    >
                      {updatingId === it.id ? 'Updating...' : 'Set Due Date'}
                    </button>
                    <button
                      className="btn secondary"
                      disabled={updatingId === it.id || !it.due_date}
                      onClick={async () => {
                        if (!it.due_date) return
                        setUpdatingId(it.id)
                        try {
                          await updateItemFields(it.id, { due_date: null })
                          setItems(prev => prev.map(x => x.id === it.id ? { ...x, due_date: null } : x))
                        } catch (e) {
                          setError(String(e))
                        } finally {
                          setUpdatingId(null)
                        }
                      }}
                      style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                    >
                      {updatingId === it.id ? 'Updating...' : 'Clear Due Date'}
                    </button>
                  </div>
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

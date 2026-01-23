import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listItems, searchItems, updateItemCategory } from '../api'
import type { Item } from '../api'

export default function Inbox() {
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeItem, setActiveItem] = useState<number | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    setLoading(true)
    if (searchQuery.trim()) {
      searchItems(searchQuery, page, 'inbox')
        .then((data) => {
          setItems(data.items)
          setTotal(data.total)
        })
        .catch((err) => setError(String(err)))
        .finally(() => setLoading(false))
    } else {
      listItems(page, 'inbox')
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

  const handleCategorize = async (itemId: number, category: string) => {
    setUpdating(true)
    try {
      await updateItemCategory(itemId, category)
      // Remove item from inbox view (it's been categorized)
      setItems(items.filter(i => i.id !== itemId))
      setTotal(total - 1)
      setActiveItem(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setUpdating(false)
    }
  }

  const limit = 10
  const totalPages = Math.ceil(total / limit)
  const canPrevious = page > 0
  const canNext = page < totalPages - 1

  return (
    <section>
      <h2>Inbox</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}
      {!loading && !items.length && <p className="muted">No items in inbox.</p>}

      <div className="items-list">
        {items.map((it) => {
          const summary = it.description && it.description.length > 150 
            ? it.description.slice(0, 150) + '...' 
            : it.description
          return (
            <article key={it.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{it.title}</h3>
                  <div className="item-meta">{new Date(it.created_at).toLocaleString()}</div>
                  {summary && <p className="muted">{summary}</p>}
                  {it.file_location && (
                    <p style={{ marginTop: 8 }}>
                      <Link to={`/items/${it.id}`}>View details.</Link>
                    </p>
                  )}
                </div>

                {/* Categorization buttons */}
                {activeItem === it.id ? (
                  <div style={{ marginLeft: 16, minWidth: 200 }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Actionable?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button
                        onClick={() => handleCategorize(it.id, 'actionable')}
                        disabled={updating}
                        className="btn"
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setActiveItem(it.id + 1000)} // Show sub-options
                        disabled={updating}
                        className="btn"
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : activeItem === it.id + 1000 ? (
                  <div style={{ marginLeft: 16, minWidth: 200 }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Category?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button
                        onClick={() => handleCategorize(it.id, 'eliminate')}
                        disabled={updating}
                        className="btn secondary"
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        Eliminate
                      </button>
                      <button
                        onClick={() => handleCategorize(it.id, 'incubate')}
                        disabled={updating}
                        className="btn secondary"
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        Incubate
                      </button>
                      <button
                        onClick={() => handleCategorize(it.id, 'file')}
                        disabled={updating}
                        className="btn secondary"
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        File
                      </button>
                      <button
                        onClick={() => setActiveItem(it.id)}
                        disabled={updating}
                        className="btn"
                        style={{ fontSize: '0.75rem', padding: '4px 8px', marginTop: 4 }}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveItem(it.id)}
                    className="btn"
                    style={{ marginLeft: 16 }}
                  >
                    Categorize
                  </button>
                )}
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
    </section>
  )
}

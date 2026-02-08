import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listItems, searchItems, updateItemCategory, updateItemFields } from '../api'
import type { Item } from '../api'

export default function Save() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'eliminate' | 'incubate' | 'file'>('all')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [restoringId, setRestoringId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [tagInputs, setTagInputs] = useState<Record<number, string>>({})

  const fetchData = () => {
    setLoading(true)
    
    if (searchQuery.trim()) {
      // Search with category filter
      if (filter === 'all') {
        Promise.all([
          searchItems(searchQuery, page, 'eliminate'),
          searchItems(searchQuery, page, 'incubate'),
          searchItems(searchQuery, page, 'file')
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
        searchItems(searchQuery, page, filter)
          .then((data) => {
            setItems(data.items)
            setTotal(data.total)
          })
          .catch((err) => setError(String(err)))
          .finally(() => setLoading(false))
      }
    } else {
      // Regular list without search
      if (filter === 'all') {
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
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, filter, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(0)
  }

  const handleAddTags = async (item: Item) => {
    const raw = (tagInputs[item.id] || '').trim()
    if (!raw) return
    const newTags = raw.split(',').map(t => t.trim()).filter(Boolean)
    if (!newTags.length) return

    const existing = item.tags || []
    const merged = Array.from(new Set([...existing, ...newTags]))
    try {
      await updateItemFields(item.id, { tags: merged })
      setItems(prev => prev.map(x => x.id === item.id ? { ...x, tags: merged } : x))
      setTagInputs(prev => ({ ...prev, [item.id]: '' }))
    } catch (err) {
      setError(String(err))
    }
  }

  const handleRemoveTag = async (item: Item, tag: string) => {
    const existing = item.tags || []
    const next = existing.filter(t => t !== tag)
    try {
      await updateItemFields(item.id, { tags: next })
      setItems(prev => prev.map(x => x.id === item.id ? { ...x, tags: next } : x))
    } catch (err) {
      setError(String(err))
    }
  }

  const handleRestore = async (itemId: number) => {
    setRestoringId(itemId)
    try {
      await updateItemCategory(itemId, 'inbox')
      fetchData()
    } catch (err) {
      setError(String(err))
    } finally {
      setRestoringId(null)
    }
  }

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

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search saved items..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '8px 12px', 
            fontSize: '0.95rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            marginBottom: '16px'
          }}
        />
      </div>

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 12, minWidth: 220 }}>
                  {it.category === 'eliminate' && (
                    <button
                      onClick={() => handleRestore(it.id)}
                      disabled={restoringId === it.id}
                      className="btn secondary"
                      style={{ 
                        fontSize: '0.85rem',
                        padding: '6px 12px',
                        opacity: restoringId === it.id ? 0.5 : 1
                      }}
                    >
                      {restoringId === it.id ? 'Restoring...' : '↺ Restore to Inbox'}
                    </button>
                  )}

                  {it.category === 'file' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(it.tags || []).map(tag => (
                          <span key={tag} style={{ background: '#eef2ff', color: '#4f46e5', padding: '4px 8px', borderRadius: 999, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(it, tag)}
                              style={{ border: 'none', background: 'transparent', color: '#4f46e5', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                              aria-label={`Remove tag ${tag}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {!(it.tags && it.tags.length) && <span className="muted" style={{ fontSize: '0.8rem' }}>No tags</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="text"
                          placeholder="Add tags (comma separated)"
                          value={tagInputs[it.id] || ''}
                          onChange={(e) => setTagInputs(prev => ({ ...prev, [it.id]: e.target.value }))}
                          style={{ flex: 1, padding: '6px 8px', fontSize: '0.9rem', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                        <button
                          className="btn secondary"
                          style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                          onClick={() => handleAddTags(it)}
                        >
                          Add
                        </button>
                      </div>
                    </div>
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

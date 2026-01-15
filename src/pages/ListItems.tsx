import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listItems, searchItems } from '../api'
import type { Item } from '../api'

export default function ListItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setLoading(true)
    listItems()
      .then((data) => setItems(data))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      // If search is cleared, reload all items
      setLoading(true)
      listItems()
        .then((data) => setItems(data))
        .catch((err) => setError(String(err)))
        .finally(() => setLoading(false))
      return
    }
    // Execute search
    setLoading(true)
    setError(null)
    searchItems(query)
      .then((data) => setItems(data))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }

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
    </section>
  )
}

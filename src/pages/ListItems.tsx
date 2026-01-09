import { useEffect, useState } from 'react'
import { listItems } from '../api'
import type { Item } from '../api'

export default function ListItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    listItems()
      .then((data) => setItems(data))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <h2>Items</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}
      {!loading && !items.length && <p className="muted">No items yet. Create one.</p>}

      <div className="items-list">
        {items.map((it) => (
          <article key={it.id} className="card">
            <h3>{it.title}</h3>
            <div className="item-meta">{new Date(it.created_at).toLocaleString()}</div>
            {it.description && <p>{it.description}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

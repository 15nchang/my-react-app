import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getItem } from '../api'

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getItem(Number(id))
      .then((data) => setItem(data))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p>Loading...</p>
  if (error) return <p style={{ color: 'salmon' }}>{error}</p>
  if (!item) return <p>No item found.</p>

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
  const fileUrl = item?.file_location
    ? (item.file_location.startsWith('http') ? item.file_location : `${apiBase}${item.file_location}`)
    : null

  return (
    <section>
      <h2>{item.title}</h2>
      <div style={{ color: '#888', marginBottom: 8 }}>{new Date(item.created_at).toLocaleString()}</div>
      {item.processing ? (
        <div className="muted">Processing: {item.status || 'processing'}</div>
      ) : (
        <div>
          {item.description ? (
            <div className="card">
              <h3>Extracted content</h3>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{item.description}</pre>
            </div>
          ) : (
            <p className="muted">No extracted content available.</p>
          )}
        </div>
      )}

      {item.file_location && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>File</h3>
          <div style={{ marginBottom: 8 }}>Stored path: {item.file_location}</div>
          {fileUrl && (
            <p style={{ marginTop: 4 }}>
              <a href={fileUrl} target="_blank" rel="noreferrer">{fileUrl}</a>
            </p>
          )}
        </div>
      )}

      <p style={{ marginTop: 16 }}>
        <Link to="/">← Back to list</Link>
      </p>
    </section>
  )
}

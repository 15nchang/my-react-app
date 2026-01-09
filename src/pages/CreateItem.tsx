import { useState } from 'react'
import { createItem } from '../api'
import { useNavigate } from 'react-router-dom'

export default function CreateItem() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title.trim()) return setError('Title is required')
    setLoading(true)
    try {
      await createItem({ title: title.trim(), description: description.trim() || null })
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Create Item</h2>
      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Create'}
            </button>
            <button type="button" className="btn secondary" onClick={() => navigate('/')}>Cancel</button>
          </div>

          {error && <div style={{ color: 'salmon' }}>{error}</div>}
        </form>
      </div>
    </section>
  )
}

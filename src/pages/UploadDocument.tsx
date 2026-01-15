import { useState } from 'react'
import { Link } from 'react-router-dom'
import { uploadFile } from '../api'

export default function UploadDocument() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<any | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!file) return setMessage('Please choose a file')
    if (!title.trim()) return setMessage('Title is required')
    setLoading(true)
    try {
      const res = await uploadFile(file, title.trim())
      setUploaded(res)
      setMessage(`Uploaded: ${res.title || res.originalname || res.filename}`)
    } catch (err: any) {
      setMessage(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Upload Document</h2>
      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" />
          </label>
          <label>
            File
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
            <button type="button" className="btn secondary" onClick={() => setFile(null)}>Reset</button>
          </div>
        </form>
        {message && <p style={{ marginTop: 8 }}>{message}</p>}
        {uploaded && (
          <p style={{ marginTop: 8 }}>
            <Link to={`/items/${uploaded.id}`}>View details.</Link>
          </p>
        )}
      </div>
    </section>
  )
}

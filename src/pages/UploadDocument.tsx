import { useState } from 'react'
import { uploadFile } from '../api'

export default function UploadDocument() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!file) return setMessage('Please choose a file')
    setLoading(true)
    try {
      const res = await uploadFile(file)
      setMessage(`Uploaded: ${res.originalname || res.filename}`)
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
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
            <button type="button" className="btn secondary" onClick={() => setFile(null)}>Reset</button>
          </div>
        </form>
        {message && <p style={{ marginTop: 8 }}>{message}</p>}
        <p className="muted" style={{ marginTop: 8 }}>This is a placeholder UI; you can flesh it out later.</p>
      </div>
    </section>
  )
}

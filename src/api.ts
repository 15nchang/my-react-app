export type Item = {
  id: number
  title: string
  description?: string | null
  file_location?: string | null
  processing?: boolean
  status?: string | null
  created_at: string
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export async function listItems(): Promise<Item[]> {
  const res = await fetch(`${API_BASE}/api/items`)
  if (!res.ok) throw new Error('Failed to fetch items')
  return res.json()
}

export async function createItem(payload: { title: string; description?: string | null }) {
  const res = await fetch(`${API_BASE}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to create item')
  }
  return res.json()
}

export async function uploadFile(file: File, title?: string) {
  const form = new FormData()
  form.append('file', file)
  if (title) form.append('title', title)
  const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Upload failed')
  }
  return res.json()
}

export async function getItem(id: number) {
  const res = await fetch(`${API_BASE}/api/items/${id}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch item')
  }
  return res.json()
}

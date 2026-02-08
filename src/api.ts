export type Item = {
  id: number
  title: string
  description?: string | null
  file_location?: string | null
  processing?: boolean
  status?: string | null
  category?: string
  tags?: string[]
  due_date?: string | null
  done?: boolean
  created_at: string
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export async function listItems(page: number = 0, category?: string, tags?: string[]): Promise<{ items: Item[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  if (category) params.set('category', category)
  if (tags && tags.length) params.set('tags', tags.join(','))

  const res = await fetch(`${API_BASE}/api/items?${params.toString()}`)
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

export async function searchItems(query: string, page: number = 0, category?: string, tags?: string[]): Promise<{ items: Item[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  params.set('page', String(page))
  if (category) params.set('category', category)
  if (tags && tags.length) params.set('tags', tags.join(','))

  const res = await fetch(`${API_BASE}/api/items/search?${params.toString()}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Search failed')
  }
  return res.json()
}

export async function updateItemCategory(id: number, category: string) {
  const res = await fetch(`${API_BASE}/api/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update category')
  }
  return res.json()
}

export async function getItemCounts(): Promise<{ inbox: number; actionable: number; eliminate: number; incubate: number; file: number }> {
  const res = await fetch(`${API_BASE}/api/items/counts`)
  if (!res.ok) throw new Error('Failed to fetch counts')
  return res.json()
}

export async function updateItemFields(
  id: number,
  payload: { category?: string; due_date?: string | null; done?: boolean; tags?: string[] }
) {
  const res = await fetch(`${API_BASE}/api/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update item')
  }
  return res.json()
}

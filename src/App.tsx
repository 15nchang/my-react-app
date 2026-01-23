import { Link, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import CreateItem from './pages/CreateItem'
import Inbox from './pages/Inbox'
import Action from './pages/Action'
import Save from './pages/Save'
import UploadDocument from './pages/UploadDocument'
import ItemDetails from './pages/ItemDetails'
import { getItemCounts } from './api'

function App() {
  const [counts, setCounts] = useState<{ inbox: number; actionable: number; eliminate: number; incubate: number; file: number } | null>(null)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await getItemCounts()
        setCounts(data)
      } catch (error) {
        console.error('Failed to fetch counts:', error)
      }
    }
    fetchCounts()
    
    // Refresh counts every 10 seconds
    const interval = setInterval(fetchCounts, 10000)
    return () => clearInterval(interval)
  }, [])

  const savedCount = counts ? counts.eliminate + counts.incubate + counts.file : 0

  return (
    <div id="root">
      <header className="app-header">
        <div className="brand">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="24" height="24" rx="6" fill="url(#g)"/>
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#6366f1" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div>
            <div className="title">My React App</div>
            <div className="muted">GTD Workflow • Uploads • Demo</div>
          </div>
        </div>

        <nav className="nav-links">
          <Link to="/">Inbox{counts !== null && ` (${counts.inbox})`}</Link>
          <Link to="/action">Actions{counts !== null && ` (${counts.actionable})`}</Link>
          <Link to="/save">Saved{counts !== null && ` (${savedCount})`}</Link>
          <Link to="/create">Create Item</Link>
          <Link to="/upload">Upload Document</Link>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Inbox />} />
          <Route path="/action" element={<Action />} />
          <Route path="/save" element={<Save />} />
          <Route path="/create" element={<CreateItem />} />
          <Route path="/upload" element={<UploadDocument />} />
          <Route path="/items/:id" element={<ItemDetails />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

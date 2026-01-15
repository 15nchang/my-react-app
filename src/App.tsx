import { Link, Routes, Route } from 'react-router-dom'
import './App.css'
import CreateItem from './pages/CreateItem'
import ListItems from './pages/ListItems'
import UploadDocument from './pages/UploadDocument'
import ItemDetails from './pages/ItemDetails'

function App() {
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
            <div className="muted">Items • Uploads • Demo</div>
          </div>
        </div>

        <nav className="nav-links">
          <Link to="/">List Items</Link>
          <Link to="/create">Create Item</Link>
          <Link to="/upload">Upload Document</Link>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<ListItems />} />
          <Route path="/create" element={<CreateItem />} />
          <Route path="/upload" element={<UploadDocument />} />
          <Route path="/items/:id" element={<ItemDetails />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { initDB, getAllItems, addItems, removeItem, updateExpiry } from './db.js'
import Header from './components/Header.jsx'
import BottomBar from './components/BottomBar.jsx'
import HomePage from './pages/HomePage.jsx'
import InputPage from './pages/InputPage.jsx'
import RecipePage from './pages/RecipePage.jsx'

export default function App() {
  const [dbReady, setDbReady] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_key') || '')
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [recipeLoading, setRecipeLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    initDB().then(() => { setDbReady(true); setItems(getAllItems()) })
  }, [])

  const refreshItems = () => setItems(getAllItems())

  const showStatus = (msg) => {
    setStatus(msg)
    setTimeout(() => setStatus(''), 4000)
  }

  const handleAddItems = (list) => {
    if (list.length === 0) { showStatus('인식된 식재료가 없습니다'); return }
    addItems(list)
    refreshItems()
    showStatus(`${list.length}개 식재료 등록 완료!`)
  }

  const handleRemove = (id) => { removeItem(id); refreshItems() }

  const sortedItems = [...items].sort((a, b) => {
    const da = getDday(a.expiry)
    const db = getDday(b.expiry)
    return da - db
  })
  const urgentItems = sortedItems.filter(i => getDday(i.expiry) <= 2)

  if (!dbReady) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-400 text-lg animate-pulse">데이터베이스 초기화 중...</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header apiKey={apiKey} setApiKey={setApiKey} items={items} />
      <nav className="bg-white border-b sticky top-[53px] z-10 max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-bold text-emerald-600">🧊 내 냉장고</span>
        <span className="text-xs text-gray-400">{sortedItems.length}개 식재료</span>
      </nav>

      <main className="max-w-2xl mx-auto p-3 sm:p-4">
        {status && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex items-center justify-between">
            {status}<button onClick={() => setStatus('')} className="text-emerald-400 hover:text-emerald-600 ml-2">✕</button>
          </div>
        )}

        <Routes>
          <Route path="/" element={
            <HomePage
              sortedItems={sortedItems} urgentItems={urgentItems}
              recipeLoading={recipeLoading}
              handleRemove={handleRemove} updateExpiry={updateExpiry}
              refreshItems={refreshItems}
              editingId={editingId} setEditingId={setEditingId}
              navigate={navigate}
            />
          } />
          <Route path="/input" element={
            <InputPage
              apiKey={apiKey}
              onItemsAdded={handleAddItems}
              showStatus={showStatus}
              loading={loading} setLoading={setLoading}
            />
          } />
          <Route path="/recipe" element={
            <RecipePage
              apiKey={apiKey}
              sortedItems={sortedItems}
              navigate={navigate}
            />
          } />
        </Routes>
      </main>

      <BottomBar navigate={navigate} />
    </div>
  )
}

function getDday(expiryStr) {
  if (!expiryStr || !expiryStr.includes('-')) return 999
  const now = new Date()
  const exp = new Date(expiryStr)
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
}
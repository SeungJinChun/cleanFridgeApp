import initSqlJs from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

let db = null

export async function initDB() {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl })
  const saved = localStorage.getItem('fridge_db')
  if (saved) {
    db = new SQL.Database(new Uint8Array(JSON.parse('[' + saved + ']')))
  } else {
    db = new SQL.Database()
  }
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    name TEXT,
    qty TEXT,
    expiry TEXT,
    created TEXT
  )`)
  return db
}

export function getDB() { return db }

export function getAllItems() {
  if (!db) return []
  const stmt = db.prepare('SELECT * FROM items ORDER BY expiry ASC')
  const items = []
  while (stmt.step()) {
    const row = stmt.getAsObject()
    items.push(row)
  }
  stmt.free()
  return items
}

export function addItem(name, qty, expiry) {
  if (!db) return
  const created = new Date().toISOString().slice(0, 10)
  db.run('INSERT INTO items VALUES (?, ?, ?, ?, ?)', [Date.now(), name, qty, expiry, created])
  saveDB()
}

export function addItems(list) {
  if (!db) return
  const created = new Date().toISOString().slice(0, 10)
  const stmt = db.prepare('INSERT INTO items VALUES (?, ?, ?, ?, ?)')
  for (const item of list) {
    stmt.run([Date.now() + Math.random()*1000|0, item.name, item.qty, item.expiry, created])
  }
  stmt.free()
  saveDB()
}

export function removeItem(id) {
  if (!db) return
  db.run('DELETE FROM items WHERE id = ?', [id])
  saveDB()
}

export function updateExpiry(id, expiry) {
  if (!db) return
  db.run('UPDATE items SET expiry = ? WHERE id = ?', [expiry, id])
  saveDB()
}

function saveDB() {
  if (!db) return
  const data = db.export()
  localStorage.setItem('fridge_db', data.buffer ? Array.from(new Uint8Array(data.buffer)) : Array.from(data))
}
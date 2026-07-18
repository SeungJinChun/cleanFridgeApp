import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import geminiRoutes from './routes/gemini.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use('/api/gemini', geminiRoutes)

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.listen(port, () => {
  console.log(`Backend running on port ${port}`)
})

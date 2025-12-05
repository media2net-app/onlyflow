import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import influencerRoutes from './routes/influencerRoutes.js'
import contentRoutes from './routes/contentRoutes.js'
import generationRoutes from './routes/generationRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import socialRoutes from './routes/socialRoutes.js'
import heygenRoutes from './routes/heygenRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'OnlyFlow API is running' })
})

// API Routes
app.use('/api/influencers', influencerRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/generation', generationRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/social', socialRoutes)
app.use('/api/heygen', heygenRoutes)

// Serve storage files
app.use('/storage', express.static('storage'))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 OnlyFlow API server running on http://localhost:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`)
})


import express from 'express'
import { 
  generateContent,
  getGenerationStatus,
  getGenerationQueue 
} from '../controllers/generationController.js'

const router = express.Router()

// POST /api/generation/content - Generate new content
router.post('/content', generateContent)

// GET /api/generation/status/:jobId - Get generation status
router.get('/status/:jobId', getGenerationStatus)

// GET /api/generation/queue - Get generation queue
router.get('/queue', getGenerationQueue)

export default router


import express from 'express'
import { 
  getAllContent, 
  getContentById, 
  getContentByInfluencer,
  createContent,
  updateContent,
  deleteContent,
  uploadTrainingImages,
  uploadMiddleware
} from '../controllers/contentController.js'

const router = express.Router()

// GET /api/content - Get all content
router.get('/', getAllContent)

// POST /api/content - Create new content
router.post('/', createContent)

// POST /api/content/upload - Upload training images
router.post('/upload', uploadMiddleware, uploadTrainingImages)

// GET /api/content/influencer/:influencerId - Get content by influencer
router.get('/influencer/:influencerId', getContentByInfluencer)

// GET /api/content/:id - Get content by ID
router.get('/:id', getContentById)

// PUT /api/content/:id - Update content
router.put('/:id', updateContent)

// DELETE /api/content/:id - Delete content
router.delete('/:id', deleteContent)

export default router


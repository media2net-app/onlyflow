import express from 'express'
import {
  createVideo,
  getVideoStatus,
  listAvatars,
  listVoices
} from '../controllers/heygenController.js'

const router = express.Router()

// Create avatar video
router.post('/video/create', createVideo)

// Get video status
router.get('/video/:videoId/status', getVideoStatus)

// List available avatars
router.get('/avatars', listAvatars)

// List available voices
router.get('/voices', listVoices)

export default router


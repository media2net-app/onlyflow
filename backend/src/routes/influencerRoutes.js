import express from 'express'
import { 
  getAllInfluencers, 
  getInfluencerById, 
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
  setProfileFromContent
} from '../controllers/influencerController.js'

const router = express.Router()

// GET /api/influencers - Get all influencers
router.get('/', getAllInfluencers)

// GET /api/influencers/:id - Get influencer by ID
router.get('/:id', getInfluencerById)

// POST /api/influencers - Create new influencer
router.post('/', createInfluencer)

// PUT /api/influencers/:id - Update influencer
router.put('/:id', updateInfluencer)

// POST /api/influencers/:id/set-profile-from-content - Set profile image from content
router.post('/:id/set-profile-from-content', setProfileFromContent)

// DELETE /api/influencers/:id - Delete influencer
router.delete('/:id', deleteInfluencer)

export default router


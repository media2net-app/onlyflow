import express from 'express'
import { generateProfileImage, generateTrainingImages, getReplicateCredits } from '../services/aiService.js'
import { getCredits, addCredits } from '../services/creditsService.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Ensure storage directory exists
const storageDir = path.join(__dirname, '../../storage')
fs.mkdir(storageDir, { recursive: true }).catch(console.error)

// GET /api/ai/credits - Get current credits balance
router.get('/credits', async (req, res) => {
  try {
    const creditsInfo = await getCredits()
    res.json({
      success: true,
      data: {
        credits: creditsInfo.balance,
        currency: creditsInfo.currency,
        totalSpent: creditsInfo.totalSpent,
        totalGenerated: creditsInfo.totalGenerated,
        available: creditsInfo.available
      }
    })
  } catch (error) {
    console.error('Error fetching credits:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch credits'
    })
  }
})

// POST /api/ai/credits/add - Add credits manually
router.post('/credits/add', async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      })
    }
    
    const result = await addCredits(amount)
    if (result.success) {
      res.json({
        success: true,
        data: {
          balance: result.newBalance,
          currency: result.currency
        }
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to add credits'
      })
    }
  } catch (error) {
    console.error('Error adding credits:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add credits'
    })
  }
})

// GET /api/ai/download-image - Download and save an image from a Replicate URL (for testing)
router.get('/download-image', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) {
      return res.status(400).json({ success: false, error: 'url parameter is required' })
    }

    console.log('📥 Downloading image from Replicate:', url)
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const imageBuffer = Buffer.from(response.data)

    // Determine file extension from URL or content type
    const extension = url.includes('.jpg') || url.includes('.jpeg') ? 'jpg' : 'png'
    const filename = `downloaded_${Date.now()}.${extension}`
    const filepath = path.join(storageDir, filename)
    await fs.writeFile(filepath, imageBuffer)

    console.log(`✅ Image downloaded and saved: ${filename} (${(imageBuffer.length / 1024).toFixed(2)} KB)`)

    res.json({
      success: true,
      message: 'Image downloaded and saved successfully',
      url: `/storage/${filename}`,
      filename: filename,
      size: imageBuffer.length,
      sizeKB: (imageBuffer.length / 1024).toFixed(2)
    })
  } catch (error) {
    console.error('❌ Error downloading image:', error.message)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to download image'
    })
  }
})

// POST /api/ai/generate-profile - Generate profile image for influencer
router.post('/generate-profile', async (req, res) => {
  try {
    const { influencerData } = req.body

    if (!influencerData) {
      return res.status(400).json({
        success: false,
        error: 'influencerData is required'
      })
    }

    console.log('Generating profile image for:', influencerData.name)
    const imageBuffer = await generateProfileImage(influencerData)

    // Save image
    const filename = `profile_${Date.now()}.png`
    const filepath = path.join(storageDir, filename)
    await fs.writeFile(filepath, imageBuffer)

    res.json({
      success: true,
      data: {
        url: `/storage/${filename}`,
        filename: filename
      }
    })
  } catch (error) {
    console.error('Error generating profile image:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate profile image'
    })
  }
})

// POST /api/ai/generate-training-images - Generate training images for influencer
router.post('/generate-training-images', async (req, res) => {
  try {
    const { influencerData, count = 25 } = req.body

    if (!influencerData) {
      return res.status(400).json({
        success: false,
        error: 'influencerData is required'
      })
    }

    // Log the exact count being used
    const imageCount = parseInt(count) || 25
    const styleInfo = influencerData.style ? ` (style: ${influencerData.style})` : ''
    console.log(`\n🎨 Generating ${imageCount} image(s) for: ${influencerData.name}${styleInfo}`)
    console.log(`   Count parameter received: ${count}, parsed as: ${imageCount}`)
    
    // Get profile image URL if available (for character reference consistency)
    let profileImageUrl = null
    if (influencerData.id) {
      try {
        const { default: influencerController } = await import('../controllers/influencerController.js')
        const influencer = await influencerController.getInfluencerById(influencerData.id)
        if (influencer && influencer.imageUrl) {
          // Convert local URL to full URL for Replicate
          profileImageUrl = influencer.imageUrl.startsWith('http') 
            ? influencer.imageUrl 
            : `http://localhost:3001${influencer.imageUrl}`
          console.log('✅ Found profile image, will use for character reference:', profileImageUrl)
        }
      } catch (err) {
        console.log('⚠️  Could not fetch profile image for character reference:', err.message)
      }
    }
    
    // Generate images (this will take a while)
    res.status(202).json({
      success: true,
      message: 'Training image generation started',
      jobId: `training_${Date.now()}`
    })

      // Generate in background with character reference for consistency
      // Use parsed count to ensure it's a number (imageCount already declared above)
      console.log(`   ✅ Starting generation with count: ${imageCount}`)
      generateTrainingImages(influencerData, imageCount, profileImageUrl)
        .then(async (result) => {
          const savedImages = []
          // Get images and prompts from the result
          const images = result.images || result || []
          const prompts = result.prompts || []
          
          for (let i = 0; i < images.length; i++) {
            // Generate unique filename with timestamp and style name if it's a style image
            const timestamp = Date.now()
            const random = Math.floor(Math.random() * 10000)
            let filename
            if (influencerData.style) {
              // For style images: include style name and timestamp for uniqueness
              const styleSlug = influencerData.style.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
              filename = `style_${influencerData.id || 'new'}_${styleSlug}_${timestamp}_${random}.png`
            } else {
              // For training images: use original format
              filename = `training_${influencerData.id || 'new'}_${timestamp}_${random}_${i + 1}.png`
            }
            const filepath = path.join(storageDir, filename)
            await fs.writeFile(filepath, images[i])
            savedImages.push({
              url: `/storage/${filename}`,
              filename: filename
            })
            
            // Add to content (if influencerId is provided)
            if (influencerData.id) {
              try {
                // Add content via internal API call
                const axios = (await import('axios')).default
                const contentType = influencerData.style ? 'style_image' : 'training_image'
                const contentData = {
                  influencerId: influencerData.id,
                  type: contentType,
                  url: `/storage/${filename}`,
                  status: 'completed'
                }
                
                // Add style property if it's a style_image
                if (influencerData.style) {
                  contentData.style = influencerData.style
                }
                
                // Add prompt if available (for training images)
                if (prompts[i]) {
                  contentData.prompt = prompts[i]
                } else if (!influencerData.style) {
                  // Fallback: create a basic description if prompt not available
                  contentData.prompt = `Training image ${i + 1} for ${influencerData.name || 'influencer'}`
                }
                
                await axios.post('http://localhost:3001/api/content', contentData)
                console.log(`✅ ${contentType} ${i + 1}/${images.length} saved and added to content${influencerData.style ? ` (style: ${influencerData.style})` : ''}`)
              } catch (err) {
                console.error('Error adding content:', err.message)
              }
            }
          }
          console.log(`✅ Generated ${savedImages.length} training images`)
        })
        .catch(error => {
          console.error('Error in background generation:', error)
        })
  } catch (error) {
    console.error('Error starting training image generation:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start training image generation'
    })
  }
})

export default router


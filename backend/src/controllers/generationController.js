import { generateContentImage } from '../services/aiService.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const storageDir = path.join(__dirname, '../../storage')

// Ensure storage directory exists
fs.mkdir(storageDir, { recursive: true }).catch(console.error)

// Mock generation queue - Later vervangen door database/queue system
let generationQueue = []
let jobCounter = 1

export const generateContent = async (req, res) => {
  const { 
    influencerId, 
    type, 
    activity, 
    outfit, 
    location,
    aspectRatio,
    numberOfPosts,
    quality
  } = req.body
  
  if (!influencerId || !type) {
    return res.status(400).json({
      success: false,
      error: 'influencerId and type are required'
    })
  }

  if (!activity || !outfit || !location) {
    return res.status(400).json({
      success: false,
      error: 'activity, outfit, and location are required'
    })
  }

    // Get influencer data via internal API call
    try {
      const axios = (await import('axios')).default
      const response = await axios.get(`http://localhost:3001/api/influencers/${influencerId}`)
      
      if (!response.data || !response.data.success || !response.data.data) {
        return res.status(404).json({
          success: false,
          error: 'Influencer not found'
        })
      }
      
      const influencer = response.data.data

      // Log influencer data to verify imageUrl is present
      console.log(`\n📋 ===== GENERATING CONTENT FOR INFLUENCER =====`)
      console.log(`   Name: ${influencer.name}`)
      console.log(`   ID: ${influencer.id}`)
      console.log(`   Profile image URL: ${influencer.imageUrl || 'NOT SET - face consistency will be poor!'}`)
      console.log(`   Gender: ${influencer.gender || 'N/A'}`)
      console.log(`   Age: ${influencer.age || 'N/A'}`)
      console.log(`   Hair Color: ${influencer.hairColor || 'N/A'}`)
      console.log(`   Location: ${influencer.location || 'N/A'}`)
      console.log(`   Full influencer object:`, JSON.stringify(influencer, null, 2))
      console.log(`===============================================\n`)

    const count = numberOfPosts || 1
    const postType = type || 'feed'
    const aspect = aspectRatio || '1:1'

    // Respond immediately
    res.status(202).json({
      success: true,
      message: `Generating ${count} ${postType} post${count > 1 ? 's' : ''}...`,
      jobId: `content_${Date.now()}`
    })

    // Generate images in background
    generateContentImages(influencer, activity, outfit, location, aspect, postType, count)
      .then(async (images) => {
        console.log(`✅ Generated ${images.length} content images for ${influencer.name}`)
      })
      .catch(error => {
        console.error('Error generating content images:', error)
      })

  } catch (error) {
    console.error('Error in generateContent:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start content generation'
    })
  }
}

/**
 * Generate multiple content images
 */
async function generateContentImages(influencer, activity, outfit, location, aspectRatio, postType, count) {
  const images = []
  const savedContent = []

  for (let i = 0; i < count; i++) {
    try {
      console.log(`Generating content image ${i + 1}/${count} for ${influencer.name}...`)
      
      // Generate image
      const imageBuffer = await generateContentImage(
        influencer,
        activity,
        outfit,
        location,
        aspectRatio,
        postType
      )

      // Save image
      const filename = `content_${influencer.id}_${Date.now()}_${i + 1}.png`
      const filepath = path.join(storageDir, filename)
      await fs.writeFile(filepath, imageBuffer)

      const imageUrl = `/storage/${filename}`
      images.push(imageUrl)

      // Add to content database
      try {
        const axios = (await import('axios')).default
        await axios.post('http://localhost:3001/api/content', {
          influencerId: influencer.id,
          type: postType === 'feed' ? 'feed_post' : postType,
          url: imageUrl,
          status: 'completed',
          prompt: `${activity}, wearing ${outfit}, at ${location}`,
          aspectRatio: aspectRatio,
          quality: 'standard'
        })
        console.log(`✅ Content image ${i + 1}/${count} saved and added to content`)
      } catch (err) {
        console.error('Error adding content to database:', err.message)
      }

      // Add delay between generations
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
      }
    } catch (error) {
      console.error(`Error generating content image ${i + 1}:`, error.message)
      // Continue with next image
    }
  }

  return images
}

export const getGenerationStatus = (req, res) => {
  const { jobId } = req.params
  const job = generationQueue.find(j => j.id === parseInt(jobId))
  
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Generation job not found'
    })
  }
  
  res.json({
    success: true,
    data: job
  })
}

export const getGenerationQueue = (req, res) => {
  res.json({
    success: true,
    data: generationQueue,
    count: generationQueue.length
  })
}


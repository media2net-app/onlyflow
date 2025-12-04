import axios from 'axios'
import dotenv from 'dotenv'
import Replicate from 'replicate'
import { deductCredits } from './creditsService.js'

dotenv.config()

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || ''
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models'

// Initialize Replicate if token is available
const replicate = REPLICATE_API_TOKEN ? new Replicate({ auth: REPLICATE_API_TOKEN }) : null

/**
 * Get Replicate account balance/credits
 * Note: Replicate doesn't have a direct API for this yet
 * We'll try multiple endpoints and provide a fallback
 * @returns {Promise<{credits: number|null, currency: string, error?: string, available: boolean}>}
 */
export async function getReplicateCredits() {
  if (!replicate || !REPLICATE_API_TOKEN) {
    return { 
      credits: null, 
      currency: 'USD', 
      error: 'Replicate API token not configured',
      available: false
    }
  }

  // Try multiple possible endpoints
  const endpoints = [
    'https://api.replicate.com/v1/account',
    'https://api.replicate.com/v1/billing',
    'https://api.replicate.com/v1/account/balance',
    'https://api.replicate.com/v1/user',
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      })

      // Check various possible response formats
      const data = response.data
      
      // Try different field names that might contain balance
      if (data.balance !== undefined) {
        return {
          credits: parseFloat(data.balance) || 0,
          currency: data.currency || 'USD',
          available: true
        }
      }
      
      if (data.credits !== undefined) {
        return {
          credits: parseFloat(data.credits) || 0,
          currency: data.currency || 'USD',
          available: true
        }
      }
      
      if (data.account && data.account.balance !== undefined) {
        return {
          credits: parseFloat(data.account.balance) || 0,
          currency: data.account.currency || 'USD',
          available: true
        }
      }
    } catch (error) {
      // Continue to next endpoint if this one fails
      if (error.response && error.response.status === 404) {
        continue // Try next endpoint
      }
      // For other errors, log but continue
      if (error.response && error.response.status !== 401 && error.response.status !== 403) {
        console.log(`Endpoint ${endpoint} not available:`, error.message)
      }
    }
  }

  // If all endpoints failed, return null with info
  // The frontend will use a fallback value
  return { 
    credits: null, 
    currency: 'USD', 
    error: 'Replicate API does not currently expose balance/credits endpoint. Please check your balance manually at replicate.com/account',
    available: false
  }
}

/**
 * Generate an image using Stable Diffusion via Hugging Face Inference API
 * @param {string} prompt - The text prompt for image generation
 * @param {object} options - Additional options (negative_prompt, num_inference_steps, etc.)
 * @returns {Promise<Buffer>} - Generated image as buffer
 */
// Generate a simple placeholder image (1x1 PNG)
function generatePlaceholderImage(color = [100, 100, 200]) {
  // Create a simple 512x512 colored PNG
  const width = 512
  const height = 512
  const buffer = Buffer.alloc(width * height * 3)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3
      buffer[idx] = color[0]     // R
      buffer[idx + 1] = color[1]  // G
      buffer[idx + 2] = color[2] // B
    }
  }
  
  // For now, return a minimal valid PNG (simplified)
  // In production, use a proper PNG library like 'sharp' or 'canvas'
  // For demo, we'll create a simple gradient placeholder
  return createSimplePNG(width, height, color)
}

function createSimplePNG(width, height, color) {
  // Create a minimal valid PNG with gradient
  // This is a simplified version - in production use a proper library
  const fs = require('fs')
  const path = require('path')
  
  // For now, we'll use a workaround: create via canvas or return a data URL
  // Since we can't easily create PNGs without a library, let's use a different approach
  // We'll download a placeholder from a free service or create one programmatically
  
  // For demo purposes, return a buffer that represents a colored square
  // In production, install 'sharp' or 'canvas' for proper image generation
  return Buffer.from('PLACEHOLDER_IMAGE_DATA')
}

export async function generateImage(prompt, options = {}) {
  // Check if we're in mock/demo mode (only if explicitly set or no Replicate token)
  const MOCK_MODE = process.env.MOCK_AI_MODE === 'true' || (!replicate && !REPLICATE_API_TOKEN)
  
  if (MOCK_MODE || options._forceMock) {
    console.log('🎨 Mock mode: Generating placeholder image for prompt:', prompt)
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Download a placeholder image from a free service
    try {
      // Use picsum.photos for random placeholder images (looks more realistic)
      const seed = Math.floor(Math.random() * 1000)
      const placeholderUrl = `https://picsum.photos/seed/${seed}/512/512`
      const imageResponse = await axios.get(placeholderUrl, { 
        responseType: 'arraybuffer',
        timeout: 10000
      })
      console.log('✅ Downloaded placeholder image from picsum.photos')
      return Buffer.from(imageResponse.data)
    } catch (error) {
      console.log('⚠️  Could not download placeholder, using via.placeholder.com')
      try {
        // Fallback to via.placeholder.com
        const placeholderUrl = `https://via.placeholder.com/512/6366f1/ffffff.png?text=AI+Generated`
        const imageResponse = await axios.get(placeholderUrl, { responseType: 'arraybuffer' })
        return Buffer.from(imageResponse.data)
      } catch (error2) {
        console.error('Error downloading placeholder:', error2.message)
        // Last resort: return minimal PNG
        throw new Error('Could not generate placeholder image. Check internet connection.')
      }
    }
  }
  
  // Prefer Replicate if available (now with credits!)
  if (replicate) {
    try {
      // Use Minimax image-01 - better for character consistency and cheaper!
      const model = options.model || 'minimax/image-01'
      
      console.log('🤖 Using Replicate API (Minimax image-01) to generate image...')
      
      // Minimax image-01 uses different parameters
      // Supports character reference for consistency!
      const inputParams = model.includes('minimax') ? {
        prompt: prompt,
        aspect_ratio: options.aspect_ratio || '1:1',
        number_of_images: options.number_of_images || 1,
        // Character reference image for consistency (if provided)
        // This is CRITICAL for face consistency - always include if available
        ...(options.character_image ? { 
          character_image: options.character_image
        } : {}),
        ...options.parameters
      } : {
        prompt: prompt,
        negative_prompt: options.negative_prompt || 'blurry, low quality, distorted, ugly, bad anatomy',
        num_inference_steps: options.steps || 30,
        guidance_scale: options.guidance_scale || 7.5,
        ...options.parameters
      }
      
      // Log input parameters for debugging (especially character_image)
      console.log(`\n📤 Sending to Replicate API:`)
      console.log(`   Model: ${model}`)
      console.log(`   Prompt: ${prompt}`)
      if (inputParams.character_image) {
        console.log(`   ✅ Character Image: ${inputParams.character_image}`)
        console.log(`   ✅ Character reference WILL be used for face consistency`)
      } else {
        console.warn(`   ⚠️  NO character_image parameter - face may NOT be consistent!`)
      }
      console.log(`   Aspect Ratio: ${inputParams.aspect_ratio}`)
      console.log(`   Number of Images: ${inputParams.number_of_images}`)
      
      const output = await replicate.run(
        model,
        {
          input: inputParams
        }
      )
      
      // Replicate returns a URL, download the image
      if (typeof output === 'string') {
        const imageResponse = await axios.get(output, { responseType: 'arraybuffer' })
        return Buffer.from(imageResponse.data)
      } else if (Array.isArray(output) && output[0]) {
        const imageResponse = await axios.get(output[0], { responseType: 'arraybuffer' })
        return Buffer.from(imageResponse.data)
      }
      
      throw new Error('Unexpected output format from Replicate')
    } catch (error) {
      if (error.message.includes('402') || error.message.includes('credit') || error.message.includes('Insufficient credit')) {
        console.log('⚠️  Replicate requires credits. Switching to mock mode...')
        // Fall back to mock mode
        return await generateImage(prompt, { ...options, _forceMock: true })
      }
      console.error('Replicate error:', error.message)
      console.error('Full error:', error)
      // Try a different model or fall back to mock
      if (error.message.includes('404') || error.message.includes('not found')) {
        console.log('⚠️  Model not found, trying alternative model...')
        // Try alternative model
        try {
          const altModel = 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf'
          const output = await replicate.run(altModel, {
            input: {
              prompt: prompt,
              negative_prompt: options.negative_prompt || 'blurry, low quality, distorted, ugly, bad anatomy',
              num_inference_steps: options.steps || 30,
              guidance_scale: options.guidance_scale || 7.5,
              ...options.parameters
            }
          })
          if (typeof output === 'string') {
            const imageResponse = await axios.get(output, { responseType: 'arraybuffer' })
            return Buffer.from(imageResponse.data)
          } else if (Array.isArray(output) && output[0]) {
            const imageResponse = await axios.get(output[0], { responseType: 'arraybuffer' })
            return Buffer.from(imageResponse.data)
          }
        } catch (altError) {
          console.error('Alternative model also failed:', altError.message)
          throw new Error(`Replicate generation failed: ${error.message}`)
        }
      } else {
        throw new Error(`Replicate generation failed: ${error.message}`)
      }
    }
  }
  
  // Fallback: Try Hugging Face (may be deprecated)
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('No AI service configured. Please set REPLICATE_API_TOKEN or HUGGINGFACE_API_KEY in .env file. See ALTERNATIVE_AI.md for setup.')
  }
  
  throw new Error('Hugging Face old API is deprecated. Please set REPLICATE_API_TOKEN in .env file. See ALTERNATIVE_AI.md for setup instructions.')

  // Try different models - some work better than others
  const model = options.model || 'runwayml/stable-diffusion-v1-5'
  
  // Standard Inference API payload
  const payload = {
    inputs: prompt,
    parameters: {
      negative_prompt: options.negative_prompt || 'blurry, low quality, distorted, ugly, bad anatomy',
      num_inference_steps: options.steps || 30,
      guidance_scale: options.guidance_scale || 7.5,
      ...options.parameters
    }
  }

  try {
    const response = await axios.post(
      `${HUGGINGFACE_API_URL}/${model}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 120000 // 120 seconds timeout
      }
    )

    // Check if response is an image (PNG/JPEG) or error JSON
    const contentType = response.headers['content-type'] || ''
    if (contentType.includes('application/json')) {
      const errorData = JSON.parse(Buffer.from(response.data).toString())
      const errorMsg = errorData.error || JSON.stringify(errorData)
      
      // If API says to use router, try that
      if (errorMsg.includes('router.huggingface.co')) {
        console.log('⚠️  Old API deprecated, trying alternative approach...')
        // For now, return a helpful error message
        throw new Error('Hugging Face API structure changed. Please use a different image generation service or wait for API update.')
      }
      
      throw new Error(`API Error: ${errorMsg}`)
    }

    return Buffer.from(response.data)
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data
      let errorMsg = 'Unknown error'
      
      if (errorData instanceof Buffer) {
        try {
          const parsed = JSON.parse(errorData.toString())
          errorMsg = parsed.error || JSON.stringify(parsed)
        } catch {
          errorMsg = errorData.toString().substring(0, 200)
        }
      } else {
        errorMsg = JSON.stringify(errorData)
      }
      
      console.error('Hugging Face API Error:', error.response.status, errorMsg)
      
      // Handle model loading
      if (error.response.status === 503) {
        throw new Error('Model is loading, please wait 30-60 seconds and try again')
      }
      
      // Handle deprecated API
      if (error.response.status === 410 || errorMsg.includes('router.huggingface.co')) {
        throw new Error('Hugging Face API has changed. The old inference API is deprecated. We need to update to use the new router API or an alternative service.')
      }
      
      throw new Error(`AI Generation failed: ${error.response.status} - ${errorMsg}`)
    }
    throw error
  }
}

/**
 * Generate multiple training images for an influencer
 * @param {object} influencerData - Influencer profile data
 * @param {number} count - Number of images to generate (default: 20-30)
 * @param {string} profileImageUrl - Optional profile image URL for character reference (consistency)
 * @returns {Promise<Array<Buffer>>} - Array of generated images
 */
export async function generateTrainingImages(influencerData, count = 25, profileImageUrl = null) {
  // Ensure count is a number and log it
  const imageCount = parseInt(count) || 25
  console.log(`\n🖼️  generateTrainingImages called with count: ${imageCount} (received: ${count})`)
  
  const {
    name,
    description,
    gender,
    age,
    location,
    hairColor,
    activities,
    settings,
    clothingStyles,
    style // Specific style for style-based generation
  } = influencerData

  // Build detailed prompt
  let prompt = `portrait photo of ${gender.toLowerCase()}, ${age} years old`
  
  if (hairColor) {
    prompt += `, ${hairColor} hair`
  }
  
  if (location) {
    prompt += `, in ${location}`
  }
  
  // Use specific style if provided, otherwise use first from clothingStyles array
  if (style) {
    // Format style name: "GLAM/ELEGANT" -> "glam elegant", "SPORTY" -> "sporty"
    const formattedStyle = style.toLowerCase().replace(/\//g, ' ').replace(/_/g, ' ')
    prompt += `, wearing ${formattedStyle} style clothing`
    console.log(`🎨 Using style in prompt: "${formattedStyle}" (from: "${style}")`)
  } else if (clothingStyles && clothingStyles.length > 0) {
    const formattedStyle = clothingStyles[0].toLowerCase().replace(/\//g, ' ').replace(/_/g, ' ')
    prompt += `, wearing ${formattedStyle} style clothing`
  }
  
  if (settings && settings.length > 0) {
    prompt += `, ${settings[0].toLowerCase()}`
  }
  
  if (activities && activities.length > 0) {
    prompt += `, ${activities[0].toLowerCase()}`
  }
  
  prompt += `, professional photography, high quality, detailed, 8k, realistic, natural lighting`

  // Log the full prompt for debugging
  console.log(`\n📝 Full prompt for ${count} image(s): "${prompt}"`)
  if (style) {
    console.log(`   ✅ Style-specific generation: "${style}"`)
  }

  const negativePrompt = 'cartoon, anime, painting, drawing, illustration, fake, artificial, low quality, blurry, distorted, ugly, bad anatomy, extra limbs'

  // If we have a profile image, use it as character reference for consistency
  let characterImage = null
  if (profileImageUrl) {
    try {
      // Convert profile image URL to a format Replicate can use
      // If it's a local file, we need to upload it or convert to base64
      // For now, we'll pass the URL if it's accessible
      if (profileImageUrl.startsWith('http')) {
        characterImage = profileImageUrl
        console.log('✅ Using profile image as character reference for consistency')
      } else if (profileImageUrl.startsWith('/storage/')) {
        // Local file - convert to full URL for Replicate
        characterImage = `http://localhost:3001${profileImageUrl}`
        console.log('✅ Using local profile image as character reference')
      }
    } catch (err) {
      console.log('⚠️  Could not use profile image as character reference:', err.message)
    }
  }

  const images = []
  const variations = [
    'close-up portrait',
    'full body shot',
    'medium shot',
    'side profile',
    'looking at camera',
    'smiling',
    'casual pose',
    'professional pose',
    'outdoor setting',
    'indoor setting'
  ]

  // Check if we're in mock mode
  const MOCK_MODE = process.env.MOCK_AI_MODE === 'true' || (!replicate && !REPLICATE_API_TOKEN)

  // Generate images with variations - use parsed count
  console.log(`   🔄 Starting loop to generate ${imageCount} image(s)`)
  for (let i = 0; i < imageCount; i++) {
    const variation = variations[i % variations.length]
    const imagePrompt = `${prompt}, ${variation}`
    
      try {
        console.log(`Generating image ${i + 1}/${count}${characterImage ? ' (with character reference)' : ''}...`)
        const image = await generateImage(imagePrompt, {
          model: 'minimax/image-01',
          aspect_ratio: '1:1',
          number_of_images: 1,
          ...(characterImage ? { character_image: characterImage } : {})
        })
        images.push(image)
        
        // Deduct credits for this image (only if not in mock mode)
        if (!MOCK_MODE) {
          try {
            await deductCredits(1)
          } catch (creditError) {
            console.warn('Failed to deduct credits:', creditError.message)
          }
        }
        
        // Add delay to avoid rate limiting
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
        }
    } catch (error) {
      console.error(`Error generating image ${i + 1}:`, error.message)
      // Continue with next image even if one fails
    }
  }

  return images
}

/**
 * Generate a single influencer profile image
 * @param {object} influencerData - Influencer profile data
 * @returns {Promise<Buffer>} - Generated profile image
 */
export async function generateProfileImage(influencerData) {
  const {
    name,
    gender,
    age,
    hairColor,
    location
  } = influencerData

  const prompt = `professional headshot portrait of ${gender.toLowerCase()}, ${age} years old${hairColor ? `, ${hairColor} hair` : ''}${location ? `, in ${location}` : ''}, high quality photography, studio lighting, professional, 8k, realistic, detailed`

  const image = await generateImage(prompt, {
    model: 'minimax/image-01',
    aspect_ratio: '1:1',
    number_of_images: 1
  })
  
  // Deduct credits for profile image (only if not in mock mode)
  const MOCK_MODE = process.env.MOCK_AI_MODE === 'true' || (!replicate && !REPLICATE_API_TOKEN)
  if (!MOCK_MODE) {
    try {
      await deductCredits(1)
    } catch (creditError) {
      console.warn('Failed to deduct credits for profile image:', creditError.message)
    }
  }
  
  return image
}

/**
 * Generate content image based on brief (activity, outfit, location)
 * @param {object} influencerData - Influencer profile data
 * @param {string} activity - Activity description
 * @param {string} outfit - Outfit description
 * @param {string} location - Location description
 * @param {string} aspectRatio - Aspect ratio (1:1, 2:3, 16:9)
 * @param {string} postType - Post type (feed, story, reel)
 * @returns {Promise<Buffer>} - Generated content image
 */
export async function generateContentImage(influencerData, activity, outfit, location, aspectRatio = '1:1', postType = 'feed') {
  const {
    name,
    gender,
    age,
    hairColor
  } = influencerData

  // Build prompt from brief - IMPORTANT: Keep prompt simple when using character reference
  // The character reference image will handle the face consistency
  let prompt = `${activity}, wearing ${outfit}, at ${location}`
  
  // Add influencer characteristics (but keep it minimal - character reference handles the face)
  if (gender) {
    prompt = `${gender.toLowerCase()}, ${prompt}`
  }
  
  if (hairColor) {
    prompt += `, ${hairColor} hair`
  }
  
  // Add post type specific styling
  if (postType === 'story') {
    prompt += ', vertical format, story style, engaging composition'
  } else if (postType === 'reel') {
    prompt += ', dynamic composition, reel style, engaging'
  } else if (postType === 'feed') {
    prompt += ', feed post style, high quality photography'
  }
  
  prompt += ', professional photography, high quality, detailed, 8k, realistic, natural lighting, same person, consistent face'

  // Convert aspect ratio to format Replicate expects
  let replicateAspectRatio = '1:1'
  if (aspectRatio === '2:3') {
    replicateAspectRatio = '2:3'
  } else if (aspectRatio === '16:9') {
    replicateAspectRatio = '16:9'
  }

  // Log ALL influencer data for debugging
  console.log(`\n🔍 DEBUG: Full influencer data being used for content generation:`)
  console.log(`   Name: ${name}`)
  console.log(`   ID: ${influencerData.id}`)
  console.log(`   Gender: ${gender || 'N/A'}`)
  console.log(`   Age: ${age || 'N/A'}`)
  console.log(`   Hair Color: ${hairColor || 'N/A'}`)
  console.log(`   ImageUrl: ${influencerData.imageUrl || 'NOT SET'}`)
  console.log(`   Full influencerData:`, JSON.stringify(influencerData, null, 2))

  // Get profile image for character reference - THIS IS CRITICAL FOR CONSISTENCY
  let characterImage = null
  if (influencerData.imageUrl) {
    try {
      // Convert local path to full URL for Replicate
      if (influencerData.imageUrl.startsWith('http')) {
        characterImage = influencerData.imageUrl
      } else if (influencerData.imageUrl.startsWith('/storage/')) {
        // Local file - convert to full URL that Replicate can access
        characterImage = `http://localhost:3001${influencerData.imageUrl}`
      } else {
        // Assume it's a relative path
        characterImage = `http://localhost:3001/storage/${influencerData.imageUrl}`
      }
      
      console.log(`✅ Using influencer profile image for character reference: ${characterImage}`)
      console.log(`   Influencer: ${name} (ID: ${influencerData.id})`)
      console.log(`   Original imageUrl: ${influencerData.imageUrl}`)
      
      // Verify the image URL is accessible
      try {
        const axios = (await import('axios')).default
        const testResponse = await axios.head(characterImage, { timeout: 5000 })
        console.log(`✅ Character image URL is accessible (status: ${testResponse.status})`)
      } catch (testErr) {
        console.error(`⚠️  WARNING: Character image URL may not be accessible: ${testErr.message}`)
        console.error(`   URL tested: ${characterImage}`)
      }
    } catch (err) {
      console.error(`❌ Could not use profile image as character reference:`, err.message)
      console.error(`   Error details:`, err)
    }
  } else {
    console.error(`❌ CRITICAL: No profile image (imageUrl) found for influencer ${name} (ID: ${influencerData.id})!`)
    console.error(`   Face consistency will be POOR - different faces may be generated!`)
    console.error(`   Influencer data keys:`, Object.keys(influencerData))
    console.error(`   Please generate a profile image first before creating content.`)
  }

  // CRITICAL: Always use character_image if available for face consistency
  const imageOptions = {
    model: 'minimax/image-01',
    aspect_ratio: replicateAspectRatio,
    number_of_images: 1
  }

  if (characterImage) {
    imageOptions.character_image = characterImage
    console.log(`🎯 Generating with character reference for consistent face: ${characterImage}`)
  } else {
    console.warn(`⚠️  WARNING: Generating WITHOUT character reference - face may not match influencer profile!`)
  }

  const image = await generateImage(prompt, imageOptions)
  
  // Deduct credits (only if not in mock mode)
  const MOCK_MODE = process.env.MOCK_AI_MODE === 'true' || (!replicate && !REPLICATE_API_TOKEN)
  if (!MOCK_MODE) {
    try {
      await deductCredits(1)
    } catch (creditError) {
      console.warn('Failed to deduct credits for content image:', creditError.message)
    }
  }
  
  return image
}

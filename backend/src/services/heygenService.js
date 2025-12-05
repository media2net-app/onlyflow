import axios from 'axios'

const HEYGEN_API_BASE = 'https://api.heygen.com/v2'
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_kmss9j3ZXQu_JEKOCMbcWncWosgP6clVUbHlOcgWZ0h5'

/**
 * Create an avatar video using HeyGen API
 * @param {object} options - Video generation options
 * @param {string} options.avatarId - HeyGen avatar ID
 * @param {string} options.voiceId - HeyGen voice ID
 * @param {string} options.text - Text script for the video
 * @param {string} options.audioUrl - Optional audio URL (alternative to text)
 * @param {string} options.dimension - Video dimension (e.g., '1920x1080', '1080x1920', '1080x1080')
 * @param {boolean} options.caption - Enable captions
 * @param {string} options.background - Background type ('none', 'color', 'image', 'video')
 * @param {string} options.backgroundColor - Background color (hex code)
 * @param {string} options.backgroundImageUrl - Background image URL
 * @param {string} options.backgroundVideoUrl - Background video URL
 * @returns {Promise<object>} - Video generation response
 */
export async function createAvatarVideo(options = {}) {
  try {
    const {
      avatarId,
      voiceId,
      text,
      audioUrl,
      dimension = '1080x1080',
      caption = false,
      background = 'none',
      backgroundColor,
      backgroundImageUrl,
      backgroundVideoUrl
    } = options

    if (!avatarId || !voiceId) {
      throw new Error('Avatar ID and Voice ID are required')
    }

    if (!text && !audioUrl) {
      throw new Error('Either text or audioUrl is required')
    }

    // Build video configuration
    const videoConfig = {
      avatar_id: avatarId,
      voice: {
        voice_id: voiceId
      },
      dimension: dimension,
      caption: caption
    }

    // Add text or audio
    if (text) {
      videoConfig.text = text
    } else if (audioUrl) {
      videoConfig.audio_url = audioUrl
    }

    // Configure background
    if (background === 'color' && backgroundColor) {
      videoConfig.background = {
        type: 'color',
        value: backgroundColor
      }
    } else if (background === 'image' && backgroundImageUrl) {
      videoConfig.background = {
        type: 'image',
        value: backgroundImageUrl
      }
    } else if (background === 'video' && backgroundVideoUrl) {
      videoConfig.background = {
        type: 'video',
        value: backgroundVideoUrl
      }
    } else {
      videoConfig.background = {
        type: 'none'
      }
    }

    console.log('🎬 Creating HeyGen avatar video with config:', JSON.stringify(videoConfig, null, 2))

    const response = await axios.post(
      `${HEYGEN_API_BASE}/avatar/video`,
      videoConfig,
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('✅ HeyGen video creation response:', response.data)

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('❌ Error creating HeyGen video:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to create video'
    }
  }
}

/**
 * Get video status
 * @param {string} videoId - Video ID from creation response
 * @returns {Promise<object>} - Video status
 */
export async function getVideoStatus(videoId) {
  try {
    const response = await axios.get(
      `${HEYGEN_API_BASE}/avatar/video/${videoId}`,
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY
        }
      }
    )

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Error getting video status:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to get video status'
    }
  }
}

/**
 * List available avatars
 * @returns {Promise<object>} - List of avatars
 */
export async function listAvatars() {
  try {
    console.log('📋 Fetching avatars from HeyGen API...')
    const response = await axios.get(
      `${HEYGEN_API_BASE}/avatars`,
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY
        }
      }
    )

    console.log('✅ HeyGen API response received')
    console.log('Response structure:', {
      hasError: !!response.data.error,
      hasData: !!response.data.data,
      hasAvatars: !!(response.data.data && response.data.data.avatars),
      isArray: Array.isArray(response.data),
      keys: Object.keys(response.data || {})
    })
    
    // The response structure is: { error: null, data: { avatars: [...] } }
    // Or sometimes: { avatars: [...] } directly
    let avatars = []
    
    if (response.data.error) {
      throw new Error(response.data.error)
    }
    
    // Check for nested structure: response.data.data.avatars
    if (response.data.data && response.data.data.avatars && Array.isArray(response.data.data.avatars)) {
      avatars = response.data.data.avatars
    }
    // Check for direct structure: response.data.avatars
    else if (response.data.avatars && Array.isArray(response.data.avatars)) {
      avatars = response.data.avatars
    }
    // Check if response.data is directly an array
    else if (Array.isArray(response.data)) {
      avatars = response.data
    }
    // Check for data.data array
    else if (response.data.data && Array.isArray(response.data.data)) {
      avatars = response.data.data
    }

    console.log(`Found ${avatars.length} avatars in response`)

    // Transform to a consistent format
    const formattedAvatars = avatars.map(avatar => ({
      avatar_id: avatar.avatar_id || avatar.talking_photo_id || avatar.id,
      name: avatar.avatar_name || avatar.talking_photo_name || avatar.name || avatar.display_name,
      preview_image_url: avatar.preview_image_url,
      gender: avatar.gender,
      is_custom: !!(avatar.talking_photo_id || avatar.talking_photo_name) // Custom avatars use talking_photo_id/name
    }))

    console.log(`✅ Found ${formattedAvatars.length} avatars`)

    return {
      success: true,
      data: formattedAvatars
    }
  } catch (error) {
    console.error('❌ Error listing avatars:', error.response?.data || error.message)
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to list avatars'
    }
  }
}

/**
 * List available voices
 * @returns {Promise<object>} - List of voices
 */
export async function listVoices() {
  try {
    const response = await axios.get(
      `${HEYGEN_API_BASE}/voice/list`,
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY
        }
      }
    )

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Error listing voices:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to list voices'
    }
  }
}


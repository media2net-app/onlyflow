import {
  createAvatarVideo,
  getVideoStatus as getVideoStatusService,
  listAvatars as listAvatarsService,
  listVoices as listVoicesService
} from '../services/heygenService.js'

/**
 * Create a video using HeyGen API
 */
export const createVideo = async (req, res) => {
  try {
    const {
      avatarId,
      voiceId,
      text,
      audioUrl,
      dimension,
      caption,
      background,
      backgroundColor,
      backgroundImageUrl,
      backgroundVideoUrl,
      influencerId
    } = req.body

    const result = await createAvatarVideo({
      avatarId,
      voiceId,
      text,
      audioUrl,
      dimension,
      caption,
      background,
      backgroundColor,
      backgroundImageUrl,
      backgroundVideoUrl
    })

    if (result.success) {
      // TODO: Save video reference to database if influencerId is provided
      res.json({
        success: true,
        data: result.data
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('Error creating video:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create video'
    })
  }
}

/**
 * Get video status
 */
export const getVideoStatus = async (req, res) => {
  try {
    const { videoId } = req.params

    const result = await getVideoStatusService(videoId)

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('Error getting video status:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get video status'
    })
  }
}

/**
 * List available avatars
 */
export const listAvatars = async (req, res) => {
  try {
    const result = await listAvatarsService()

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('Error listing avatars:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list avatars'
    })
  }
}

/**
 * List available voices
 */
export const listVoices = async (req, res) => {
  try {
    const result = await listVoicesService()

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('Error listing voices:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list voices'
    })
  }
}


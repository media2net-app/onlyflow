import prisma from '../lib/prisma.js'
import {
  generateInstagramOAuthUrl,
  exchangeCodeForToken,
  getInstagramBusinessAccount,
  verifyAccessToken
} from '../services/instagramService.js'

/**
 * Get all social media accounts for an influencer
 */
export const getSocialAccounts = async (req, res) => {
  try {
    const { influencerId } = req.params

    const accounts = await prisma.socialMediaAccount.findMany({
      where: {
        influencerId: parseInt(influencerId)
      },
      orderBy: {
        platform: 'asc'
      }
    })

    // Format accounts for frontend
    const formattedAccounts = accounts.map(account => ({
      id: account.id,
      platform: account.platform,
      accountId: account.accountId,
      accountName: account.accountName,
      isConnected: account.status === 'connected',
      connectionStatus: account.status,
      followerCount: account.followerCount,
      postCount: account.postCount,
      lastSyncAt: account.lastSyncAt
    }))

    res.json({
      success: true,
      data: formattedAccounts
    })
  } catch (error) {
    console.error('Error fetching social accounts:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch social accounts'
    })
  }
}

/**
 * Initiate OAuth connection for a platform
 */
export const connectAccount = async (req, res) => {
  try {
    const { platform } = req.params
    const { influencerId } = req.body

    if (!influencerId) {
      return res.status(400).json({
        success: false,
        error: 'Influencer ID is required'
      })
    }

    // Handle Instagram OAuth
    if (platform === 'instagram') {
      try {
        const oauthUrl = generateInstagramOAuthUrl(parseInt(influencerId))
        res.json({
          success: true,
          oauthUrl: oauthUrl,
          message: 'Redirecting to Instagram authorization...'
        })
      } catch (error) {
        console.error('Error generating Instagram OAuth URL:', error)
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to generate OAuth URL. Please configure FACEBOOK_APP_ID in environment variables.'
        })
      }
      return
    }

    // For other platforms, return placeholder
    res.json({
      success: true,
      message: `OAuth connection for ${platform} - to be implemented`,
      oauthUrl: `/api/social/oauth/callback/${platform}?influencerId=${influencerId}`
    })
  } catch (error) {
    console.error('Error connecting account:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to connect account'
    })
  }
}

/**
 * Disconnect a social media account
 */
export const disconnectAccount = async (req, res) => {
  try {
    const { platform, influencerId } = req.params

    // Delete the account connection
    await prisma.socialMediaAccount.deleteMany({
      where: {
        influencerId: parseInt(influencerId),
        platform: platform
      }
    })

    res.json({
      success: true,
      message: `Disconnected ${platform} account`
    })
  } catch (error) {
    console.error('Error disconnecting account:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to disconnect account'
    })
  }
}

/**
 * Refresh connection status and tokens
 */
export const refreshConnection = async (req, res) => {
  try {
    const { platform, influencerId } = req.params

    const account = await prisma.socialMediaAccount.findFirst({
      where: {
        influencerId: parseInt(influencerId),
        platform: platform
      }
    })

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      })
    }

    // TODO: Implement token refresh logic per platform
    // For now, just update the lastSyncAt timestamp
    const updated = await prisma.socialMediaAccount.update({
      where: { id: account.id },
      data: {
        lastSyncAt: new Date()
      }
    })

    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('Error refreshing connection:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to refresh connection'
    })
  }
}

/**
 * Get platform API status and requirements
 */
export const getPlatformStatus = async (req, res) => {
  try {
    const { platform } = req.params

    // Platform-specific information
    const platformInfo = {
      instagram: {
        apiAvailable: true,
        requirements: 'Instagram Business or Creator account required. Must be linked to Facebook page.',
        oauthRequired: true,
        docsUrl: 'https://developers.facebook.com/docs/instagram-api'
      },
      facebook: {
        apiAvailable: true,
        requirements: 'Facebook Page required for posting.',
        oauthRequired: true,
        docsUrl: 'https://developers.facebook.com/docs/graph-api'
      },
      twitter: {
        apiAvailable: true,
        requirements: 'Twitter Developer account and API keys required.',
        oauthRequired: true,
        docsUrl: 'https://developer.twitter.com/en/docs/twitter-api'
      },
      tiktok: {
        apiAvailable: true,
        requirements: 'TikTok Business account and API access (may require approval).',
        oauthRequired: true,
        docsUrl: 'https://developers.tiktok.com/'
      },
      linkedin: {
        apiAvailable: true,
        requirements: 'LinkedIn Company Page or personal profile with API access.',
        oauthRequired: true,
        docsUrl: 'https://docs.microsoft.com/en-us/linkedin/'
      },
      pinterest: {
        apiAvailable: true,
        requirements: 'Pinterest Business account required.',
        oauthRequired: true,
        docsUrl: 'https://developers.pinterest.com/'
      },
      youtube: {
        apiAvailable: true,
        requirements: 'YouTube Channel with API access enabled.',
        oauthRequired: true,
        docsUrl: 'https://developers.google.com/youtube/v3'
      }
    }

    const info = platformInfo[platform] || {
      apiAvailable: false,
      requirements: 'Platform not supported',
      oauthRequired: false
    }

    res.json({
      success: true,
      data: info
    })
  } catch (error) {
    console.error('Error getting platform status:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get platform status'
    })
  }
}


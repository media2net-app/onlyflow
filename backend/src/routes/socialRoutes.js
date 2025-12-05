import express from 'express'
import {
  getSocialAccounts,
  connectAccount,
  disconnectAccount,
  refreshConnection,
  getPlatformStatus
} from '../controllers/socialController.js'

const router = express.Router()

// Get all social media accounts for an influencer
router.get('/accounts/:influencerId', getSocialAccounts)

// Connect a social media account (OAuth initiation)
router.post('/connect/:platform', connectAccount)

// Disconnect a social media account
router.delete('/disconnect/:platform/:influencerId', disconnectAccount)

// Refresh/update connection status
router.post('/refresh/:platform/:influencerId', refreshConnection)

// Get platform API status and requirements
router.get('/platforms/:platform/status', getPlatformStatus)

// OAuth callback handlers
router.get('/oauth/callback/:platform', async (req, res) => {
  try {
    const { platform } = req.params
    const { code, state, error } = req.query

    if (error) {
      return res.redirect(`http://localhost:5173/social?error=${encodeURIComponent(error)}`)
    }

    if (!code) {
      return res.redirect(`http://localhost:5173/social?error=${encodeURIComponent('No authorization code received')}`)
    }

    // Handle Instagram callback
    if (platform === 'instagram') {
      try {
        // Decode state to get influencerId
        let influencerId
        if (state) {
          const decodedState = JSON.parse(Buffer.from(state, 'base64').toString())
          influencerId = decodedState.influencerId
        } else {
          // Fallback: try to get from query params
          influencerId = req.query.influencerId
        }

        if (!influencerId) {
          return res.redirect(`http://localhost:5173/social?error=${encodeURIComponent('Influencer ID not found')}`)
        }

        // Import services
        const { exchangeCodeForToken, getInstagramBusinessAccount } = await import('../services/instagramService.js')
        const prisma = (await import('../lib/prisma.js')).default

        // Exchange code for token
        const tokenData = await exchangeCodeForToken(code)

        // Get Instagram Business Account info
        const igAccount = await getInstagramBusinessAccount(tokenData.accessToken)

        // Calculate expiration date
        const expiresAt = new Date()
        expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expiresIn)

        // Save or update account in database
        const account = await prisma.socialMediaAccount.upsert({
          where: {
            influencerId_platform: {
              influencerId: parseInt(influencerId),
              platform: 'instagram'
            }
          },
          update: {
            accountId: igAccount.instagramAccountId,
            accountName: igAccount.username,
            accessToken: tokenData.accessToken,
            refreshToken: null, // Instagram doesn't use refresh tokens
            expiresAt: expiresAt,
            status: 'connected',
            followerCount: igAccount.followerCount,
            postCount: igAccount.mediaCount,
            updatedAt: new Date()
          },
          create: {
            influencerId: parseInt(influencerId),
            platform: 'instagram',
            accountId: igAccount.instagramAccountId,
            accountName: igAccount.username,
            accessToken: tokenData.accessToken,
            refreshToken: null,
            expiresAt: expiresAt,
            status: 'connected',
            followerCount: igAccount.followerCount,
            postCount: igAccount.mediaCount
          }
        })

        console.log(`✅ Instagram account connected: @${igAccount.username} for influencer ${influencerId}`)

        // Redirect back to frontend with success
        res.redirect(`http://localhost:5173/social?success=instagram&account=${encodeURIComponent(igAccount.username)}`)
      } catch (error) {
        console.error('Error handling Instagram callback:', error)
        res.redirect(`http://localhost:5173/social?error=${encodeURIComponent(error.message || 'Failed to connect Instagram account')}`)
      }
      return
    }

    // For other platforms
    res.json({ success: true, message: `OAuth callback for ${platform} - to be implemented` })
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    res.redirect(`http://localhost:5173/social?error=${encodeURIComponent(error.message || 'OAuth callback failed')}`)
  }
})

export default router


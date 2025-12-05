import axios from 'axios'

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3001/api/social/oauth/callback/instagram'
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'

/**
 * Generate Instagram OAuth URL
 * Instagram uses Facebook's OAuth system
 */
export function generateInstagramOAuthUrl(influencerId) {
  if (!FACEBOOK_APP_ID) {
    throw new Error('FACEBOOK_APP_ID is not configured in environment variables')
  }

  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement'
  ].join(',')

  const state = Buffer.from(JSON.stringify({ influencerId, platform: 'instagram' })).toString('base64')

  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: `${BASE_URL}${FACEBOOK_REDIRECT_URI}`,
    scope: scopes,
    response_type: 'code',
    state: state
  })

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code) {
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    throw new Error('Facebook App credentials are not configured')
  }

  try {
    // Exchange code for short-lived access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: `${BASE_URL}${FACEBOOK_REDIRECT_URI}`,
        code: code
      }
    })

    const shortLivedToken = tokenResponse.data.access_token

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        fb_exchange_token: shortLivedToken
      }
    })

    return {
      accessToken: longLivedResponse.data.access_token,
      expiresIn: longLivedResponse.data.expires_in || 5184000, // 60 days in seconds
      tokenType: longLivedResponse.data.token_type || 'bearer'
    }
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message)
    throw new Error(`Failed to exchange code for token: ${error.response?.data?.error?.message || error.message}`)
  }
}

/**
 * Get user's Instagram Business Account ID
 */
export async function getInstagramBusinessAccount(accessToken) {
  try {
    // First, get user's pages
    const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: {
        access_token: accessToken,
        fields: 'id,name,instagram_business_account'
      }
    })

    const pages = pagesResponse.data.data || []
    
    // Find page with Instagram Business Account
    for (const page of pages) {
      if (page.instagram_business_account) {
        const igAccountId = page.instagram_business_account.id
        
        // Get Instagram account details
        const igAccountResponse = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}`, {
          params: {
            access_token: accessToken,
            fields: 'id,username,profile_picture_url,biography,followers_count,media_count'
          }
        })

        return {
          pageId: page.id,
          pageName: page.name,
          instagramAccountId: igAccountId,
          username: igAccountResponse.data.username,
          profilePicture: igAccountResponse.data.profile_picture_url,
          biography: igAccountResponse.data.biography,
          followerCount: igAccountResponse.data.followers_count || 0,
          mediaCount: igAccountResponse.data.media_count || 0
        }
      }
    }

    throw new Error('No Instagram Business Account found. Please link your Instagram account to a Facebook Page.')
  } catch (error) {
    console.error('Error getting Instagram Business Account:', error.response?.data || error.message)
    throw new Error(`Failed to get Instagram account: ${error.response?.data?.error?.message || error.message}`)
  }
}

/**
 * Verify access token is still valid
 */
export async function verifyAccessToken(accessToken) {
  try {
    const response = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        access_token: accessToken,
        fields: 'id,name'
      }
    })
    return response.data
  } catch (error) {
    return null
  }
}


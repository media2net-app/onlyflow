import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { 
  HiOutlineShare,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineLink,
  HiOutlineGlobe,
  HiOutlineInformationCircle
} from 'react-icons/hi'
import { influencersAPI, socialAPI } from '../services/api'

// Platform configurations
const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: 'from-purple-500 to-pink-500',
    apiAvailable: true,
    requirements: 'Instagram Business or Creator account required. Must be linked to Facebook page.',
    oauthUrl: '/api/social/connect/instagram',
    docsUrl: 'https://developers.facebook.com/docs/instagram-api'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👤',
    color: 'from-blue-500 to-blue-600',
    apiAvailable: true,
    requirements: 'Facebook Page required for posting.',
    oauthUrl: '/api/social/connect/facebook',
    docsUrl: 'https://developers.facebook.com/docs/graph-api'
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '🐦',
    color: 'from-blue-400 to-blue-500',
    apiAvailable: true,
    requirements: 'Twitter Developer account and API keys required.',
    oauthUrl: '/api/social/connect/twitter',
    docsUrl: 'https://developer.twitter.com/en/docs/twitter-api'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'from-black to-gray-800',
    apiAvailable: true,
    requirements: 'TikTok Business account and API access (may require approval).',
    oauthUrl: '/api/social/connect/tiktok',
    docsUrl: 'https://developers.tiktok.com/'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'from-blue-600 to-blue-700',
    apiAvailable: true,
    requirements: 'LinkedIn Company Page or personal profile with API access.',
    oauthUrl: '/api/social/connect/linkedin',
    docsUrl: 'https://docs.microsoft.com/en-us/linkedin/'
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    color: 'from-red-500 to-red-600',
    apiAvailable: true,
    requirements: 'Pinterest Business account required.',
    oauthUrl: '/api/social/connect/pinterest',
    docsUrl: 'https://developers.pinterest.com/'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: 'from-red-600 to-red-700',
    apiAvailable: true,
    requirements: 'YouTube Channel with API access enabled.',
    oauthUrl: '/api/social/connect/youtube',
    docsUrl: 'https://developers.google.com/youtube/v3'
  }
]

function SocialMedia() {
  const [influencers, setInfluencers] = useState([])
  const [selectedInfluencer, setSelectedInfluencer] = useState(null)
  const [socialAccounts, setSocialAccounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInfluencers()
    
    // Check for OAuth callback success/error in URL
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const error = params.get('error')
    const account = params.get('account')
    
    if (success) {
      alert(`Successfully connected ${success === 'instagram' ? 'Instagram' : success} account${account ? `: @${account}` : ''}!`)
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
      // Reload accounts if influencer is selected
      if (selectedInfluencer) {
        loadSocialAccounts(selectedInfluencer.id)
      }
    } else if (error) {
      alert(`Error connecting account: ${error}`)
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (selectedInfluencer) {
      loadSocialAccounts(selectedInfluencer.id)
    }
  }, [selectedInfluencer])

  const loadInfluencers = async () => {
    try {
      const res = await influencersAPI.getAll()
      if (res.success) {
        setInfluencers(res.data || [])
        if (res.data && res.data.length > 0 && !selectedInfluencer) {
          setSelectedInfluencer(res.data[0])
        }
      }
    } catch (error) {
      console.error('Error loading influencers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSocialAccounts = async (influencerId) => {
    try {
      const res = await socialAPI.getAccounts(influencerId)
      if (res.success && res.data) {
        // Convert array to object keyed by platform
        const accounts = {}
        PLATFORMS.forEach(platform => {
          const account = res.data.find(acc => acc.platform === platform.id)
          if (account) {
            accounts[platform.id] = {
              isConnected: account.isConnected,
              accountName: account.accountName,
              connectionStatus: account.connectionStatus,
              followerCount: account.followerCount,
              postCount: account.postCount,
              lastSyncAt: account.lastSyncAt
            }
          } else {
            accounts[platform.id] = {
              isConnected: false,
              accountName: null,
              connectionStatus: 'disconnected'
            }
          }
        })
        setSocialAccounts(accounts)
      } else {
        // Initialize with empty accounts if no data
        const accounts = {}
        PLATFORMS.forEach(platform => {
          accounts[platform.id] = {
            isConnected: false,
            accountName: null,
            connectionStatus: 'disconnected'
          }
        })
        setSocialAccounts(accounts)
      }
    } catch (error) {
      console.error('Error loading social accounts:', error)
      // Initialize with empty accounts on error
      const accounts = {}
      PLATFORMS.forEach(platform => {
        accounts[platform.id] = {
          isConnected: false,
          accountName: null,
          connectionStatus: 'disconnected'
        }
      })
      setSocialAccounts(accounts)
    }
  }

  const handleConnect = async (platform) => {
    if (!selectedInfluencer) {
      alert('Please select an influencer first')
      return
    }

    try {
      const res = await socialAPI.connectAccount(platform.id, selectedInfluencer.id)
      if (res.success) {
        if (res.oauthUrl) {
          // Redirect to OAuth URL
          window.location.href = res.oauthUrl
        } else {
          alert(`Connecting ${platform.name} for ${selectedInfluencer.name}...\n\nOAuth flow will be implemented.`)
        }
      } else {
        alert(`Error: ${res.error || 'Failed to initiate connection'}`)
      }
    } catch (error) {
      console.error('Error connecting account:', error)
      alert(`Error connecting ${platform.name}: ${error.message}`)
    }
  }

  const handleDisconnect = async (platform) => {
    if (!selectedInfluencer) {
      return
    }

    if (confirm(`Are you sure you want to disconnect ${platform.name} for ${selectedInfluencer.name}?`)) {
      try {
        const res = await socialAPI.disconnectAccount(platform.id, selectedInfluencer.id)
        if (res.success) {
          // Reload accounts
          await loadSocialAccounts(selectedInfluencer.id)
          alert(`Successfully disconnected ${platform.name}`)
        } else {
          alert(`Error: ${res.error || 'Failed to disconnect'}`)
        }
      } catch (error) {
        console.error('Error disconnecting account:', error)
        alert(`Error disconnecting ${platform.name}: ${error.message}`)
      }
    }
  }

  const handleRefresh = async (platform) => {
    if (!selectedInfluencer) {
      return
    }

    try {
      const res = await socialAPI.refreshConnection(platform.id, selectedInfluencer.id)
      if (res.success) {
        await loadSocialAccounts(selectedInfluencer.id)
      } else {
        alert(`Error: ${res.error || 'Failed to refresh connection'}`)
      }
    } catch (error) {
      console.error('Error refreshing connection:', error)
      alert(`Error refreshing ${platform.name}: ${error.message}`)
    }
  }

  const getAccountStatus = (platformId) => {
    return socialAccounts[platformId] || {
      isConnected: false,
      connectionStatus: 'disconnected'
    }
  }

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-8 border border-purple-500/30">
              <h1 className="text-4xl font-bold text-white mb-3">Social Media Integration</h1>
              <p className="text-lg text-gray-300">
                Connect social media accounts to your influencers and post content directly from OnlyFlow
              </p>
            </div>

            {/* Influencer Selector */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select Influencer
              </label>
              <select
                value={selectedInfluencer?.id || ''}
                onChange={(e) => {
                  const influencer = influencers.find(inf => inf.id === parseInt(e.target.value))
                  setSelectedInfluencer(influencer)
                }}
                className="w-full md:w-1/3 px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select an influencer...</option>
                {influencers.map(inf => (
                  <option key={inf.id} value={inf.id}>
                    {inf.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Grid */}
            {selectedInfluencer && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PLATFORMS.map(platform => {
                  const account = getAccountStatus(platform.id)
                  const isConnected = account.isConnected
                  
                  return (
                    <div
                      key={platform.id}
                      className={`bg-dark-surface rounded-lg p-6 border ${
                        isConnected 
                          ? 'border-green-500/50' 
                          : 'border-gray-800/50'
                      } hover:border-purple-500/50 transition-all`}
                    >
                      {/* Platform Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`text-3xl bg-gradient-to-r ${platform.color} bg-clip-text text-transparent`}>
                            {platform.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{platform.name}</h3>
                            {isConnected && account.accountName && (
                              <p className="text-xs text-gray-400">@{account.accountName}</p>
                            )}
                          </div>
                        </div>
                        {isConnected ? (
                          <HiOutlineCheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <HiOutlineXCircle className="w-6 h-6 text-gray-500" />
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            isConnected
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}
                        >
                          {isConnected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>

                      {/* API Status */}
                      <div className="mb-4 flex items-center space-x-2 text-xs text-gray-400">
                        <HiOutlineGlobe className="w-4 h-4" />
                        <span>API Available: {platform.apiAvailable ? 'Yes' : 'No'}</span>
                      </div>

                      {/* Requirements Info */}
                      <div className="mb-4 p-3 bg-dark-card rounded-lg border border-gray-800/30">
                        <div className="flex items-start space-x-2">
                          <HiOutlineInformationCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-400">{platform.requirements}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        {isConnected ? (
                          <>
                            <button
                              onClick={() => handleDisconnect(platform)}
                              className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium py-2 px-4 rounded-lg transition-colors border border-red-500/30 flex items-center justify-center space-x-2"
                            >
                              <HiOutlineXCircle className="w-4 h-4" />
                              <span>Disconnect</span>
                            </button>
                            <button
                              onClick={() => handleRefresh(platform)}
                              className="bg-dark-card hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-gray-800/30 flex items-center justify-center"
                              title="Refresh connection"
                            >
                              <HiOutlineRefresh className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleConnect(platform)}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <HiOutlineLink className="w-4 h-4" />
                            <span>Connect Account</span>
                          </button>
                        )}
                      </div>

                      {/* Connection Details (if connected) */}
                      {isConnected && account.followerCount !== undefined && (
                        <div className="mt-4 pt-4 border-t border-gray-800/30">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {account.followerCount !== null && (
                              <div>
                                <p className="text-gray-400">Followers</p>
                                <p className="text-white font-semibold">
                                  {account.followerCount.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {account.postCount !== null && (
                              <div>
                                <p className="text-gray-400">Posts</p>
                                <p className="text-white font-semibold">
                                  {account.postCount.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* API Information */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4">API Information</h2>
              <div className="space-y-4">
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Supported Platforms</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    The following platforms have official APIs available for posting content:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PLATFORMS.filter(p => p.apiAvailable).map(platform => (
                      <div key={platform.id} className="flex items-center justify-between p-2 bg-dark-surface rounded">
                        <span className="text-sm text-gray-300">{platform.name}</span>
                        <a
                          href={platform.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          View Docs →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">OAuth Authentication</h3>
                  <p className="text-sm text-gray-300">
                    All platform connections use OAuth 2.0 for secure authentication. When you connect an account, 
                    you'll be redirected to the platform's authorization page to grant OnlyFlow permission to post on your behalf.
                  </p>
                </div>

                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Next Steps</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400">1.</span>
                      <span>Configure API credentials in backend environment variables</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400">2.</span>
                      <span>Implement OAuth flow for each platform</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400">3.</span>
                      <span>Add posting functionality to content generation workflow</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400">4.</span>
                      <span>Add scheduling and auto-posting features</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SocialMedia


import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { 
  HiOutlineVideoCamera,
  HiOutlineUser,
  HiOutlinePlay,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock
} from 'react-icons/hi'
import { influencersAPI, heygenAPI } from '../services/api'

function Video() {
  const [influencers, setInfluencers] = useState([])
  const [selectedInfluencer, setSelectedInfluencer] = useState(null)
  const [avatars, setAvatars] = useState([])
  const [voices, setVoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [videos, setVideos] = useState([])

  // Video generation form
  const [formData, setFormData] = useState({
    avatarId: '',
    voiceId: '',
    text: '',
    dimension: '1080x1080',
    caption: false,
    background: 'none',
    backgroundColor: '#000000',
    backgroundImageUrl: '',
    backgroundVideoUrl: ''
  })

  useEffect(() => {
    loadInfluencers()
    loadAvatars()
    loadVoices()
  }, [])

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
    }
  }

  const loadAvatars = async () => {
    try {
      setLoading(true)
      const res = await heygenAPI.listAvatars()
      if (res.success && res.data) {
        // The backend now returns a formatted array
        const avatarList = Array.isArray(res.data) ? res.data : []
        console.log('Loaded avatars:', avatarList)
        setAvatars(avatarList)
        
        if (avatarList.length === 0) {
          console.warn('No avatars found in response')
        }
      } else {
        console.error('Failed to load avatars:', res.error)
        alert(`Failed to load avatars: ${res.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error loading avatars:', error)
      alert(`Error loading avatars: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadVoices = async () => {
    try {
      const res = await heygenAPI.listVoices()
      if (res.success && res.data) {
        setVoices(res.data.voices || res.data || [])
      }
    } catch (error) {
      console.error('Error loading voices:', error)
    }
  }

  const handleGenerateVideo = async () => {
    if (!formData.avatarId || !formData.voiceId || !formData.text.trim()) {
      alert('Please fill in all required fields: Avatar, Voice, and Text')
      return
    }

    setGenerating(true)
    try {
      const res = await heygenAPI.createVideo({
        ...formData,
        influencerId: selectedInfluencer?.id
      })

      if (res.success) {
        const videoData = res.data
        setVideos(prev => [{
          id: videoData.video_id || videoData.id,
          status: videoData.status || 'processing',
          url: videoData.video_url || null,
          createdAt: new Date().toISOString(),
          influencerId: selectedInfluencer?.id,
          influencerName: selectedInfluencer?.name
        }, ...prev])

        // If video is ready, show it immediately
        if (videoData.video_url) {
          alert('Video generated successfully!')
        } else {
          // Poll for video status
          pollVideoStatus(videoData.video_id || videoData.id)
        }
      } else {
        alert(`Error: ${res.error || 'Failed to generate video'}`)
      }
    } catch (error) {
      console.error('Error generating video:', error)
      alert(`Error: ${error.message || 'Failed to generate video'}`)
    } finally {
      setGenerating(false)
    }
  }

  const pollVideoStatus = async (videoId) => {
    const maxAttempts = 30
    let attempts = 0

    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await heygenAPI.getVideoStatus(videoId)
        if (res.success && res.data) {
          const status = res.data.status || res.data.video_status
          const videoUrl = res.data.video_url

          // Update video in list
          setVideos(prev => prev.map(v => 
            v.id === videoId 
              ? { ...v, status, url: videoUrl || v.url }
              : v
          ))

          if (status === 'completed' || status === 'success' || videoUrl) {
            clearInterval(interval)
            alert('Video is ready!')
          } else if (status === 'failed' || status === 'error') {
            clearInterval(interval)
            alert('Video generation failed')
          } else if (attempts >= maxAttempts) {
            clearInterval(interval)
            alert('Video generation is taking longer than expected. Please check back later.')
          }
        }
      } catch (error) {
        console.error('Error polling video status:', error)
        if (attempts >= maxAttempts) {
          clearInterval(interval)
        }
      }
    }, 5000) // Poll every 5 seconds
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <HiOutlineCheckCircle className="w-5 h-5 text-green-400" />
      case 'failed':
      case 'error':
        return <HiOutlineXCircle className="w-5 h-5 text-red-400" />
      case 'processing':
      case 'generating':
        return <HiOutlineClock className="w-5 h-5 text-yellow-400 animate-spin" />
      default:
        return <HiOutlineClock className="w-5 h-5 text-gray-400" />
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
              <h1 className="text-4xl font-bold text-white mb-3 flex items-center space-x-3">
                <HiOutlineVideoCamera className="w-10 h-10" />
                <span>Video Generation</span>
              </h1>
              <p className="text-lg text-gray-300">
                Create AI avatar videos using HeyGen API
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

            {/* Video Generation Form */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Video</h2>

              <div className="space-y-6">
                {/* Avatar Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Avatar <span className="text-red-400">*</span>
                    </label>
                    <button
                      onClick={loadAvatars}
                      disabled={loading}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1 disabled:opacity-50"
                    >
                      <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                  <select
                    value={formData.avatarId}
                    onChange={(e) => setFormData({...formData, avatarId: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select an avatar...</option>
                    {avatars.map(avatar => {
                      const avatarId = avatar.avatar_id || avatar.id || avatar.avatarId || avatar.talking_photo_id
                      const avatarName = avatar.name || avatar.avatar_name || avatar.display_name || avatar.talking_photo_name || avatarId
                      return (
                        <option key={avatarId} value={avatarId}>
                          {avatarName} {avatar.is_custom ? '(Custom)' : ''}
                        </option>
                      )
                    })}
                  </select>
                  {loading && avatars.length === 0 && (
                    <p className="text-xs text-gray-400 mt-2">Loading avatars...</p>
                  )}
                  {!loading && avatars.length === 0 && (
                    <p className="text-xs text-yellow-400 mt-2">
                      No avatars found. Make sure you have created avatars in your HeyGen account.
                    </p>
                  )}
                  {avatars.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      {avatars.length} avatar(s) available
                    </p>
                  )}
                </div>

                {/* Voice Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Voice <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.voiceId}
                    onChange={(e) => setFormData({...formData, voiceId: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a voice...</option>
                    {voices.map(voice => (
                      <option key={voice.voice_id || voice.id} value={voice.voice_id || voice.id}>
                        {voice.name || voice.voice_id || voice.id} {voice.language ? `(${voice.language})` : ''}
                      </option>
                    ))}
                  </select>
                  {voices.length === 0 && (
                    <p className="text-xs text-gray-400 mt-2">Loading voices...</p>
                  )}
                </div>

                {/* Text Script */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Script / Text <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                    placeholder="Enter the text script for the video..."
                    className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[150px]"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {formData.text.length} characters
                  </p>
                </div>

                {/* Dimension */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Video Dimension
                  </label>
                  <select
                    value={formData.dimension}
                    onChange={(e) => setFormData({...formData, dimension: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="1080x1080">1080x1080 (Square - Instagram)</option>
                    <option value="1920x1080">1920x1080 (Landscape - YouTube)</option>
                    <option value="1080x1920">1080x1920 (Portrait - Stories/Reels)</option>
                    <option value="1280x720">1280x720 (HD)</option>
                  </select>
                </div>

                {/* Caption */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="caption"
                    checked={formData.caption}
                    onChange={(e) => setFormData({...formData, caption: e.target.checked})}
                    className="w-5 h-5 bg-dark-card border-gray-800/30 rounded text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="caption" className="text-sm font-medium text-gray-300">
                    Enable Captions
                  </label>
                </div>

                {/* Background */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Background
                  </label>
                  <select
                    value={formData.background}
                    onChange={(e) => setFormData({...formData, background: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="none">None (Transparent)</option>
                    <option value="color">Solid Color</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                {formData.background === 'color' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})}
                      className="w-full h-12 bg-dark-card border border-gray-800/30 rounded-lg"
                    />
                  </div>
                )}

                {formData.background === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Background Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.backgroundImageUrl}
                      onChange={(e) => setFormData({...formData, backgroundImageUrl: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {formData.background === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Background Video URL
                    </label>
                    <input
                      type="url"
                      value={formData.backgroundVideoUrl}
                      onChange={(e) => setFormData({...formData, backgroundVideoUrl: e.target.value})}
                      placeholder="https://example.com/video.mp4"
                      className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerateVideo}
                  disabled={generating || !formData.avatarId || !formData.voiceId || !formData.text.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {generating ? (
                    <>
                      <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                      <span>Generating Video...</span>
                    </>
                  ) : (
                    <>
                      <HiOutlinePlay className="w-5 h-5" />
                      <span>Generate Video</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Videos List */}
            {videos.length > 0 && (
              <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                <h2 className="text-2xl font-bold text-white mb-6">Generated Videos</h2>
                <div className="space-y-4">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-dark-card rounded-lg p-4 border border-gray-800/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(video.status)}
                          <div>
                            <h3 className="text-white font-semibold">
                              Video {video.id}
                            </h3>
                            {video.influencerName && (
                              <p className="text-sm text-gray-400">
                                For: {video.influencerName}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          video.status === 'completed' || video.status === 'success'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : video.status === 'failed' || video.status === 'error'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {video.status || 'processing'}
                        </span>
                      </div>
                      {video.url && (
                        <div className="mt-4">
                          <video
                            src={video.url}
                            controls
                            className="w-full rounded-lg"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Video


import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { influencersAPI } from '../services/api'
import { 
  HiOutlinePencil,
  HiOutlineTrash,
  HiChevronRight,
  HiPlus,
  HiMinus
} from 'react-icons/hi'
import { HiOutlineRocketLaunch, HiOutlineMagnifyingGlass } from 'react-icons/hi2'

function InfluencersList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // 'all' or 'daily'
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch influencers from API
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        setLoading(true)
        const response = await influencersAPI.getAll(searchQuery, filter)
        setInfluencers(response.data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching influencers:', err)
        setError('Failed to load influencers')
        setInfluencers([])
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchInfluencers()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, filter])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this influencer?')) {
      return
    }

    try {
      await influencersAPI.delete(id)
      // Refresh list
      const response = await influencersAPI.getAll(searchQuery, filter)
      setInfluencers(response.data || [])
    } catch (err) {
      console.error('Error deleting influencer:', err)
      alert('Failed to delete influencer')
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar - 20% */}
      <Sidebar />

      {/* Main Content - 80% */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <Link
                to="/influencers/train"
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-600/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2"
              >
                <HiPlus className="w-5 h-5" />
                <span>Train a new influencer</span>
              </Link>
              <Link
                to="/dashboard"
                className="bg-dark-card/50 backdrop-blur-sm hover:bg-dark-card/80 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/5 hover:border-purple-500/30 flex items-center space-x-2"
              >
                <HiOutlineRocketLaunch className="w-5 h-5" />
                <span>Generate new content</span>
              </Link>
            </div>
          </div>

          {/* OnlyFlow+ Banner */}
          <div className="relative group">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-purple-gradient rounded-2xl opacity-50 blur-xl"></div>
            {/* Glass Card */}
            <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-6 gradient-border-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-300 mb-2">
                    Enable OnlyFlow+ to give every automatically scheduled clip a studio-grade finish.
                  </p>
                </div>
                <button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-600/30 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center space-x-2">
                  <span>Enable OnlyFlow+ for Plan</span>
                  <HiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or description"
                className="w-full pl-12 pr-4 py-3 bg-dark-card backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-200"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-dark-card/50 backdrop-blur-sm border border-white/5 text-gray-400 hover:text-white hover:border-purple-500/30'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('daily')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filter === 'daily'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-dark-card/50 backdrop-blur-sm border border-white/5 text-gray-400 hover:text-white hover:border-purple-500/30'
                }`}
              >
                Daily content enabled
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading influencers...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Influencers Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {influencers.map((influencer) => (
                <InfluencerCard 
                  key={influencer.id} 
                  influencer={influencer}
                  onDelete={handleDelete}
                  onUpdate={async (id, data) => {
                    try {
                      await influencersAPI.update(id, data)
                      const response = await influencersAPI.getAll(searchQuery, filter)
                      setInfluencers(response.data || [])
                    } catch (err) {
                      console.error('Error updating influencer:', err)
                      alert('Failed to update influencer')
                    }
                  }}
                />
              ))}
            </div>
          )}

          {!loading && !error && influencers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No influencers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfluencerCard({ influencer, onDelete, onUpdate }) {
  const [feedPosts, setFeedPosts] = useState(influencer.feedPosts || 0)
  const [storyPosts, setStoryPosts] = useState(influencer.storyPosts || 0)
  const [video5s, setVideo5s] = useState(influencer.video5s || 0)
  const [video8s, setVideo8s] = useState(influencer.video8s || 0)
  const [captionVideo, setCaptionVideo] = useState(influencer.captionVideo || false)
  const [trendsVideos, setTrendsVideos] = useState(influencer.trendsVideos || 0)
  const [multiAngle, setMultiAngle] = useState(influencer.multiAngle || 0)
  const [pauseChallenge, setPauseChallenge] = useState(influencer.pauseChallenge || 0)
  const [outfitChanger, setOutfitChanger] = useState(influencer.outfitChanger || 0)
  const [beforeAfter, setBeforeAfter] = useState(influencer.beforeAfter || 0)

  // Update API when values change
  const updateValue = async (field, value) => {
    const updates = { [field]: value }
    if (onUpdate) {
      await onUpdate(influencer.id, updates)
    }
  }

  const handleFeedPostsChange = (newValue) => {
    setFeedPosts(newValue)
    updateValue('feedPosts', newValue)
  }

  const handleStoryPostsChange = (newValue) => {
    setStoryPosts(newValue)
    updateValue('storyPosts', newValue)
  }

  const handleVideo5sChange = (newValue) => {
    setVideo5s(newValue)
    updateValue('video5s', newValue)
  }

  const handleVideo8sChange = (newValue) => {
    setVideo8s(newValue)
    updateValue('video8s', newValue)
  }

  const handleCaptionVideoChange = (newValue) => {
    setCaptionVideo(newValue)
    updateValue('captionVideo', newValue)
  }

  const handleTrendsVideosChange = (newValue) => {
    setTrendsVideos(newValue)
    updateValue('trendsVideos', newValue)
  }

  const handleMultiAngleChange = (newValue) => {
    setMultiAngle(newValue)
    updateValue('multiAngle', newValue)
  }

  const handlePauseChallengeChange = (newValue) => {
    setPauseChallenge(newValue)
    updateValue('pauseChallenge', newValue)
  }

  const handleOutfitChangerChange = (newValue) => {
    setOutfitChanger(newValue)
    updateValue('outfitChanger', newValue)
  }

  const handleBeforeAfterChange = (newValue) => {
    setBeforeAfter(newValue)
    updateValue('beforeAfter', newValue)
  }

  return (
    <div className="relative group">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-purple-gradient rounded-2xl opacity-50 blur-xl"></div>
      {/* Glass Card */}
      <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl overflow-hidden gradient-border-card hover:before:opacity-100 transition-all duration-300">
        {/* Profile Section */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center overflow-hidden relative ring-2 ring-purple-500/30">
                {influencer.imageUrl ? (
                  <>
                    <img 
                      src={influencer.imageUrl.startsWith('http') 
                        ? influencer.imageUrl 
                        : `http://localhost:3001${influencer.imageUrl}`} 
                      alt={influencer.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        const placeholder = e.target.nextElementSibling
                        if (placeholder) placeholder.style.display = 'flex'
                      }}
                    />
                    <span 
                      className="text-2xl font-bold text-white absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-400"
                      style={{ display: 'none' }}
                    >
                      {influencer.image || influencer.name.charAt(0)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-white">{influencer.image || influencer.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{influencer.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{influencer.description || 'Content Creator'}</p>
                <div className="flex items-center space-x-3">
                  <span className="text-xs bg-gradient-to-r from-purple-600 to-purple-500 text-white px-2 py-0.5 rounded-full">
                    {influencer.dailyContentEnabled ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {influencer.trainingProgress || 0}% trained
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to={`/influencers/train?edit=${influencer.id}`}
                className="p-2 bg-dark-card/50 backdrop-blur-sm hover:bg-purple-500/20 rounded-xl border border-white/5 hover:border-purple-500/30 text-gray-400 hover:text-white transition-all duration-200"
              >
                <HiOutlinePencil className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => onDelete && onDelete(influencer.id)}
                className="p-2 bg-dark-card/50 backdrop-blur-sm hover:bg-red-500/20 rounded-xl border border-white/5 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all duration-200"
              >
                <HiOutlineTrash className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-3 border border-white/5">
              <p className="text-xs text-gray-400 mb-1">Feed Posts</p>
              <p className="text-lg font-bold text-white">{feedPosts}/week</p>
            </div>
            <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-3 border border-white/5">
              <p className="text-xs text-gray-400 mb-1">Story Posts</p>
              <p className="text-lg font-bold text-white">{storyPosts}/week</p>
            </div>
            <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-3 border border-white/5">
              <p className="text-xs text-gray-400 mb-1">Training</p>
              <p className="text-lg font-bold text-white">{influencer.trainingProgress || 0}%</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Link
                to={`/influencers/train?edit=${influencer.id}`}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/20 text-center text-sm"
              >
                Edit Profile
              </Link>
              <Link
                to={`/content?influencerId=${influencer.id}`}
                className="flex-1 bg-dark-card/50 backdrop-blur-sm hover:bg-dark-card/80 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 border border-white/5 hover:border-purple-500/30 text-center text-sm"
              >
                View Content
              </Link>
            </div>
            <Link
              to={`/content-plan?influencerId=${influencer.id}`}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 text-center text-sm"
            >
              View Content Plan
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default InfluencersList


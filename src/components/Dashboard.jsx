import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { influencersAPI, contentAPI, aiAPI } from '../services/api'
import { 
  HiOutlineRocketLaunch, 
  HiOutlinePlus,
  HiOutlinePlay,
  HiChevronRight,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle
} from 'react-icons/hi2'

function Dashboard() {
  const navigate = useNavigate()
  const [influencers, setInfluencers] = useState([])
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(null) // null = loading, number = loaded

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [influencersRes, contentRes, creditsRes] = await Promise.all([
          influencersAPI.getAll(),
          contentAPI.getAll(),
          aiAPI.getCredits().catch(err => {
            console.warn('Failed to fetch credits:', err)
            return { success: false, data: { credits: null, error: 'Not available' } }
          })
        ])
        setInfluencers(influencersRes.data || [])
        setContent(contentRes.data || [])
        
        // Set credits from our tracking system
        if (creditsRes.success && creditsRes.data.credits !== null && creditsRes.data.credits !== undefined) {
          setCredits(creditsRes.data.credits)
        } else {
          // Fallback
          setCredits(9.95)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setCredits(19) // Fallback
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const influencersCount = influencers.length
  const contentGenerated = content.length
  const displayCredits = credits !== null ? credits : '...'
  
  // Get first influencer (Mila) for preview
  const firstInfluencer = influencers.length > 0 ? influencers[0] : null

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar - 20% */}
      <Sidebar />

      {/* Main Content - 80% */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Top Row: Welcome Back, What's Next, Account Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Back - Left */}
            <div className="lg:col-span-1 relative group">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-purple-gradient rounded-2xl opacity-50 blur-xl"></div>
              {/* Glass Card */}
              <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-6 gradient-border-card hover:before:opacity-100 transition-all duration-300">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Welcome Back
                </h3>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Create, launch, and grow
                </h2>
                <button 
                  onClick={() => navigate('/single')}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-600/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500/50 flex items-center justify-center space-x-2 mb-4"
                >
                  <HiOutlineRocketLaunch className="w-5 h-5" />
                  <span>Generate new content</span>
                </button>
                
                <button 
                  onClick={() => navigate('/influencers/train')}
                  className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm mb-6 transition-colors"
                >
                  <HiOutlinePlus className="w-4 h-4" />
                  <span>Train new influencer</span>
                </button>

                {/* Review Launch Guide Card */}
                <button 
                  onClick={() => {
                    alert('Launch Guide video would open here. This feature is coming soon!')
                  }}
                  className="w-full bg-dark-card backdrop-blur-sm rounded-xl p-4 gradient-border-card hover:before:opacity-100 transition-all duration-300 text-left"
                  style={{borderRadius: '0.75rem'}}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <HiOutlinePlay className="w-5 h-5 text-purple-400" />
                      <h4 className="text-sm font-semibold text-white">Review Launch Guide</h4>
                    </div>
                    <HiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <p className="text-xs text-gray-400">Watch the walkthrough video again.</p>
                </button>
              </div>
            </div>

            {/* What's Next - Middle */}
            <div className="lg:col-span-1 relative group">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-purple-gradient rounded-2xl opacity-50 blur-xl"></div>
              {/* Glass Card */}
              <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-6 gradient-border-card hover:before:opacity-100 transition-all duration-300">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  What's Next
                </h3>
                <h2 className="text-xl font-bold text-white mb-4">
                  Keep momentum going
                </h2>
                
                {/* Influencer Preview */}
                {firstInfluencer && (
                  <button
                    onClick={() => navigate('/influencers')}
                    className="w-full bg-dark-card backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-purple-500/20 transition-all duration-300 mb-4 text-left"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 flex items-center justify-center overflow-hidden relative ring-2 ring-purple-500/30">
                        {firstInfluencer.imageUrl ? (
                          <>
                            <img 
                              src={firstInfluencer.imageUrl.startsWith('http') 
                                ? firstInfluencer.imageUrl 
                                : `http://localhost:3001${firstInfluencer.imageUrl}`} 
                              alt={firstInfluencer.name}
                              className="w-full h-full object-cover object-top"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                const placeholder = e.target.nextElementSibling
                                if (placeholder) placeholder.style.display = 'flex'
                              }}
                            />
                            <span 
                              className="text-white font-bold absolute inset-0 flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-400"
                              style={{ display: 'none' }}
                            >
                              {firstInfluencer.image || firstInfluencer.name.charAt(0)}
                            </span>
                          </>
                        ) : (
                          <span className="text-white font-bold">{firstInfluencer.image || firstInfluencer.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">{firstInfluencer.name}</span>
                          <span className="text-xs bg-gradient-to-r from-purple-600 to-purple-500 text-white px-2 py-0.5 rounded-full">PRETRAINED</span>
                        </div>
                        <p className="text-xs text-gray-400">Ready for your next reel</p>
                      </div>
                    </div>
                  </button>
                )}

                {/* This Week */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">This Week</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/content')}
                      className="w-full bg-dark-card backdrop-blur-sm rounded-xl p-3 border border-white/5 hover:border-purple-500/20 transition-all duration-300 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-300 flex-1">do 4 dec: Sipping a glass of wine</p>
                        <span className="text-gray-500 text-xs ml-2">Upscale Italian rest...</span>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/content')}
                      className="w-full bg-dark-card backdrop-blur-sm rounded-xl p-3 border border-white/5 hover:border-purple-500/20 transition-all duration-300 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-300 flex-1">vr 5 dec: Unwinding at sunset and sipping sparkling water</p>
                        <span className="text-gray-500 text-xs ml-2">Dorm rooftop loun...</span>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/content')}
                      className="w-full bg-dark-card backdrop-blur-sm rounded-xl p-3 border border-white/5 hover:border-purple-500/20 transition-all duration-300 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-300 flex-1">za 6 dec: Lounging and listening to music</p>
                        <span className="text-gray-500 text-xs ml-2">Living room couch</span>
                      </div>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/influencers')}
                  className="w-full flex items-center justify-center space-x-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  <span>View Influencers</span>
                  <HiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Account Snapshot - Right */}
            <div className="lg:col-span-1 relative group">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-purple-gradient rounded-2xl opacity-50 blur-xl"></div>
              {/* Glass Card */}
              <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-6 gradient-border-card hover:before:opacity-100 transition-all duration-300">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Account Snapshot
                </h3>
                <h2 className="text-lg font-bold text-white mb-2">
                  Stay on top of usage
                </h2>
                <p className="text-xs text-gray-400 mb-6">
                  Credits, content, and characters at a glance.
                </p>
                
                <div className="space-y-4">
                  {/* Available Credits */}
                  <div className="bg-dark-card backdrop-blur-sm rounded-xl p-4 gradient-border-card hover:before:opacity-100 transition-all duration-300" style={{borderRadius: '0.75rem'}}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Available Credits</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">${typeof displayCredits === 'number' ? displayCredits.toFixed(2) : displayCredits}</span>
                    </div>
                    <button 
                      onClick={() => {
                        alert('Credit purchase feature coming soon! For now, credits are managed automatically.')
                      }}
                      className="w-full mt-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-600/30 text-white text-xs font-medium py-2 px-4 rounded-xl transition-all duration-200"
                    >
                      + Add credits
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Track how many credits remain this cycle.</p>
                  </div>

                  {/* Influencers */}
                  <button
                    onClick={() => navigate('/influencers')}
                    className="w-full bg-dark-card backdrop-blur-sm rounded-xl p-4 gradient-border-card hover:before:opacity-100 transition-all duration-300 text-left"
                    style={{borderRadius: '0.75rem'}}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-sm">Influencers</span>
                      <span className="text-2xl font-bold text-white">{influencersCount}</span>
                    </div>
                    <p className="text-xs text-gray-500">Total influencers created</p>
                  </button>

                  {/* Content Generated */}
                  <button
                    onClick={() => navigate('/content')}
                    className="w-full bg-dark-card backdrop-blur-sm rounded-xl p-4 gradient-border-card hover:before:opacity-100 transition-all duration-300 text-left"
                    style={{borderRadius: '0.75rem'}}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-sm">Content Generated</span>
                      <span className="text-2xl font-bold text-white">{contentGenerated}</span>
                    </div>
                    <p className="text-xs text-gray-500">Completed pieces this workspace created.</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Trends Studio & Advanced Video Modes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trends Studio */}
            <div className="relative group">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-purple-gradient rounded-2xl opacity-50 blur-xl"></div>
              {/* Glass Card */}
              <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-6 gradient-border-card hover:before:opacity-100 transition-all duration-300">
                <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg shadow-purple-600/30">
                  NEW
                </span>
                <h3 className="text-xl font-bold text-white mb-2">Trends Studio</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Generate engaging reels powered by trending motion styles. Choose from our curated library of viral trends or let us pick the perfect style for you.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-dark-card backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full border border-white/5">Viral motion styles</span>
                  <span className="text-xs bg-dark-card backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full border border-white/5">Curated trend library</span>
                  <span className="text-xs bg-dark-card backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full border border-white/5">Professional results</span>
                  <span className="text-xs bg-dark-card backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full border border-white/5">Easy workflow</span>
                </div>
                <button 
                  onClick={() => navigate('/single')}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-600/30 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <span className="text-lg">▷</span>
                  <span>Try Trends Studio</span>
                </button>
              </div>
            </div>

            {/* Advanced Video Modes */}
            <div className="relative group">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-purple-gradient rounded-2xl opacity-50 blur-xl"></div>
              {/* Glass Card */}
              <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-6 gradient-border-card hover:before:opacity-100 transition-all duration-300">
                <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg shadow-purple-600/30">
                  NEW
                </span>
                <h3 className="text-xl font-bold text-white mb-2">Advanced Video Modes</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Create richer reels with Multi-Angle, Pause Challenge, Outfit Changer, Before & After, and Caption.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-dark-card backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full border border-white/5">Multi-Angle</span>
                  <span className="text-xs bg-dark-card backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full border border-white/5">Pause Challenge</span>
                  <span className="text-xs bg-dark-card backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full border border-white/5">Outfit Changer</span>
                  <span className="text-xs bg-dark-card backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full border border-white/5">Before & After</span>
                  <span className="text-xs bg-dark-card backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full border border-white/5">Caption</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => navigate('/single')}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-600/30 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center space-x-2"
                  >
                    <span className="text-lg">▷</span>
                    <span>Try now</span>
                  </button>
                  <button 
                    onClick={() => {
                      alert('Video mode examples coming soon!')
                    }}
                    className="bg-dark-card backdrop-blur-sm hover:bg-dark-card/80 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 border border-white/5 hover:border-purple-500/20"
                  >
                    See examples
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: OnlyFlow+ */}
          <div className="relative group">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-purple-gradient-strong rounded-2xl opacity-60 blur-xl"></div>
            {/* Glass Card */}
            <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/40 transition-all duration-300">
              <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg shadow-purple-600/30">
                OnlyFlow+
              </span>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Introducing OnlyFlow+</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    A premium quality mode for skin-level, human-grade detail and studio-quality realism. Choose OnlyFlow+ to enable advanced rendering for pores, hair, and micro-textures.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400" />
                      <span>Skin-level detail</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400" />
                      <span>Studio-quality finish</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400" />
                      <span>Preserves your creative settings</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400" />
                      <span>No extra cost</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">Available now.</p>
                </div>
                <div className="flex items-end space-x-2">
                  <button 
                    onClick={() => {
                      if (window.confirm('Enable OnlyFlow+ premium mode for this generation? This will use advanced rendering.')) {
                        navigate('/single')
                      }
                    }}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-600/30 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                  >
                    Create with OnlyFlow+
                  </button>
                  <button 
                    onClick={() => {
                      alert('OnlyFlow+ example gallery coming soon!')
                    }}
                    className="bg-dark-card backdrop-blur-sm hover:bg-dark-card/80 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 border border-white/5 hover:border-purple-500/20"
                  >
                    See example
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard

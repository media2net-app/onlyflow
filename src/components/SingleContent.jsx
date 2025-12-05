import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { influencersAPI, aiAPI, generationAPI, contentAPI } from '../services/api'
import { 
  HiOutlineCheckCircle,
  HiOutlineEye,
  HiOutlineRefresh,
  HiOutlineSparkles,
  HiX
} from 'react-icons/hi'
import { HiOutlineShieldCheck } from 'react-icons/hi2'

function SingleContent() {
  const navigate = useNavigate()
  const [influencers, setInfluencers] = useState([])
  const [selectedInfluencer, setSelectedInfluencer] = useState(null)
  const [showInfluencerDropdown, setShowInfluencerDropdown] = useState(false)
  const [activity, setActivity] = useState('')
  const [outfit, setOutfit] = useState('')
  const [location, setLocation] = useState('')
  const [postType, setPostType] = useState('feed')
  const [aspectRatio, setAspectRatio] = useState('2:3')
  const [numberOfPosts, setNumberOfPosts] = useState(4)
  const [quality, setQuality] = useState('standard')
  const [credits, setCredits] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [generationLog, setGenerationLog] = useState([])
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('idle') // idle, generating, completed, error
  const [jobId, setJobId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [influencersRes, creditsRes] = await Promise.all([
          influencersAPI.getAll(),
          aiAPI.getCredits().catch(() => ({ success: false, data: { credits: 9.95 } }))
        ])
        setInfluencers(influencersRes.data || [])
        if (influencersRes.data && influencersRes.data.length > 0) {
          const firstInfluencer = influencersRes.data[0]
          setSelectedInfluencer(firstInfluencer)
          // Load plan defaults if available
          if (firstInfluencer.activities && firstInfluencer.activities.length > 0) {
            setActivity(firstInfluencer.activities[0])
          }
          if (firstInfluencer.settings && firstInfluencer.settings.length > 0) {
            setLocation(firstInfluencer.settings[0])
          }
        }
        if (creditsRes.success && creditsRes.data.credits !== null) {
          setCredits(creditsRes.data.credits)
        } else {
          setCredits(9.95)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const calculateCredits = () => {
    // $0.01 per image, multiply by number of posts
    return numberOfPosts * 0.01
  }

  const handleResetToPlan = () => {
    if (selectedInfluencer) {
      if (selectedInfluencer.activities && selectedInfluencer.activities.length > 0) {
        setActivity(selectedInfluencer.activities[0])
      }
      if (selectedInfluencer.settings && selectedInfluencer.settings.length > 0) {
        setLocation(selectedInfluencer.settings[0])
      }
    }
  }

  const handleRandomize = () => {
    const activities = [
      'Sipping a glass of wine',
      'Unwinding at sunset and sipping sparkling water',
      'Lounging and listening to music',
      'Getting ready for the evening',
      'Enjoying a coffee break',
      'Stretching in the morning',
      'Reading a book in bed',
      'Taking a bubble bath',
      'Doing yoga on the floor',
      'Cooking in the kitchen',
      'Dancing to music',
      'Applying makeup in front of mirror',
      'Working out at home',
      'Relaxing on the balcony',
      'Getting dressed for a night out',
      'Sunbathing by the pool',
      'Having breakfast in bed',
      'Doing skincare routine',
      'Trying on new clothes',
      'Posing for photos'
    ]
    
    const outfits = [
      'Revealing red mini dress',
      'Lace lingerie set',
      'Silk slip dress',
      'Crop top and high-waisted shorts',
      'Bodycon dress',
      'See-through mesh top with jeans',
      'Bikini and sarong',
      'Tight workout leggings and sports bra',
      'Off-shoulder sweater',
      'Low-cut blouse with skirt',
      'Bodysuit with leather pants',
      'Sheer blouse',
      'Corset top with mini skirt',
      'Tank top and yoga pants',
      'Backless dress',
      'Lace bralette and shorts',
      'Tight midi dress',
      'Crop top and low-rise jeans',
      'Silk camisole and panties',
      'Form-fitting jumpsuit'
    ]
    
    const locations = [
      'Upscale Italian restaurant at night',
      'Dorm rooftop lounge',
      'Living room couch',
      'Beach at sunset',
      'City rooftop bar',
      'Luxury hotel room',
      'Bedroom with soft lighting',
      'Modern apartment balcony',
      'Spa bathroom with candles',
      'Boutique hotel suite',
      'Beachfront villa',
      'Rooftop pool area',
      'Cozy bedroom with fairy lights',
      'Luxury penthouse',
      'Beach cabana',
      'Modern kitchen island',
      'Hotel room with city view',
      'Private pool area',
      'Boudoir-style bedroom',
      'Luxury resort suite'
    ]
    
    // Randomly select one from each array
    setActivity(activities[Math.floor(Math.random() * activities.length)])
    setOutfit(outfits[Math.floor(Math.random() * outfits.length)])
    setLocation(locations[Math.floor(Math.random() * locations.length)])
  }

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setGenerationLog(prev => [...prev, { message, type, timestamp }])
  }

  const pollGenerationStatus = async (jobId, totalPosts) => {
    let lastCount = 0
    let attempts = 0
    const maxAttempts = 300 // 5 minutes max (300 * 2 seconds = 10 minutes)
    let baselineCount = 0 // Declare outside try-catch so it's available in poll function
    
    // Get baseline count before generation
    try {
      const baselineRes = await contentAPI.getAll()
      const baselineContent = baselineRes.data || []
      baselineCount = baselineContent.filter(item => 
        item.influencerId === selectedInfluencer.id && 
        item.type === (postType === 'feed' ? 'feed_post' : postType)
      ).length
      lastCount = baselineCount
      addLog(`Baseline: ${baselineCount} existing ${postType} posts`, 'info')
    } catch (err) {
      console.warn('Could not get baseline count:', err)
      addLog(`⚠️ Could not get baseline count, starting from 0`, 'warning')
      baselineCount = 0
      lastCount = 0
    }
    
    const poll = async () => {
      attempts++
      
      try {
        // Check content API to see how many new items were added
        const contentRes = await contentAPI.getAll()
        const allContent = contentRes.data || []
        
        // Filter content for this influencer and post type
        const relevantContent = allContent.filter(item => 
          item.influencerId === selectedInfluencer.id && 
          item.type === (postType === 'feed' ? 'feed_post' : postType)
        )
        
        const currentCount = relevantContent.length
        const newItems = currentCount - lastCount
        
        if (newItems > 0) {
          addLog(`✅ Generated ${newItems} new image${newItems > 1 ? 's' : ''} (${currentCount - baselineCount}/${totalPosts} total)`, 'success')
          lastCount = currentCount
        }
        
        const completed = currentCount - baselineCount
        const progress = Math.min((completed / totalPosts) * 100, 95) // Cap at 95% until all done
        setGenerationProgress(progress)
        
        if (completed < totalPosts) {
          if (attempts % 5 === 0) { // Log every 5th attempt to avoid spam
            addLog(`Waiting for images... (${completed}/${totalPosts} completed)`, 'info')
          }
          
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000) // Poll every 2 seconds
          } else {
            addLog('⚠️ Generation timeout reached. Some images may still be processing.', 'warning')
            setGenerationStatus('completed') // Still mark as completed if we got some images
            setGenerating(false)
            setTimeout(() => {
              navigate('/content')
            }, 2000)
          }
        } else {
          // All done!
          setGenerationProgress(100)
          addLog(`✅ Successfully generated ${totalPosts} ${postType} post${totalPosts > 1 ? 's' : ''}!`, 'success')
          setGenerationStatus('completed')
          setGenerating(false)
          
          // Refresh credits
          try {
            const creditsRes = await aiAPI.getCredits()
            if (creditsRes.success && creditsRes.data.credits !== null) {
              setCredits(creditsRes.data.credits)
            }
          } catch (err) {
            console.warn('Failed to refresh credits:', err)
          }
          
          // Navigate to Generated Content after 2 seconds
          setTimeout(() => {
            navigate('/content')
          }, 2000)
        }
      } catch (error) {
        console.error('Error polling status:', error)
        addLog(`⚠️ Error checking status: ${error.message}`, 'warning')
        
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000) // Retry after 3 seconds
        } else {
          addLog('❌ Failed to complete generation check', 'error')
          setGenerationStatus('error')
          setGenerating(false)
        }
      }
    }
    
    // Start polling after initial delay
    setTimeout(poll, 3000)
  }

  const handleGenerate = async () => {
    if (!selectedInfluencer) {
      alert('Please select an influencer')
      return
    }

    if (!activity || !outfit || !location) {
      alert('Please fill in all content brief fields')
      return
    }

    if (credits < calculateCredits()) {
      alert(`Insufficient credits. You need $${calculateCredits().toFixed(2)} but only have $${credits.toFixed(2)}`)
      return
    }

    // Reset modal state
    setShowModal(true)
    setGenerating(true)
    setGenerationStatus('generating')
    setGenerationLog([])
    setGenerationProgress(0)
    
    addLog(`Starting generation of ${numberOfPosts} ${postType} post${numberOfPosts > 1 ? 's' : ''}...`, 'info')
    addLog(`Influencer: ${selectedInfluencer.name}`, 'info')
    addLog(`Brief: ${activity}, wearing ${outfit}, at ${location}`, 'info')
    
    try {
      // Call generation API
      const data = await generationAPI.generate({
        influencerId: selectedInfluencer.id,
        type: postType,
        activity: activity,
        outfit: outfit,
        location: location,
        aspectRatio: aspectRatio,
        numberOfPosts: numberOfPosts,
        quality: quality
      })

      setJobId(data.jobId)
      addLog(`✅ Generation job started (ID: ${data.jobId})`, 'success')
      addLog('Generating images in background...', 'info')
      
      // Start polling for status
      pollGenerationStatus(data.jobId, numberOfPosts)
      
    } catch (error) {
      console.error('Error generating content:', error)
      addLog(`❌ Error: ${error.message || 'Failed to generate content'}`, 'error')
      setGenerationStatus('error')
      setGenerating(false)
    }
  }

  const briefStatus = activity && outfit && location ? 'ready' : 'incomplete'
  const creditsEstimate = calculateCredits()

  return (
    <div className="min-h-screen bg-dark-bg flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />

        <div className="flex-1 p-6 space-y-6">
          {/* Single Content Lab - Top Card */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-6 border border-gray-800/50">
            <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
              Single Content Lab
            </h3>
            <h2 className="text-2xl font-bold text-white mb-2">
              Craft your next release
            </h2>
            <p className="text-sm text-white/90 mb-6">
              Launch feed posts, stories, or reels - all from the same generator pipeline you control.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Selected Influencer */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Selected Influencer</p>
                <p className="text-sm font-semibold text-white">{selectedInfluencer?.name || 'None'}</p>
                <p className="text-xs text-white/70">Plan defaults auto-loaded</p>
              </div>
              
              {/* Brief Status */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Brief Status</p>
                <p className={`text-sm font-semibold ${briefStatus === 'ready' ? 'text-green-300' : 'text-yellow-300'}`}>
                  {briefStatus === 'ready' ? 'Ready to launch' : 'Incomplete'}
                </p>
                <p className="text-xs text-white/70">
                  {briefStatus === 'ready' ? 'All fields locked in' : 'Fill in all fields'}
                </p>
              </div>
              
              {/* Credits Estimate */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Credits Estimate</p>
                <p className="text-sm font-semibold text-white">{creditsEstimate.toFixed(0)}</p>
                <p className="text-xs text-white/70">Based on quantity + mode</p>
              </div>
            </div>
          </div>

          {/* Workflow Section */}
          <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Workflow</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>1. Choose your influencer and confirm their status.</p>
              <p>2. Craft the brief (or pull from today's plan) and decide the post type.</p>
              <p>3. Lock in quality + reels mode, preview credits, then launch.</p>
            </div>
          </div>

          {/* Influencer Section */}
          <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-2">Influencer</h3>
            <p className="text-sm text-gray-400 mb-4">Loads today's plan defaults automatically.</p>
            
            <div className="relative">
              {/* Dropdown Button */}
              <button
                type="button"
                onClick={() => setShowInfluencerDropdown(!showInfluencerDropdown)}
                className="w-full bg-dark-card border border-gray-800/30 rounded-lg px-4 py-3 text-left flex items-center space-x-3 hover:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              >
                {selectedInfluencer ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-purple-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {selectedInfluencer.imageUrl ? (
                        <img 
                          src={selectedInfluencer.imageUrl.startsWith('http') 
                            ? selectedInfluencer.imageUrl 
                            : `http://localhost:3001${selectedInfluencer.imageUrl}`} 
                          alt={selectedInfluencer.name}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <span className="text-white font-bold">{selectedInfluencer.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{selectedInfluencer.name}</p>
                      <p className="text-xs text-gray-400 truncate">{selectedInfluencer.description || 'Content Creator'}</p>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${showInfluencerDropdown ? 'transform rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                ) : (
                  <span className="text-gray-500">Select an influencer...</span>
                )}
              </button>

              {/* Dropdown Menu */}
              {showInfluencerDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowInfluencerDropdown(false)}
                  ></div>
                  <div className="absolute z-20 mt-2 w-full bg-dark-card border border-gray-800/30 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {influencers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400">No influencers available</div>
                    ) : (
                      influencers.map((influencer) => (
                        <button
                          key={influencer.id}
                          type="button"
                          onClick={() => {
                            setSelectedInfluencer(influencer)
                            setShowInfluencerDropdown(false)
                            // Load plan defaults
                            if (influencer.activities && influencer.activities.length > 0) {
                              setActivity(influencer.activities[0])
                            }
                            if (influencer.settings && influencer.settings.length > 0) {
                              setLocation(influencer.settings[0])
                            }
                          }}
                          className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-800/50 transition-colors ${
                            selectedInfluencer?.id === influencer.id ? 'bg-purple-500/20' : ''
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-purple-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {influencer.imageUrl ? (
                              <img 
                                src={influencer.imageUrl.startsWith('http') 
                                  ? influencer.imageUrl 
                                  : `http://localhost:3001${influencer.imageUrl}`} 
                                alt={influencer.name}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <span className="text-white font-bold">{influencer.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm text-white font-medium truncate">{influencer.name}</p>
                            <p className="text-xs text-gray-400 truncate">{influencer.description || 'Content Creator'}</p>
                          </div>
                          {selectedInfluencer?.id === influencer.id && (
                            <HiOutlineCheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
            
            {selectedInfluencer && (
              <div className="mt-4 flex items-center space-x-3 bg-dark-card rounded-lg p-3 border border-gray-800/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-purple-300 flex items-center justify-center overflow-hidden relative">
                  {selectedInfluencer.imageUrl ? (
                    <img 
                      src={selectedInfluencer.imageUrl.startsWith('http') 
                        ? selectedInfluencer.imageUrl 
                        : `http://localhost:3001${selectedInfluencer.imageUrl}`} 
                      alt={selectedInfluencer.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <span className="text-white font-bold">{selectedInfluencer.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{selectedInfluencer.description || 'Content Creator'}</p>
                  <p className="text-xs text-green-400">Ready</p>
                </div>
              </div>
            )}
            
            {selectedInfluencer && (activity || outfit || location) && (
              <div className="mt-4 p-3 bg-dark-card rounded-lg border border-gray-800/30">
                <p className="text-xs text-gray-400">
                  {activity && `${activity} • `}
                  {outfit && `${outfit} • `}
                  {location}
                </p>
              </div>
            )}
          </div>

          {/* Content Brief Section */}
          <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-2">Content brief</h3>
            <p className="text-sm text-gray-400 mb-4">Fill in exactly what you want today's drop to cover.</p>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Activity</label>
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="Sipping a glass of wine"
                  className="w-full bg-dark-card border border-gray-800/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Outfit</label>
                <input
                  type="text"
                  value={outfit}
                  onChange={(e) => setOutfit(e.target.value)}
                  placeholder="Revealing red mini dress"
                  className="w-full bg-dark-card border border-gray-800/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Upscale Italian restaurant at night"
                  className="w-full bg-dark-card border border-gray-800/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleResetToPlan}
                className="px-4 py-2 bg-dark-card hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-800/30 flex items-center space-x-2"
              >
                <HiOutlineRefresh className="w-4 h-4" />
                <span>Reset to plan</span>
              </button>
              <button
                onClick={handleRandomize}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                <HiOutlineSparkles className="w-4 h-4" />
                <span>Randomize</span>
              </button>
            </div>
          </div>

          {/* Post Type Section */}
          <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Post Type</h3>
            <div className="flex flex-wrap gap-2">
              {['feed', 'story', 'reel', 'slideshow'].map((type) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    postType === type
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                      : 'bg-dark-card border border-gray-800/30 text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Section */}
          <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Aspect Ratio</h3>
            <div className="flex flex-wrap gap-2">
              {['1:1', '2:3', '16:9'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                      : 'bg-dark-card border border-gray-800/30 text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Posts Section */}
          <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Number of Posts</h3>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={numberOfPosts}
                onChange={(e) => setNumberOfPosts(parseInt(e.target.value))}
                className="flex-1 h-2 bg-dark-card rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="text-xl font-bold text-white w-12 text-right">{numberOfPosts}</span>
            </div>
          </div>

          {/* Quality Section */}
          <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Quality</h3>
            <div className="space-y-2">
              <button
                onClick={() => setQuality('standard')}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  quality === 'standard'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                    : 'bg-dark-card border border-gray-800/30 text-gray-400 hover:text-white'
                }`}
              >
                STANDARD
              </button>
              <button
                onClick={() => setQuality('onlyflow+')}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  quality === 'onlyflow+'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                    : 'bg-dark-card border border-gray-800/30 text-gray-400 hover:text-white'
                }`}
              >
                OnlyFlow+
              </button>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-dark-surface rounded-lg p-4 border border-gray-800/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Credits:</span>
              <span className="text-lg font-bold text-white">${creditsEstimate.toFixed(2)}</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || briefStatus !== 'ready'}
              className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <HiOutlineSparkles className="w-5 h-5" />
              <span>{generating ? 'Generating...' : 'Generate Now'}</span>
            </button>
          </div>

          {/* Bottom Info Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SFW Reminder */}
            <div className="bg-dark-surface rounded-lg p-4 border border-gray-800/50">
              <div className="flex items-start space-x-3">
                <HiOutlineShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-white font-medium mb-1">SFW reminder</p>
                  <p className="text-xs text-gray-400">
                    We only allow safe-for-work content. Keep it tasteful, no nudity, and double-check prompts before you hit generate.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Review Your Output */}
            <div className="bg-dark-surface rounded-lg p-4 border border-gray-800/50">
              <div className="flex items-start space-x-3">
                <HiOutlineEye className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-white font-medium mb-1">Review your output</p>
                  <p className="text-xs text-gray-400 mb-2">
                    Every manual drop lands in the Generated Content inbox.
                  </p>
                  <Link
                    to="/content"
                    className="inline-flex items-center space-x-1 text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    <span>Open generated library</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-surface rounded-lg border border-gray-800/50 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
              <div>
                <h3 className="text-xl font-semibold text-white">Generating Content</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {generationStatus === 'generating' && `Progress: ${generationProgress.toFixed(0)}%`}
                  {generationStatus === 'completed' && 'Generation completed!'}
                  {generationStatus === 'error' && 'Generation failed'}
                </p>
              </div>
              {generationStatus !== 'generating' && (
                <button
                  onClick={() => {
                    setShowModal(false)
                    if (generationStatus === 'completed') {
                      navigate('/content')
                    }
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <HiX className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {generationStatus === 'generating' && (
              <div className="px-6 pt-4">
                <div className="w-full bg-dark-card rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Log Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {generationLog.length === 0 ? (
                  <p className="text-gray-400 text-sm">Initializing...</p>
                ) : (
                  generationLog.map((log, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start space-x-3 text-sm ${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'warning' ? 'text-yellow-400' :
                        'text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500 text-xs mt-0.5 min-w-[60px]">{log.timestamp}</span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-800/50 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {generationStatus === 'generating' && 'Please wait while images are being generated...'}
                {generationStatus === 'completed' && 'Redirecting to Generated Content...'}
                {generationStatus === 'error' && 'An error occurred during generation'}
              </div>
              {generationStatus === 'completed' && (
                <button
                  onClick={() => {
                    setShowModal(false)
                    navigate('/content')
                  }}
                  className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
                >
                  View Generated Content
                </button>
              )}
              {generationStatus === 'error' && (
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-dark-card hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors border border-gray-800/30"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SingleContent


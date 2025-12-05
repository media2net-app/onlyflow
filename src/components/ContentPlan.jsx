import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { influencersAPI, generationAPI, aiAPI, contentAPI } from '../services/api'
import { 
  HiX,
  HiOutlinePencil,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiChevronRight
} from 'react-icons/hi'

function ContentPlan() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const influencerId = searchParams.get('influencerId')
  
  const [influencer, setInfluencer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(null)
  const [generating, setGenerating] = useState({}) // Track generation per day
  const [generationProgress, setGenerationProgress] = useState({})
  const [generationLog, setGenerationLog] = useState({})
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [currentGeneratingDay, setCurrentGeneratingDay] = useState(null)
  
  // Daily content plans
  const [dailyPlans, setDailyPlans] = useState({})
  // Generated content per day
  const [generatedContent, setGeneratedContent] = useState({})
  
  // Get dates for next 7 days
  const getDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push({
        date: date,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      })
    }
    return dates
  }
  
  const dates = getDates()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (influencerId) {
          const [influencerRes, creditsRes, contentRes] = await Promise.all([
            influencersAPI.getById(influencerId),
            aiAPI.getCredits().catch(() => ({ success: false, data: { credits: 9.95 } })),
            contentAPI.getByInfluencer(influencerId).catch(() => ({ success: false, data: [] }))
          ])
          
          if (influencerRes.success && influencerRes.data) {
            setInfluencer(influencerRes.data)
            
            // Load existing generated content
            if (contentRes.success && contentRes.data) {
              const feedPosts = (contentRes.data || []).filter(c => c && c.type === 'feed_post')
              const contentByDate = {}
              
              // Group content by date - use most recent for each day
              feedPosts.forEach(content => {
                const contentDate = new Date(content.createdAt).toISOString().split('T')[0]
                const today = new Date().toISOString().split('T')[0]
                
                // For today, use the most recent content
                if (contentDate === today) {
                  if (!contentByDate[today] || new Date(content.createdAt) > new Date(contentByDate[today].createdAt)) {
                    contentByDate[today] = content
                  }
                }
              })
              
              setGeneratedContent(contentByDate)
              console.log('✅ Loaded existing content:', contentByDate)
              console.log('📅 Today date:', today)
              console.log('📦 Feed posts found:', feedPosts.length)
              feedPosts.forEach(post => {
                const postDate = new Date(post.createdAt).toISOString().split('T')[0]
                console.log(`  - Post ID ${post.id}, date: ${postDate}, url: ${post.url}`)
              })
            }
            
            // Initialize daily plans with random content if not exists
            const plans = {}
            dates.forEach(({ date, label }) => {
              const dateKey = date.toISOString().split('T')[0]
              const today = new Date().toISOString().split('T')[0]
              const hasContent = contentRes.success && contentRes.data && 
                contentRes.data.some(c => {
                  const contentDate = new Date(c.createdAt).toISOString().split('T')[0]
                  return contentDate === dateKey && c.type === 'feed_post'
                })
              
              if (!dailyPlans[dateKey]) {
                plans[dateKey] = {
                  activity: generateRandomActivity(influencerRes.data),
                  outfit: generateRandomOutfit(influencerRes.data),
                  location: generateRandomLocation(influencerRes.data),
                  generated: hasContent
                }
              }
            })
            if (Object.keys(plans).length > 0) {
              setDailyPlans(prev => ({ ...prev, ...plans }))
            }
          }
          
          if (creditsRes.success && creditsRes.data.credits !== null) {
            setCredits(creditsRes.data.credits)
          } else {
            setCredits(9.95)
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [influencerId])

  const generateRandomActivity = (inf) => {
    const activities = inf?.activities || []
    if (activities.length > 0) {
      return activities[Math.floor(Math.random() * activities.length)]
    }
    const defaults = [
      'Unwinding at sunset and sipping sparkling water',
      'Lounging and listening to music',
      'Working out at the gym',
      'Exploring the city',
      'Reading a book at a café'
    ]
    return defaults[Math.floor(Math.random() * defaults.length)]
  }

  const generateRandomOutfit = (inf) => {
    const styles = inf?.clothingStyles || []
    const defaults = [
      'Strappy red bralette and high-waisted bikini bottom with a cropped athletic varsity jacket',
      'Casual denim jacket with white t-shirt and jeans',
      'Elegant black dress with heels',
      'Sporty athleisure set',
      'Professional blazer with trousers'
    ]
    return defaults[Math.floor(Math.random() * defaults.length)]
  }

  const generateRandomLocation = (inf) => {
    const settings = inf?.settings || []
    if (settings.length > 0) {
      return settings[Math.floor(Math.random() * settings.length)]
    }
    const defaults = [
      'Dorm rooftop lounge',
      'Modern coffee shop',
      'Urban park',
      'Beachfront',
      'City center'
    ]
    return defaults[Math.floor(Math.random() * defaults.length)]
  }

  const handleGenerateDay = async (dateKey, label) => {
    if (!influencer) return
    
    const plan = dailyPlans[dateKey]
    if (!plan || !plan.activity || !plan.outfit || !plan.location) {
      alert('Please fill in Activity, Outfit, and Location for this day')
      return
    }

    if (credits < 0.01) {
      alert(`Insufficient credits. You need $0.01 but only have $${credits.toFixed(2)}`)
      return
    }

    setGenerating(prev => ({ ...prev, [dateKey]: true }))
    setCurrentGeneratingDay(label)
    setShowGenerationModal(true)
    setGenerationProgress(prev => ({ ...prev, [dateKey]: 0 }))
    setGenerationLog(prev => ({ ...prev, [dateKey]: [] }))
    
    const addLog = (message, type = 'info') => {
      setGenerationLog(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), { message, type, timestamp: new Date() }]
      }))
    }

    addLog(`Starting generation for ${label}...`, 'info')
    addLog(`Brief: ${plan.activity}, wearing ${plan.outfit}, at ${plan.location}`, 'info')

    try {
      const data = await generationAPI.generate({
        influencerId: influencer.id,
        type: 'feed',
        activity: plan.activity,
        outfit: plan.outfit,
        location: plan.location,
        aspectRatio: '2:3',
        numberOfPosts: 1,
        quality: 'standard'
      })

      addLog(`✅ Generation job started (ID: ${data.jobId})`, 'success')
      addLog('Generating image in background...', 'info')
      
      // Poll for completion - check for new content
      let attempts = 0
      const maxAttempts = 60
      let baselineContentCount = 0
      
      // Get baseline content count
      try {
        const baselineRes = await contentAPI.getByInfluencer(influencer.id)
        if (baselineRes.success) {
          baselineContentCount = (baselineRes.data || []).filter(c => c && c.type === 'feed_post').length
        }
      } catch (err) {
        console.error('Error getting baseline content:', err)
      }
      
      const poll = async () => {
        attempts++
        const progress = Math.min(10 + (attempts / maxAttempts) * 85, 95)
        setGenerationProgress(prev => ({ ...prev, [dateKey]: progress }))
        
        try {
          const contentRes = await contentAPI.getByInfluencer(influencer.id)
          if (contentRes.success) {
            const feedPosts = (contentRes.data || []).filter(c => c && c.type === 'feed_post')
            const currentCount = feedPosts.length
            
            // Check if new content was created
            if (currentCount > baselineContentCount) {
              // New content found!
              const newContent = feedPosts
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, currentCount - baselineContentCount)
              
              if (newContent.length > 0) {
                const latestContent = newContent[0]
                addLog('✅ Generation completed!', 'success')
                setGenerationProgress(prev => ({ ...prev, [dateKey]: 100 }))
                setDailyPlans(prev => ({
                  ...prev,
                  [dateKey]: { ...prev[dateKey], generated: true }
                }))
                
                // Store generated content for this day
                setGeneratedContent(prev => ({
                  ...prev,
                  [dateKey]: latestContent
                }))
                
                setGenerating(prev => ({ ...prev, [dateKey]: false }))
                
                // Auto-close modal after 1.5 seconds
                setTimeout(() => {
                  setShowGenerationModal(false)
                  setCurrentGeneratingDay(null)
                }, 1500)
                return
              }
            }
            
            // Log progress
            if (attempts % 5 === 0) {
              addLog(`Waiting for image... (${attempts}/${maxAttempts})`, 'info')
            }
          }
          
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000)
          } else {
            addLog('⚠️ Generation timeout. Image may still be processing.', 'warning')
            setGenerating(prev => ({ ...prev, [dateKey]: false }))
            setTimeout(() => {
              setShowGenerationModal(false)
              setCurrentGeneratingDay(null)
            }, 2000)
          }
        } catch (err) {
          console.error('Error polling:', err)
          if (attempts < maxAttempts) {
            setTimeout(poll, 3000)
          }
        }
      }
      
      setTimeout(poll, 3000)
      
    } catch (error) {
      console.error('Error generating content:', error)
      addLog(`❌ Error: ${error.message || 'Failed to generate content'}`, 'error')
      setGenerating(prev => ({ ...prev, [dateKey]: false }))
    }
  }

  const handleEditField = (dateKey, field, value) => {
    setDailyPlans(prev => {
      const currentPlan = prev[dateKey] || {
        activity: '',
        outfit: '',
        location: '',
        generated: false
      }
      return {
        ...prev,
        [dateKey]: {
          ...currentPlan,
          [field]: value
        }
      }
    })
  }

  const trainingStatus = influencer?.trainingProgress >= 100 ? 'Ready' : 
                        influencer?.trainingProgress >= 50 ? 'In Progress' : 'Not Started'

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-white">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-dark-bg flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-white">Influencer not found</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Content Plan Modal */}
          <div className="max-w-4xl mx-auto bg-dark-surface rounded-2xl p-8 border border-gray-800/50 relative">
            {/* Close Button */}
            <button
              onClick={() => navigate('/influencers')}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
            >
              <HiX className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{influencer.name}</h1>
                <p className="text-gray-400">Content Plan</p>
              </div>
              <Link
                to={`/influencers/train?edit=${influencer.id}`}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                <span>Adjust influencer settings</span>
                <HiChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Training Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Training Status</span>
                <span className={`text-sm font-medium ${
                  trainingStatus === 'Ready' ? 'text-green-400' : 
                  trainingStatus === 'In Progress' ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {trainingStatus}
                </span>
              </div>
            </div>

            {/* SFW Warning */}
            <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-start space-x-3">
              <HiOutlineShieldCheck className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-200">
                We only allow SFW (Safe For Work) content. Please ensure all generated content is appropriate for all audiences.
              </p>
            </div>

            {/* Daily Plans */}
            <div className="space-y-6">
              {dates.map(({ date, label }) => {
                const dateKey = date.toISOString().split('T')[0]
                const plan = dailyPlans[dateKey] || {
                  activity: '',
                  outfit: '',
                  location: '',
                  generated: false
                }
                const isGenerating = generating[dateKey]
                const progress = generationProgress[dateKey] || 0

                return (
                  <div key={dateKey} className="bg-dark-card/50 rounded-lg p-6 border border-gray-800/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{label}</h3>
                      {plan.generated && (
                        <div className="flex items-center space-x-2 text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                          <HiOutlineCheckCircle className="w-4 h-4 text-green-400" />
                          <span>Already Generated</span>
                        </div>
                      )}
                    </div>

                    {/* Generated Image Preview */}
                    {generatedContent[dateKey] && (
                      <div className="mb-4 rounded-lg overflow-hidden border border-gray-800/30">
                        <img 
                          src={generatedContent[dateKey].url.startsWith('http') 
                            ? generatedContent[dateKey].url 
                            : `http://localhost:3001${generatedContent[dateKey].url}`}
                          alt={`Generated content for ${label}`}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Activity */}
                      <div className="bg-dark-surface rounded-lg p-4 border border-gray-800/30 relative group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">⚡</span>
                              <span className="text-xs text-gray-400 uppercase">Activity</span>
                            </div>
                            <input
                              type="text"
                              placeholder="Enter activity..."
                              value={plan.activity || ''}
                              onChange={(e) => handleEditField(dateKey, 'activity', e.target.value)}
                              className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newValue = prompt('Edit Activity:', plan.activity || '')
                              if (newValue !== null) {
                                handleEditField(dateKey, 'activity', newValue)
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Outfit */}
                      <div className="bg-dark-surface rounded-lg p-4 border border-gray-800/30 relative group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">👤</span>
                              <span className="text-xs text-gray-400 uppercase">Outfit</span>
                            </div>
                            <input
                              type="text"
                              placeholder="Enter outfit..."
                              value={plan.outfit || ''}
                              onChange={(e) => handleEditField(dateKey, 'outfit', e.target.value)}
                              className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newValue = prompt('Edit Outfit:', plan.outfit || '')
                              if (newValue !== null) {
                                handleEditField(dateKey, 'outfit', newValue)
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="bg-dark-surface rounded-lg p-4 border border-gray-800/30 relative group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">📍</span>
                              <span className="text-xs text-gray-400 uppercase">Location</span>
                            </div>
                            <input
                              type="text"
                              placeholder="Enter location..."
                              value={plan.location || ''}
                              onChange={(e) => handleEditField(dateKey, 'location', e.target.value)}
                              className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newValue = prompt('Edit Location:', plan.location || '')
                              if (newValue !== null) {
                                handleEditField(dateKey, 'location', newValue)
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Generate Button */}
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          console.log('Generate button clicked for', label, 'Plan:', plan)
                          handleGenerateDay(dateKey, label)
                        }}
                        disabled={isGenerating || !plan?.activity?.trim() || !plan?.outfit?.trim() || !plan?.location?.trim()}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating... {Math.round(progress)}%</span>
                          </>
                        ) : (
                          <>
                            <HiOutlineSparkles className="w-5 h-5" />
                            <span>Generate Content</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Generation Progress Modal */}
      {showGenerationModal && currentGeneratingDay && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-surface rounded-2xl p-8 max-w-md w-full border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">
              Generating Content for {currentGeneratingDay}
            </h3>
            
            {Object.entries(generationLog).map(([key, logs]) => {
              if (dates.find(d => d.date.toISOString().split('T')[0] === key)?.label === currentGeneratingDay) {
                return (
                  <div key={key} className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {logs.map((log, idx) => (
                      <div key={idx} className={`text-sm ${
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'warning' ? 'text-yellow-400' :
                        'text-gray-300'
                      }`}>
                        {log.message}
                      </div>
                    ))}
                  </div>
                )
              }
              return null
            })}

            {Object.entries(generationProgress).map(([key, prog]) => {
              const dayLabel = dates.find(d => d.date.toISOString().split('T')[0] === key)?.label
              if (dayLabel === currentGeneratingDay) {
                return (
                  <div key={key} className="mb-4">
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${prog}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2 text-center">{Math.round(prog)}%</p>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentPlan


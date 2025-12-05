import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { aiAPI, influencersAPI, contentAPI } from '../services/api'
import { 
  HiChevronLeft, 
  HiChevronRight,
  HiCheckCircle,
  HiOutlineCheckCircle,
  HiPlus,
  HiMinus,
  HiOutlinePlay,
  HiOutlineSparkles,
  HiOutlineCloudUpload,
  HiOutlineRefresh,
  HiOutlineEye,
  HiX
} from 'react-icons/hi'

function Influencers() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditMode = !!editId
  
  const [step, setStep] = useState(1)
  const [influencerName, setInfluencerName] = useState('')
  const [description, setDescription] = useState('')
  const [gender, setGender] = useState('Female')
  const [age, setAge] = useState(24)
  const [location, setLocation] = useState('')
  const [hairColor, setHairColor] = useState('')
  const [activities, setActivities] = useState([])
  const [settings, setSettings] = useState([])
  const [additionalInfo, setAdditionalInfo] = useState([])
  const [selectedStyles, setSelectedStyles] = useState([])
  const [feedPosts, setFeedPosts] = useState(0)
  const [storyPosts, setStoryPosts] = useState(0)
  const [newActivity, setNewActivity] = useState('')
  const [newSetting, setNewSetting] = useState('')
  const [newInfo, setNewInfo] = useState('')
  const [generating, setGenerating] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState(null)
  const [trainingImages, setTrainingImages] = useState([])
  const [currentInfluencerId, setCurrentInfluencerId] = useState(editId ? parseInt(editId) : null)
  const [loading, setLoading] = useState(isEditMode)
  const [generatedContent, setGeneratedContent] = useState([])
  const [error, setError] = useState(null)
  const [trainingImageMethod, setTrainingImageMethod] = useState(null) // 'ai' or 'upload'
  const [uploadingImages, setUploadingImages] = useState(false)
  const [styleModalOpen, setStyleModalOpen] = useState(false)
  const [selectedStyleForModal, setSelectedStyleForModal] = useState(null)
  const [generatingStyleImages, setGeneratingStyleImages] = useState(false)
  const [uploadingStyleImages, setUploadingStyleImages] = useState(false)
  const [trainingImageModalOpen, setTrainingImageModalOpen] = useState(false)
  const [selectedTrainingImage, setSelectedTrainingImage] = useState(null) // {content object}
  const [regeneratingTrainingImage, setRegeneratingTrainingImage] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [showPromptPreview, setShowPromptPreview] = useState(false)
  const [previewPrompts, setPreviewPrompts] = useState([])
  const [usingEmilyStrategy, setUsingEmilyStrategy] = useState(false)
  const [generatingProfile, setGeneratingProfile] = useState(false)
  const trainingImagePollIntervalRef = useRef(null) // Store polling interval to prevent multiple instances
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('idle') // idle, generating, completed, error
  const [generationLog, setGenerationLog] = useState([])
  const [generationTitle, setGenerationTitle] = useState('Generating...')
  const [showProfileImageModal, setShowProfileImageModal] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'saving', 'saved', 'error'
  const [saveTimeout, setSaveTimeout] = useState(null)
  const step4Ref = useRef(null) // Ref for Step 4 to maintain scroll position

  // Load influencer data when in edit mode
  useEffect(() => {
    const loadInfluencerData = async () => {
      if (!isEditMode || !editId) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        console.log('Loading influencer with ID:', editId)
        
        const [influencerRes, contentRes] = await Promise.all([
          influencersAPI.getById(editId).catch(err => {
            console.error('Error fetching influencer:', err)
            return { success: false, error: err.message }
          }),
          contentAPI.getByInfluencer(editId).catch(err => {
            console.error('Error fetching content:', err)
            return { success: false, error: err.message, data: [] }
          })
        ])
        
        console.log('Influencer response:', influencerRes)
        console.log('Content response:', contentRes)
        
        let influencerData = null
        
        if (influencerRes.success && influencerRes.data) {
          influencerData = influencerRes.data
          setCurrentInfluencerId(influencerData.id)
          setInfluencerName(influencerData.name || '')
          setDescription(influencerData.description || '')
          setGender(influencerData.gender || 'Female')
          setAge(influencerData.age || 24)
          setLocation(influencerData.location || '')
          setHairColor(influencerData.hairColor || '')
          setActivities(Array.isArray(influencerData.activities) ? influencerData.activities : [])
          setSettings(Array.isArray(influencerData.settings) ? influencerData.settings : [])
          setAdditionalInfo(Array.isArray(influencerData.additionalInfo) ? influencerData.additionalInfo : [])
          setSelectedStyles(Array.isArray(influencerData.clothingStyles) ? influencerData.clothingStyles : (Array.isArray(influencerData.stylesChosen) ? influencerData.stylesChosen : []))
          setFeedPosts(influencerData.feedPosts || 0)
          setStoryPosts(influencerData.storyPosts || 0)
          
          if (influencerData.imageUrl) {
            const fullImageUrl = influencerData.imageUrl.startsWith('http') 
              ? influencerData.imageUrl 
              : `http://localhost:3001${influencerData.imageUrl}`
            setProfileImageUrl(fullImageUrl)
          }
        } else {
          setError(influencerRes.error || 'Failed to load influencer data')
        }
        
        if (contentRes.success && contentRes.data) {
          setGeneratedContent(Array.isArray(contentRes.data) ? contentRes.data : [])
          
          // Load training images from content (ONLY training_image, not profile_image)
          const contentArray = Array.isArray(contentRes.data) ? contentRes.data : []
          const trainingImgs = contentArray
            .filter(c => c && c.type === 'training_image') // Only training_image, exclude profile_image
            .sort((a, b) => {
              // Sort by createdAt or id to maintain order
              if (a.createdAt && b.createdAt) {
                return new Date(a.createdAt) - new Date(b.createdAt)
              }
              return (a.id || 0) - (b.id || 0)
            })
            .map(c => c.url && c.url.startsWith('http') ? c.url : `http://localhost:3001${c.url}`)
          setTrainingImages(trainingImgs)
          console.log(`✅ Loaded ${trainingImgs.length} training images (excluding profile image)`)
          
          // Auto-select styles from existing style_image content
          if (influencerData) {
            const styleImages = contentArray.filter(c => c && c.type === 'style_image' && c.style)
            if (styleImages.length > 0) {
              const foundStyles = [...new Set(styleImages.map(c => c.style).filter(Boolean))]
              if (foundStyles.length > 0) {
                // Merge with existing selected styles
                const currentStyles = Array.isArray(influencerData.clothingStyles) ? influencerData.clothingStyles : []
                const mergedStyles = [...new Set([...currentStyles, ...foundStyles])]
                setSelectedStyles(mergedStyles)
                
                // Update influencer with merged styles if different
                if (mergedStyles.length !== currentStyles.length || 
                    mergedStyles.some(s => !currentStyles.includes(s))) {
                  try {
                    await influencersAPI.update(influencerData.id, {
                      clothingStyles: mergedStyles,
                      stylesChosen: mergedStyles.length
                    })
                    console.log('✅ Auto-selected styles from existing content:', mergedStyles)
                  } catch (err) {
                    console.error('Error updating styles:', err)
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading influencer data:', err)
        setError(err.message || 'Failed to load influencer data')
      } finally {
        setLoading(false)
      }
    }
    
    loadInfluencerData()
  }, [isEditMode, editId])

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (trainingImagePollIntervalRef.current) {
        clearInterval(trainingImagePollIntervalRef.current)
        trainingImagePollIntervalRef.current = null
      }
    }
  }, [])

  // Periodically refresh content to check for new training images (when in edit mode)
  useEffect(() => {
    if (!isEditMode || !editId) return

    const influencerId = currentInfluencerId || (editId ? parseInt(editId) : null)
    if (!influencerId) return

    // Refresh content every 3 seconds to check for new training images
    const refreshInterval = setInterval(async () => {
      try {
        const contentRes = await contentAPI.getByInfluencer(influencerId)
        if (contentRes.success && contentRes.data) {
          const contentArray = Array.isArray(contentRes.data) ? contentRes.data : []
          const trainingImgs = contentArray
            .filter(c => c && c.type === 'training_image')
            .sort((a, b) => {
              if (a.createdAt && b.createdAt) {
                return new Date(a.createdAt) - new Date(b.createdAt)
              }
              return (a.id || 0) - (b.id || 0)
            })
            .map(c => c.url && c.url.startsWith('http') ? c.url : `http://localhost:3001${c.url}`)
          
          // Always update to ensure latest images are shown
          setGeneratedContent(contentArray)
          setTrainingImages(trainingImgs)
          
          if (trainingImgs.length > 0) {
            console.log(`🔄 Auto-refresh: Found ${trainingImgs.length} training images`)
          }
        }
      } catch (err) {
        console.error('Error refreshing content:', err)
      }
    }, 3000) // Check every 3 seconds

    return () => clearInterval(refreshInterval)
  }, [isEditMode, editId, currentInfluencerId])

  const handleGenerateWithAI = async () => {
    if (!influencerName || !gender || !age) {
      alert('Please fill in at least Name, Gender, and Age before generating')
      return
    }

    setGenerating(true)
    startGeneration('Generating Profile & Training Images')
    addGenerationLog(`Starting full AI generation for ${influencerName}...`, 'info')
    updateGenerationProgress(5)
    
    try {
      // Create or update influencer first
      let influencerId = currentInfluencerId
      if (!influencerId) {
        // Create new influencer
        const newInfluencer = {
          name: influencerName,
          description: description || 'Content Creator',
          gender,
          age,
          location: location || '',
          hairColor: hairColor || '',
          activities: activities || [],
          settings: settings || [],
          additionalInfo: additionalInfo || [],
          clothingStyles: selectedStyles || [],
          feedPosts: feedPosts || 0,
          storyPosts: storyPosts || 0,
          dailyContentEnabled: false,
          trainingProgress: 0,
          imagesLocked: 0,
          stylesChosen: selectedStyles.length || 0
        }
        const createRes = await influencersAPI.create(newInfluencer)
        influencerId = createRes.data.id
        setCurrentInfluencerId(influencerId)
        console.log('✅ Created new influencer with ID:', influencerId)
      } else {
        // Update existing influencer
        await influencersAPI.update(influencerId, {
          name: influencerName,
          description,
          gender,
          age,
          location,
          hairColor,
          activities,
          settings,
          additionalInfo,
          clothingStyles: selectedStyles,
          feedPosts,
          storyPosts
        })
      }

      const influencerData = {
        name: influencerName,
        description,
        gender,
        age,
        location,
        hairColor,
        activities,
        settings,
        clothingStyles: selectedStyles
      }

      addGenerationLog('Step 1: Generating profile image...', 'info')
      updateGenerationProgress(10)
      
      // Generate profile image first
      const profileRes = await aiAPI.generateProfile(influencerData)
      if (profileRes.success && profileRes.data.url) {
        addGenerationLog('Profile image generated successfully!', 'success')
        updateGenerationProgress(30)
        const fullImageUrl = `http://localhost:3001${profileRes.data.url}`
        setProfileImageUrl(fullImageUrl)
        
        // Update influencer with profile image
        try {
          await influencersAPI.update(influencerId, {
            imageUrl: fullImageUrl
          })
          
          // Add profile image as content
          await contentAPI.create({
            influencerId: influencerId,
            type: 'profile_image',
            url: profileRes.data.url,
            status: 'completed'
          })
          
          addGenerationLog('Profile image saved to influencer', 'success')
        } catch (err) {
          console.error('Error updating influencer:', err)
          addGenerationLog('Warning: Could not save profile image', 'warning')
        }
      }

      addGenerationLog('Step 2: Starting training images generation (25 images)...', 'info')
      updateGenerationProgress(40)
      
      // Start training images generation (async) - this will add content automatically
      // Pass influencer ID so content can be linked
      const influencerDataWithId = {
        ...influencerData,
        id: influencerId
      }
      
      // Start generation in background
      aiAPI.generateTrainingImages(influencerDataWithId, 25)
        .then(() => {
          addGenerationLog('Training images generation started', 'success')
          updateGenerationProgress(50)
        })
        .catch(err => {
          addGenerationLog(`Error: ${err.message}`, 'error')
          completeGeneration(false, err.message || 'Failed to start training images generation')
        })
      
      // Poll for progress - check more frequently to show real progress
      let pollCount = 0
      let lastTrainingCount = 0
      const maxPolls = 120 // Increased to allow more time
      const targetCount = 20 // Training images target
      const pollInterval = setInterval(async () => {
        pollCount++
        
        // Check progress every 2 polls (every ~6 seconds) instead of every 10
        if (pollCount % 2 === 0) {
          try {
            const contentRes = await contentAPI.getByInfluencer(influencerId)
            if (contentRes.success) {
              const trainingCount = contentRes.data.filter(c => c && c.type === 'training_image').length
              
              // Update progress based on actual images generated, not just poll count
              const progress = Math.min(50 + (trainingCount / targetCount) * 45, 95)
              updateGenerationProgress(progress)
              
              // Only log when count changes or every 5 checks
              if (trainingCount !== lastTrainingCount || pollCount % 10 === 0) {
                addGenerationLog(`Found ${trainingCount}/${targetCount} training images so far...`, 'info')
                lastTrainingCount = trainingCount
              }
              
              // Update state with current images - real-time update of grid
              setGeneratedContent(contentRes.data || [])
              const trainingImgs = contentRes.data
                .filter(c => c && c.type === 'training_image') // Only training_image, exclude profile_image
                .map(c => c.url.startsWith('http') ? c.url : `http://localhost:3001${c.url}`)
              setTrainingImages(trainingImgs) // Update grid in real-time
              
              if (trainingCount >= targetCount) {
                clearInterval(pollInterval)
                console.log(`✅ Found ${trainingImgs.length} training images (excluding profile image)`)
                
                updateGenerationProgress(100)
                completeGeneration(true, 'All images generated successfully!')
                setGenerating(false)
                
                // Auto-close modal after 1.5 seconds
                setTimeout(() => {
                  setShowGenerationModal(false)
                }, 1500)
              }
            }
          } catch (err) {
            console.error('Error checking progress:', err)
            // Still update progress based on poll count as fallback
            const fallbackProgress = Math.min(50 + (pollCount / maxPolls) * 45, 95)
            updateGenerationProgress(fallbackProgress)
            if (pollCount % 10 === 0) {
              addGenerationLog(`Checking progress... (${pollCount}/${maxPolls})`, 'info')
            }
          }
        } else {
          // On non-check polls, just update progress based on time
          const timeBasedProgress = Math.min(50 + (pollCount / maxPolls) * 45, 95)
          updateGenerationProgress(timeBasedProgress)
        }
        
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          addGenerationLog('Generation is taking longer than expected. Images may still be generating in the background.', 'warning')
          completeGeneration(true, 'Generation started. Check "Generated Content" to see results as they appear.')
          setGenerating(false)
        }
      }, 3000)
      
    } catch (error) {
      console.error('Error generating with AI:', error)
      addGenerationLog(`Error: ${error.message || 'Failed to generate images'}`, 'error')
      completeGeneration(false, error.message || 'Failed to generate images. Make sure REPLICATE_API_TOKEN is set in backend .env file.')
      setGenerating(false)
    }
  }

  // Generate only training images (20 photos) with AI
  const handleGenerateMissingTrainingImages = async () => {
    if (!influencerName || !gender || !age) {
      alert('Please fill in at least Name, Gender, and Age before generating')
      return
    }

    const currentCount = trainingImages.length
    const missingCount = 20 - currentCount

    if (missingCount <= 0) {
      alert('You already have 20 training images!')
      return
    }

    setGenerating(true)
    setTrainingImageMethod('ai')
    // NO MODAL - just start generating in background
    
    try {
      // Ensure influencer exists
      let influencerId = currentInfluencerId
      if (!influencerId) {
        const newInfluencer = {
          name: influencerName,
          description: description || 'Content Creator',
          gender,
          age,
          location: location || '',
          hairColor: hairColor || '',
          activities: activities || [],
          settings: settings || [],
          additionalInfo: additionalInfo || [],
          clothingStyles: selectedStyles || [],
          feedPosts: feedPosts || 0,
          storyPosts: storyPosts || 0,
          dailyContentEnabled: false,
          trainingProgress: 0,
          imagesLocked: 0,
          stylesChosen: selectedStyles.length || 0
        }
        const createRes = await influencersAPI.create(newInfluencer)
        influencerId = createRes.data.id
        setCurrentInfluencerId(influencerId)
      }

      const influencerData = {
        name: influencerName,
        description,
        gender,
        age,
        location,
        hairColor,
        activities,
        settings,
        clothingStyles: selectedStyles
      }

      // Generate only the missing number of training images
      const influencerDataWithId = {
        ...influencerData,
        id: influencerId
      }
      
      // Start generation in background (NO MODAL) - only generate missing count
      aiAPI.generateTrainingImages(influencerDataWithId, missingCount)
        .then(() => {
          console.log(`✅ Started generation of ${missingCount} missing training images`)
        })
        .catch(err => {
          console.error('Error starting generation:', err)
          alert(`Failed to start generation: ${err.message}`)
          setGenerating(false)
        })
      
      // Poll for progress updates - update images grid in real-time
      let pollCount = 0
      let lastTrainingCount = currentCount
      const maxPolls = 120
      const targetCount = 20
      
      // Store interval in ref
      trainingImagePollIntervalRef.current = setInterval(async () => {
        pollCount++
        
        // Check progress every 2 seconds
        try {
          const contentRes = await contentAPI.getByInfluencer(influencerId)
          if (contentRes.success) {
            const trainingCount = contentRes.data.filter(c => c && c.type === 'training_image').length
            
            // Update images grid in real-time
            setGeneratedContent(contentRes.data || [])
            const trainingImgs = contentRes.data
              .filter(c => c && c.type === 'training_image')
              .sort((a, b) => {
                // Sort by createdAt or id to maintain order
                if (a.createdAt && b.createdAt) {
                  return new Date(a.createdAt) - new Date(b.createdAt)
                }
                return (a.id || 0) - (b.id || 0)
              })
              .map(c => c.url.startsWith('http') ? c.url : `http://localhost:3001${c.url}`)
            setTrainingImages(trainingImgs)
            
            if (trainingCount !== lastTrainingCount) {
              console.log(`✅ Found ${trainingCount}/${targetCount} training images (${trainingCount - lastTrainingCount} new)`)
              lastTrainingCount = trainingCount
            }
            
            if (trainingCount >= targetCount) {
              if (trainingImagePollIntervalRef.current) {
                clearInterval(trainingImagePollIntervalRef.current)
                trainingImagePollIntervalRef.current = null
              }
              
              // Auto-update training progress
              if (currentInfluencerId) {
                const newProgress = calculateTrainingProgress()
                try {
                  await influencersAPI.update(influencerId, {
                    trainingProgress: newProgress,
                    imagesLocked: contentRes.data.filter(c => c && (c.type === 'training_image' || c.type === 'profile_image')).length
                  })
                } catch (err) {
                  console.error('Error updating progress:', err)
                }
              }
              
              setGenerating(false)
              console.log('✅ All 20 training images complete!')
            }
          }
        } catch (err) {
          console.error('Error checking progress:', err)
        }
        
        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          if (trainingImagePollIntervalRef.current) {
            clearInterval(trainingImagePollIntervalRef.current)
            trainingImagePollIntervalRef.current = null
          }
          setGenerating(false)
          console.log('⚠️ Polling timeout reached')
        }
      }, 2000) // Poll every 2 seconds for real-time updates
    } catch (error) {
      console.error('Error generating missing training images:', error)
      alert(`Failed to generate: ${error.message}`)
      setGenerating(false)
      // Clear interval on error
      if (trainingImagePollIntervalRef.current) {
        clearInterval(trainingImagePollIntervalRef.current)
        trainingImagePollIntervalRef.current = null
      }
    }
  }

  const handleGenerateTrainingImages = async () => {
    if (!influencerName || !gender || !age) {
      alert('Please fill in at least Name, Gender, and Age before generating')
      return
    }

    // Prevent multiple simultaneous generations
    if (generating) {
      alert('Generation already in progress. Please wait for the current generation to complete.')
      return
    }

    // Clear any existing polling interval
    if (trainingImagePollIntervalRef.current) {
      clearInterval(trainingImagePollIntervalRef.current)
      trainingImagePollIntervalRef.current = null
    }

    setGenerating(true)
    setTrainingImageMethod('ai')
    // NO MODAL - just start generating in background
    
    try {
      // Ensure influencer exists
      let influencerId = currentInfluencerId
      if (!influencerId) {
        const newInfluencer = {
          name: influencerName,
          description: description || 'Content Creator',
          gender,
          age,
          location: location || '',
          hairColor: hairColor || '',
          activities: activities || [],
          settings: settings || [],
          additionalInfo: additionalInfo || [],
          clothingStyles: selectedStyles || [],
          feedPosts: feedPosts || 0,
          storyPosts: storyPosts || 0,
          dailyContentEnabled: false,
          trainingProgress: 0,
          imagesLocked: 0,
          stylesChosen: selectedStyles.length || 0
        }
        const createRes = await influencersAPI.create(newInfluencer)
        influencerId = createRes.data.id
        setCurrentInfluencerId(influencerId)
      }

      const influencerData = {
        name: influencerName,
        description,
        gender,
        age,
        location,
        hairColor,
        activities,
        settings,
        clothingStyles: selectedStyles
      }

      // Generate 20 training images
      const influencerDataWithId = {
        ...influencerData,
        id: influencerId
      }
      
      addGenerationLog('Calling AI service to generate 20 training images...', 'info')
      updateGenerationProgress(10)
      
      // Start generation in background (NO MODAL)
      aiAPI.generateTrainingImages(influencerDataWithId, 20)
        .then(() => {
          console.log('✅ Training images generation started')
        })
        .catch(err => {
          console.error('Error starting generation:', err)
          alert(`Failed to start generation: ${err.message}`)
          setGenerating(false)
        })
      
      // Poll for progress updates - update images grid in real-time
      let pollCount = 0
      let lastTrainingCount = 0
      const maxPolls = 120
      const targetCount = 20
      
      // Store interval in ref so we can clear it if needed
      trainingImagePollIntervalRef.current = setInterval(async () => {
        pollCount++
        
        // Check progress every 2 seconds
        try {
          const contentRes = await contentAPI.getByInfluencer(influencerId)
          if (contentRes.success) {
            const trainingCount = contentRes.data.filter(c => c && c.type === 'training_image').length
            
            // Update images grid in real-time
            setGeneratedContent(contentRes.data || [])
            const trainingImgs = contentRes.data
              .filter(c => c && c.type === 'training_image')
              .sort((a, b) => {
                // Sort by createdAt or id to maintain order
                if (a.createdAt && b.createdAt) {
                  return new Date(a.createdAt) - new Date(b.createdAt)
                }
                return (a.id || 0) - (b.id || 0)
              })
              .map(c => c.url.startsWith('http') ? c.url : `http://localhost:3001${c.url}`)
            setTrainingImages(trainingImgs)
            
            if (trainingCount !== lastTrainingCount) {
              console.log(`✅ Found ${trainingCount}/${targetCount} training images (${trainingCount - lastTrainingCount} new)`)
              lastTrainingCount = trainingCount
            }
            
            if (trainingCount >= targetCount) {
              if (trainingImagePollIntervalRef.current) {
                clearInterval(trainingImagePollIntervalRef.current)
                trainingImagePollIntervalRef.current = null
              }
              
              // Auto-update training progress
              if (currentInfluencerId) {
                const newProgress = calculateTrainingProgress()
                try {
                  await influencersAPI.update(influencerId, {
                    trainingProgress: newProgress,
                    imagesLocked: contentRes.data.filter(c => c && (c.type === 'training_image' || c.type === 'profile_image')).length
                  })
                } catch (err) {
                  console.error('Error updating progress:', err)
                }
              }
              
              setGenerating(false)
              console.log('✅ All 20 training images generated!')
            }
          }
        } catch (err) {
          console.error('Error checking progress:', err)
        }
        
        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          setGenerating(false)
          console.log('⚠️ Polling timeout reached')
        }
      }, 2000) // Poll every 2 seconds for real-time updates
      
    } catch (error) {
      console.error('Error generating training images:', error)
      addGenerationLog(`Error: ${error.message || 'Failed to generate images'}`, 'error')
      completeGeneration(false, error.message || 'Failed to generate images. Make sure REPLICATE_API_TOKEN is set in backend .env file.')
      setGenerating(false)
    }
  }

  // Handle file upload for training images
  const handleUploadTrainingImages = async (files) => {
    if (!files || files.length === 0) {
      alert('Please select at least one image')
      return
    }

    if (files.length > 20) {
      alert('Please select maximum 20 images')
      return
    }

    setUploadingImages(true)
    setTrainingImageMethod('upload')
    try {
      // Ensure influencer exists
      let influencerId = currentInfluencerId
      if (!influencerId) {
        const newInfluencer = {
          name: influencerName,
          description: description || 'Content Creator',
          gender,
          age,
          location: location || '',
          hairColor: hairColor || '',
          activities: activities || [],
          settings: settings || [],
          additionalInfo: additionalInfo || [],
          clothingStyles: selectedStyles || [],
          feedPosts: feedPosts || 0,
          storyPosts: storyPosts || 0,
          dailyContentEnabled: false,
          trainingProgress: 0,
          imagesLocked: 0,
          stylesChosen: selectedStyles.length || 0
        }
        const createRes = await influencersAPI.create(newInfluencer)
        influencerId = createRes.data.id
        setCurrentInfluencerId(influencerId)
      }

      // Upload all files at once
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('image', file)
      })
      formData.append('influencerId', influencerId)
      formData.append('type', 'training_image')

      const response = await fetch('http://localhost:3001/api/content/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to upload images' }))
        throw new Error(errorData.error || `Failed to upload images`)
      }

      const result = await response.json()
      alert(`✅ Successfully uploaded ${result.count || files.length} training image(s)!`)
      
      // Refresh content
      const contentRes = await contentAPI.getByInfluencer(influencerId)
      if (contentRes.success) {
        setGeneratedContent(contentRes.data || [])
        const trainingImgs = contentRes.data
          .filter(c => c.type === 'training_image')
          .map(c => c.url.startsWith('http') ? c.url : `http://localhost:3001${c.url}`)
        setTrainingImages(trainingImgs)
        
        // Auto-update training progress
        if (currentInfluencerId) {
          const newProgress = calculateTrainingProgress()
          try {
            await influencersAPI.update(influencerId, {
              trainingProgress: newProgress,
              imagesLocked: contentRes.data.filter(c => c && (c.type === 'training_image' || c.type === 'profile_image')).length
            })
          } catch (err) {
            console.error('Error updating progress:', err)
          }
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      alert(`Error: ${error.message || 'Failed to upload images'}`)
    } finally {
      setUploadingImages(false)
    }
  }
  
  // Auto-save function with debounce
  const autoSave = async (skipValidation = false) => {
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    // Set saving status
    setSaveStatus('saving')

    // Create new timeout for debounce (1 second delay)
    const timeout = setTimeout(async () => {
      try {
        // Get current content array
        const contentArray = Array.isArray(generatedContent) ? generatedContent : []
        
        // If no influencer ID exists yet, create one first (if we have minimum required fields)
        if (!currentInfluencerId) {
          if (!influencerName || !gender || !age) {
            // Not enough data to create yet
            setSaveStatus(null)
            return
          }
          
          // Create new influencer
          const currentProgress = calculateTrainingProgress()
          const newInfluencer = {
            name: influencerName,
            description: description || 'Content Creator',
            gender,
            age,
            location: location || '',
            hairColor: hairColor || '',
            activities: activities || [],
            settings: settings || [],
            additionalInfo: additionalInfo || [],
            clothingStyles: selectedStyles || [],
            feedPosts: feedPosts || 0,
            storyPosts: storyPosts || 0,
            dailyContentEnabled: false,
            trainingProgress: currentProgress,
            imagesLocked: contentArray.filter(c => c && (c.type === 'training_image' || c.type === 'profile_image')).length,
            stylesChosen: selectedStyles.length
          }
          
          const createRes = await influencersAPI.create(newInfluencer)
          setCurrentInfluencerId(createRes.data.id)
          setSaveStatus('saved')
          console.log('✅ Auto-saved: Created new influencer with ID:', createRes.data.id)
          
          // Hide saved status after 2 seconds
          setTimeout(() => setSaveStatus(null), 2000)
          return
        }

        // Update existing influencer
        const currentProgress = calculateTrainingProgress()
        // contentArray already declared above in the timeout function
        await influencersAPI.update(currentInfluencerId, {
          name: influencerName,
          description,
          gender,
          age,
          location,
          hairColor,
          activities,
          settings,
          additionalInfo,
          clothingStyles: selectedStyles,
          feedPosts,
          storyPosts,
          trainingProgress: currentProgress,
          imagesLocked: contentArray.filter(c => c && (c.type === 'training_image' || c.type === 'profile_image')).length,
          stylesChosen: selectedStyles.length
        })
        
        setSaveStatus('saved')
        console.log('✅ Auto-saved: Updated influencer')
        
        // Hide saved status after 2 seconds
        setTimeout(() => setSaveStatus(null), 2000)
      } catch (err) {
        console.error('Error auto-saving:', err)
        setSaveStatus('error')
        setTimeout(() => setSaveStatus(null), 3000)
      }
    }, 1000) // 1 second debounce

    setSaveTimeout(timeout)
  }

  const handleSave = async () => {
    // Validate required fields
    if (!influencerName || !description || !gender || !age) {
      alert('Please fill in at least Name, Description, Gender, and Age')
      return
    }
    
    // Clear any pending auto-save
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    // Calculate current training progress
    const currentProgress = calculateTrainingProgress()
    
    try {
      if (currentInfluencerId) {
        // Update existing influencer
        await influencersAPI.update(currentInfluencerId, {
          name: influencerName,
          description,
          gender,
          age,
          location,
          hairColor,
          activities,
          settings,
          additionalInfo,
          clothingStyles: selectedStyles,
          feedPosts,
          storyPosts,
          trainingProgress: currentProgress,
          imagesLocked: contentArray.filter(c => c && (c.type === 'training_image' || c.type === 'profile_image')).length,
          stylesChosen: selectedStyles.length
        })
        alert('✅ Profile updated successfully!')
      } else {
        // Create new influencer
        const newInfluencer = {
          name: influencerName,
          description,
          gender,
          age,
          location,
          hairColor,
          activities,
          settings,
          additionalInfo,
          clothingStyles: selectedStyles,
          feedPosts,
          storyPosts,
          dailyContentEnabled: false,
          trainingProgress: currentProgress,
          imagesLocked: contentArray.filter(c => c && (c.type === 'training_image' || c.type === 'profile_image')).length,
          stylesChosen: selectedStyles.length
        }
        const createRes = await influencersAPI.create(newInfluencer)
        setCurrentInfluencerId(createRes.data.id)
        alert('✅ New influencer created successfully!')
      }
      
      navigate('/influencers')
    } catch (err) {
      console.error('Error saving influencer:', err)
      alert('Failed to save changes')
    }
  }

  // Calculate real training progress based on actual completion
  const calculateTrainingProgress = () => {
    try {
      let totalProgress = 0
      const stepWeight = 20 // Each step is worth 20% (5 steps total = 100%)
      
      // Step 1: Basics (20%)
      const step1Fields = [
        influencerName,
        description,
        gender,
        age,
        location
      ]
      const step1Completed = step1Fields.filter(field => field && field.toString().trim() !== '').length
      const step1Progress = (step1Completed / step1Fields.length) * stepWeight
      totalProgress += step1Progress
      
      // Step 2: Influencer Profile (20%) - NOW STEP 2
      // Need: at least 1 activity, 1 setting, 1 additional info
      const hasActivities = Array.isArray(activities) && activities.length > 0
      const hasSettings = Array.isArray(settings) && settings.length > 0
      const hasAdditionalInfo = Array.isArray(additionalInfo) && additionalInfo.length > 0
      const step2Fields = [hasActivities, hasSettings, hasAdditionalInfo]
      const step2Completed = step2Fields.filter(Boolean).length
      const step2Progress = (step2Completed / step2Fields.length) * stepWeight
      totalProgress += step2Progress
      
      // Step 3: Training Images (20%) - NOW STEP 3
      // Need: profile image + at least 20 training images
      const contentArray = Array.isArray(generatedContent) ? generatedContent : []
      const hasProfileImage = !!profileImageUrl || contentArray.some(c => c && c.type === 'profile_image')
      const trainingImageCount = contentArray.filter(c => c && c.type === 'training_image').length
      const hasEnoughTrainingImages = trainingImageCount >= 20
      const step3Progress = hasProfileImage && hasEnoughTrainingImages ? stepWeight : 
                           hasProfileImage ? (stepWeight * 0.5) : 0 // 50% if only profile, 0% if nothing
      totalProgress += step3Progress
      
      // Step 4: Clothing Styles (20%)
      // Need: at least 1 style chosen
      const step4Progress = Array.isArray(selectedStyles) && selectedStyles.length > 0 ? stepWeight : 0
      totalProgress += step4Progress
      
      // Step 5: Content Plan (20%)
      // Need: feedPosts or storyPosts set (at least one > 0)
      const hasContentPlan = (feedPosts > 0 || storyPosts > 0)
      const step5Progress = hasContentPlan ? stepWeight : 0
      totalProgress += step5Progress
      
      return Math.min(Math.round(totalProgress), 100)
    } catch (error) {
      console.error('Error calculating training progress:', error)
      return 0
    }
  }
  
  const trainingProgress = calculateTrainingProgress()
  const contentArray = Array.isArray(generatedContent) ? generatedContent : []
  const imagesLocked = contentArray.filter(c => c && (c.type === 'training_image' || c.type === 'profile_image')).length
  const stylesChosen = Array.isArray(selectedStyles) ? selectedStyles.length : 0
  const automationCredits = 2

  // Calculate completion status for each checklist item
  const getChecklistItems = () => {
    // Step 1: Basics - all fields filled
    const step1Fields = [influencerName, description, gender, age, location]
    const step1Completed = step1Fields.every(field => field && field.toString().trim() !== '')
    
    // Step 2: Influencer Profile - at least 1 activity, 1 setting, 1 additional info
    const hasActivities = Array.isArray(activities) && activities.length > 0
    const hasSettings = Array.isArray(settings) && settings.length > 0
    const hasAdditionalInfo = Array.isArray(additionalInfo) && additionalInfo.length > 0
    const step2Completed = hasActivities && hasSettings && hasAdditionalInfo
    
    // Step 3: Training Images - profile image + at least 20 training images
    const hasProfileImage = !!profileImageUrl || contentArray.some(c => c && c.type === 'profile_image')
    const trainingImageCount = contentArray.filter(c => c && c.type === 'training_image').length
    const step3Completed = hasProfileImage && trainingImageCount >= 20
    
    // Step 4: Style & wardrobe - at least 1 style chosen
    const step4Completed = Array.isArray(selectedStyles) && selectedStyles.length > 0
    
    // Step 5: Daily automation - feedPosts or storyPosts > 0
    const step5Completed = feedPosts > 0 || storyPosts > 0
    
    return [
      { num: 1, title: 'Basics', desc: 'Name & desc', completed: step1Completed },
      { num: 2, title: 'Training images', desc: '20-30 photos', completed: step2Completed },
      { num: 3, title: 'Profile DNA', desc: 'Age, gender & routines', completed: step3Completed },
      { num: 4, title: 'Style & wardrobe', desc: 'Pick up to 4 looks', completed: step4Completed },
      { num: 5, title: 'Daily automation', desc: 'Set daily output', completed: step5Completed }
    ]
  }
  
  const checklistItems = getChecklistItems()

  const quickSuggestions = {
    activities: [
      'cooking healthy meals',
      'working out at the gym',
      'reading and journaling',
      'yoga and meditation',
      'photography and editing',
      'traveling and exploring',
      'dancing and music',
      'painting and art',
      'hiking and nature walks',
      'coffee and cafe hopping',
      'shopping and fashion',
      'beach and swimming',
      'cooking and baking',
      'fitness and training',
      'reading books',
      'writing and blogging',
      'music and concerts',
      'watching movies',
      'gardening',
      'cycling and biking'
    ],
    settings: [
      'bedroom with natural lighting',
      'walk-in closet or wardrobe area',
      'balcony or outdoor spaces',
      'rooftop or scenic locations',
      'modern kitchen',
      'cozy living room',
      'beach or seaside',
      'urban city streets',
      'cafe or restaurant',
      'gym or fitness studio',
      'park or nature',
      'luxury hotel room',
      'studio apartment',
      'outdoor terrace',
      'bathroom with good lighting',
      'dressing room',
      'mirror selfie area',
      'window with view',
      'minimalist workspace',
      'boutique store'
    ],
    additional: [
      'passionate about fitness and wellness',
      'loves fashion and styling',
      'social media enthusiast',
      'travel blogger',
      'foodie and recipe creator',
      'fitness coach',
      'fashion influencer',
      'lifestyle content creator',
      'beauty and skincare expert',
      'motivational speaker',
      'entrepreneur',
      'student and learner',
      'adventure seeker',
      'home decor enthusiast',
      'pet lover',
      'sustainable living advocate',
      'tech and gadgets',
      'music and culture',
      'art and creativity',
      'health and nutrition'
    ]
  }

  const clothingStyles = [
    { name: 'GLAM/ELEGANT', image: '👗' },
    { name: 'PROFESSIONAL', image: '👔' },
    { name: 'LINGERIE', image: '👙' },
    { name: 'CASUAL', image: '👕' },
    { name: 'YOUTHFUL', image: '🎽' },
    { name: 'SPORTY', image: '🏃' }
  ]

  const handleAddTag = (type, value, setter, listSetter) => {
    const trimmedValue = value.trim()
    if (!trimmedValue) return
    
    // Get current list based on type
    let currentList = []
    if (type === 'activity') {
      currentList = activities
    } else if (type === 'setting') {
      currentList = settings
    } else if (type === 'info') {
      currentList = additionalInfo
    }
    
    // Only add if not already in list
    if (!currentList.includes(trimmedValue)) {
      listSetter([...currentList, trimmedValue])
      if (setter) setter('')
      autoSave() // Trigger auto-save after adding tag
    }
  }

  const handleRemoveTag = (type, index, listSetter) => {
    listSetter(listSetter.filter((_, i) => i !== index))
    autoSave() // Trigger auto-save after removing tag
  }

  // Helper function to add log entry
  const addGenerationLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setGenerationLog(prev => [...prev, { message, type, timestamp }])
  }

  // Helper function to update progress
  const updateGenerationProgress = (progress, status = 'generating') => {
    setGenerationProgress(Math.min(100, Math.max(0, progress)))
    setGenerationStatus(status)
  }

  // Helper function to start generation modal
  const startGeneration = (title) => {
    setGenerationTitle(title)
    setShowGenerationModal(true)
    setGenerationProgress(0)
    setGenerationStatus('generating')
    setGenerationLog([])
    addGenerationLog('Starting generation...', 'info')
  }

  // Helper function to complete generation
  const completeGeneration = (success = true, message = '') => {
    if (success) {
      setGenerationStatus('completed')
      setGenerationProgress(100)
      addGenerationLog(message || 'Generation completed successfully!', 'success')
    } else {
      setGenerationStatus('error')
      addGenerationLog(message || 'Generation failed', 'error')
    }
  }

  const toggleStyle = (styleName) => {
    if (selectedStyles.includes(styleName)) {
      setSelectedStyles(selectedStyles.filter(s => s !== styleName))
    } else if (selectedStyles.length < 4) {
      setSelectedStyles([...selectedStyles, styleName])
    }
    autoSave() // Trigger auto-save after toggling style
  }

  const handleStyleClick = (styleName) => {
    // Check if there's already an image for this style
    const styleImages = generatedContent.filter(
      c => c && c.type === 'style_image' && c.style === styleName
    )
    const hasExistingImage = styleImages.length > 0
    
    // If already selected and has image, open modal with regenerate option
    if (selectedStyles.includes(styleName) && hasExistingImage) {
      setSelectedStyleForModal(styleName)
      setStyleModalOpen(true)
    } else if (selectedStyles.includes(styleName)) {
      // If selected but no image, just toggle it off
      toggleStyle(styleName)
    } else {
      // Open modal to choose upload or AI generation
      setSelectedStyleForModal(styleName)
      setStyleModalOpen(true)
    }
  }

  const handleTrainingImageClick = (content) => {
    setSelectedTrainingImage(content)
    setCustomPrompt(content.prompt || '')
    setTrainingImageModalOpen(true)
  }

  // Emily Pellegrini Strategy - Auto-fill fields with optimized values
  const applyEmilyPellegriniStrategy = () => {
    // Set optimal values based on Emily's success
    if (!description) setDescription('Content Creator & Lifestyle Influencer')
    if (!gender || gender !== 'Female') setGender('Female')
    if (!age || age !== 24) setAge(24)
    if (!location) setLocation('Luxury destinations worldwide')
    if (!hairColor) setHairColor('long brown hair')
    
    // Emily's successful activities
    const emilyActivities = [
      'traveling and exploring new destinations',
      'working out at the gym',
      'enjoying luxury dining experiences',
      'relaxing at beautiful beaches',
      'shopping for fashion',
      'attending social events',
      'practicing yoga and wellness',
      'exploring city nightlife',
      'visiting spas and wellness centers',
      'photoshoots in exotic locations'
    ]
    if (activities.length === 0) setActivities(emilyActivities)
    
    // Emily's successful settings
    const emilySettings = [
      'luxury hotel rooms with city views',
      'upscale restaurants and bars',
      'beautiful beaches and resorts',
      'modern gyms and fitness studios',
      'boutique shopping districts',
      'penthouse apartments',
      'luxury spas',
      'exotic travel destinations',
      'rooftop terraces',
      'boudoir settings with natural lighting'
    ]
    if (settings.length === 0) setSettings(emilySettings)
    
    // Additional info for better prompts
    const emilyInfo = [
      'sexy and alluring',
      'tasteful and elegant',
      'confident and sophisticated',
      'natural and authentic',
      'high-end lifestyle',
      'professional photography quality'
    ]
    if (additionalInfo.length === 0) setAdditionalInfo(emilyInfo)
    
    // Select popular styles if none selected
    if (selectedStyles.length === 0) {
      setSelectedStyles(['LINGERIE', 'GLAM/ELEGANT', 'CASUAL', 'SPORTY'])
    }
    
    setUsingEmilyStrategy(true)
    alert('✅ Emily Pellegrini Strategy applied! Fields have been optimized for maximum success.')
  }

  // Generate preview prompts for training images
  const generatePromptPreview = () => {
    if (!influencerName || !gender || !age) {
      alert('Please fill in at least Name, Gender, and Age before previewing prompts')
      return
    }

    const prompts = []
    const trainingImagePrompts = [
      { outfit: 'black lace lingerie set', setting: 'luxury bedroom with silk sheets', pose: 'sitting on bed, looking at camera seductively' },
      { outfit: 'red satin bra and panties', setting: 'boudoir with dim lighting', pose: 'leaning against mirror, confident pose' },
      { outfit: 'white lace bodysuit', setting: 'modern apartment with city view', pose: 'standing by window, natural lighting' },
      { outfit: 'black leather corset with stockings', setting: 'dark elegant room', pose: 'sitting on chair, legs crossed, alluring look' },
      { outfit: 'sexy red dress with high heels', setting: 'luxury hotel room', pose: 'standing pose, hand on hip' },
      { outfit: 'black mesh bodysuit', setting: 'studio with dramatic lighting', pose: 'artistic pose, looking away' },
      { outfit: 'white silk robe open, matching lingerie underneath', setting: 'spa-like bathroom', pose: 'leaning on vanity, relaxed' },
      { outfit: 'black lace teddy with garter belt', setting: 'bedroom with candlelight', pose: 'lying on bed, playful pose' },
      { outfit: 'sexy workout set, sports bra and leggings', setting: 'modern gym', pose: 'stretching pose, athletic' },
      { outfit: 'black silk slip dress', setting: 'penthouse with city lights', pose: 'standing by balcony, elegant' },
      { outfit: 'red lace bralette and thong', setting: 'luxury hotel suite', pose: 'sitting on edge of bed, confident' },
      { outfit: 'white lace babydoll nightie', setting: 'bright bedroom with natural light', pose: 'laying on bed, innocent yet sexy' },
      { outfit: 'black leather jacket open, red lingerie underneath', setting: 'urban loft', pose: 'leaning against wall, edgy' },
      { outfit: 'sexy black bodysuit with cutouts', setting: 'nightclub bathroom', pose: 'mirror selfie style, sultry' },
      { outfit: 'pink satin lingerie set', setting: 'boudoir with soft lighting', pose: 'sitting on chaise lounge, elegant' },
      { outfit: 'black mesh top with leather pants', setting: 'modern apartment', pose: 'standing pose, confident and bold' },
      { outfit: 'white lace chemise', setting: 'luxury bedroom with flowers', pose: 'sitting on bed, romantic and sensual' },
      { outfit: 'red corset with black stockings', setting: 'vintage styled room', pose: 'posing on vintage chair, classic pin-up style' },
      { outfit: 'sexy black lace bra and panty set', setting: 'hotel room with city view', pose: 'standing by window, silhouette' },
      { outfit: 'nude colored lace bodysuit', setting: 'minimalist modern bedroom', pose: 'artistic nude-inspired pose, tasteful' }
    ]

    for (let i = 0; i < 20; i++) {
      const trainingPrompt = trainingImagePrompts[i]
      let prompt = `portrait photo of ${gender.toLowerCase()}, ${age} years old`
      
      if (hairColor) {
        prompt += `, ${hairColor} hair`
      } else if (usingEmilyStrategy) {
        prompt += `, long brown hair`
      }
      
      prompt += `, wearing ${trainingPrompt.outfit}, in ${trainingPrompt.setting}, ${trainingPrompt.pose}`
      
      if (activities && activities.length > 0) {
        prompt += `, ${activities[0].toLowerCase()}`
      }
      
      prompt += `, professional photography, high quality, detailed, 8k, realistic, natural lighting, sexy, alluring, tasteful`
      
      prompts.push({
        number: i + 1,
        prompt: prompt,
        outfit: trainingPrompt.outfit,
        setting: trainingPrompt.setting,
        pose: trainingPrompt.pose
      })
    }

    setPreviewPrompts(prompts)
    setShowPromptPreview(true)
  }

  const handleRegenerateTrainingImage = async () => {
    if (!selectedTrainingImage || !influencerName || !gender || !age) {
      alert('Please fill in at least Name, Gender, and Age before regenerating')
      setTrainingImageModalOpen(false)
      return
    }

    if (regeneratingTrainingImage) {
      console.log('⚠️ Regeneration already in progress')
      return
    }

    setRegeneratingTrainingImage(true)
    setTrainingImageModalOpen(false)

    try {
      const influencerId = currentInfluencerId
      if (!influencerId) {
        alert('Please save the influencer first')
        setRegeneratingTrainingImage(false)
        return
      }

      // Delete the existing training image
      try {
        await contentAPI.delete(selectedTrainingImage.id)
        console.log('✅ Deleted existing training image')
      } catch (err) {
        console.error('Error deleting image:', err)
      }

      // Generate new training image with custom prompt if provided
      const influencerData = {
        name: influencerName,
        description,
        gender,
        age,
        location,
        hairColor,
        activities,
        settings,
        clothingStyles: selectedStyles
      }

      const influencerDataWithId = {
        ...influencerData,
        id: influencerId
      }

      // Generate 1 training image with custom prompt
      if (customPrompt.trim()) {
        // If custom prompt is provided, we need to modify the AI service to accept it
        // For now, we'll generate normally and update the prompt after
        await aiAPI.generateTrainingImages(influencerDataWithId, 1)
      } else {
        await aiAPI.generateTrainingImages(influencerDataWithId, 1)
      }

      // Poll for the new image
      let pollCount = 0
      const maxPolls = 30
      const pollInterval = setInterval(async () => {
        pollCount++
        
        try {
          const contentRes = await contentAPI.getByInfluencer(influencerId)
          if (contentRes.success) {
            const trainingImages = contentRes.data.filter(c => c && c.type === 'training_image')
            
            // Update state
            setGeneratedContent(contentRes.data || [])
            const trainingImgs = trainingImages
              .map(c => c.url.startsWith('http') ? c.url : `http://localhost:3001${c.url}`)
            setTrainingImages(trainingImgs)

            // If we have a new image and custom prompt, update the prompt
            if (customPrompt.trim() && trainingImages.length > 0) {
              const newImage = trainingImages[trainingImages.length - 1]
              try {
                // Update the prompt via API
                await contentAPI.update(newImage.id, { prompt: customPrompt.trim() })
                console.log('✅ Updated prompt for image:', newImage.id)
              } catch (err) {
                console.error('Error updating prompt:', err)
              }
            }

            if (trainingImages.length > 0 || pollCount >= maxPolls) {
              clearInterval(pollInterval)
              setRegeneratingTrainingImage(false)
              console.log('✅ Training image regeneration complete')
            }
          }
        } catch (err) {
          console.error('Error checking progress:', err)
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval)
            setRegeneratingTrainingImage(false)
          }
        }
      }, 2000)
    } catch (error) {
      console.error('Error regenerating training image:', error)
      alert(`Failed to regenerate: ${error.message}`)
      setRegeneratingTrainingImage(false)
    }
  }

  const handleRegenerateStyleImages = async (styleName) => {
    if (!influencerName || !gender || !age) {
      alert('Please fill in at least Name, Gender, and Age before generating')
      setStyleModalOpen(false)
      return
    }

    // Prevent multiple simultaneous calls
    if (generatingStyleImages) {
      console.log('⚠️ Generation already in progress, ignoring duplicate call')
      alert('Generation already in progress. Please wait...')
      return
    }

    const influencerId = currentInfluencerId
    if (!influencerId) {
      alert('Please save the influencer first')
      return
    }

    setStyleModalOpen(false)
    startGeneration(`Regenerating ${styleName} Style`)
    addGenerationLog(`Removing existing images for ${styleName} style...`, 'info')
    
    // Find and delete existing style images for this style
    try {
      const contentRes = await contentAPI.getByInfluencer(influencerId)
      if (contentRes.success) {
        const existingStyleImages = contentRes.data.filter(
          c => c && c.type === 'style_image' && c.style === styleName
        )
        
        if (existingStyleImages.length > 0) {
          addGenerationLog(`Found ${existingStyleImages.length} existing image(s) to remove...`, 'info')
          
          // Delete all existing style images for this style
          for (const image of existingStyleImages) {
            try {
              await contentAPI.delete(image.id)
              addGenerationLog(`✅ Deleted old image (ID: ${image.id})`, 'success')
            } catch (err) {
              console.error('Error deleting old image:', err)
              addGenerationLog(`⚠️ Could not delete old image (ID: ${image.id})`, 'warning')
            }
          }
          
          // Update generatedContent state
          const updatedContent = generatedContent.filter(c => 
            !(c && c.type === 'style_image' && c.style === styleName)
          )
          setGeneratedContent(updatedContent)
        }
      }
    } catch (err) {
      console.error('Error checking/deleting existing images:', err)
      addGenerationLog('⚠️ Could not check for existing images', 'warning')
    }

    // Now generate new image (without checking for existing)
    await handleGenerateStyleImages(styleName, false)
  }

  const handleGenerateStyleImages = async (styleName, checkExisting = true) => {
    if (!influencerName || !gender || !age) {
      alert('Please fill in at least Name, Gender, and Age before generating')
      setStyleModalOpen(false)
      return
    }

    // Prevent multiple simultaneous calls
    if (generatingStyleImages) {
      console.log('⚠️ Generation already in progress, ignoring duplicate call')
      alert('Generation already in progress. Please wait...')
      return
    }

    // Check if images already exist for this style (only if checkExisting is true)
    if (checkExisting) {
      const influencerId = currentInfluencerId
      if (influencerId) {
        try {
          const contentRes = await contentAPI.getByInfluencer(influencerId)
          if (contentRes.success) {
            const existingStyleImages = contentRes.data.filter(
              c => c && c.type === 'style_image' && c.style === styleName
            )
            if (existingStyleImages.length > 0) {
              const confirm = window.confirm(
                `You already have ${existingStyleImages.length} image(s) for ${styleName} style. Do you want to generate another one?`
              )
              if (!confirm) {
                return
              }
            }
          }
        } catch (err) {
          console.error('Error checking existing images:', err)
        }
      }
    }

    setGeneratingStyleImages(true)
    setStyleModalOpen(false)
    console.log(`🎨 Starting generation for style: ${styleName} - COUNT: 1`)
    startGeneration(`Generating ${styleName} Style Images`)
    addGenerationLog(`Generating 1 image for ${styleName} style...`, 'info')
    updateGenerationProgress(10)
    
    try {
      // Ensure influencer exists
      let influencerId = currentInfluencerId
      if (!influencerId) {
        const newInfluencer = {
          name: influencerName,
          description: description || 'Content Creator',
          gender,
          age,
          location: location || '',
          hairColor: hairColor || '',
          activities: activities || [],
          settings: settings || [],
          additionalInfo: additionalInfo || [],
          clothingStyles: selectedStyles || [],
          feedPosts: feedPosts || 0,
          storyPosts: storyPosts || 0,
          dailyContentEnabled: false,
          trainingProgress: 0,
          imagesLocked: 0,
          stylesChosen: selectedStyles.length || 0
        }
        const createRes = await influencersAPI.create(newInfluencer)
        influencerId = createRes.data.id
        setCurrentInfluencerId(influencerId)
      }

      // For style-specific generation, only use the specific style (not all selected styles)
      const influencerData = {
        name: influencerName,
        description,
        gender,
        age,
        location,
        hairColor,
        activities,
        settings,
        clothingStyles: [] // Don't include other styles - we only want this specific style
      }

      // Generate style-specific images (1 image per style)
      const influencerDataWithId = {
        ...influencerData,
        id: influencerId,
        style: styleName // Pass ONLY this style to the AI service
      }
      
      addGenerationLog(`Using style: ${styleName} (only this style will be used in generation)`, 'info')
      
      addGenerationLog(`Calling AI service to generate 1 image for ${styleName} style...`, 'info')
      updateGenerationProgress(20)
      
      // Generate EXACTLY 1 image for this specific style
      console.log(`🎯 Generating EXACTLY 1 image for style: ${styleName}`)
      const result = await aiAPI.generateTrainingImages(influencerDataWithId, 1)
      console.log(`✅ Generation request sent for style: ${styleName}, count: 1`)
      
      addGenerationLog('AI generation request sent successfully', 'success')
      updateGenerationProgress(40)
      
      // Add style to selected styles
      if (!selectedStyles.includes(styleName)) {
        const updatedStyles = [...selectedStyles, styleName]
        setSelectedStyles(updatedStyles)
        
        // Update influencer with the new style
        try {
          await influencersAPI.update(influencerId, {
            clothingStyles: updatedStyles,
            stylesChosen: updatedStyles.length
          })
          addGenerationLog(`Style "${styleName}" added to influencer profile`, 'success')
        } catch (err) {
          console.error('Error updating influencer styles:', err)
          addGenerationLog('Warning: Could not save style to influencer', 'warning')
        }
      }
      
      // Poll for progress - we're only generating 1 image, so check more frequently
      let pollCount = 0
      const maxPolls = 20 // Reduced since we only need 1 image
      const pollInterval = setInterval(async () => {
        pollCount++
        const progress = Math.min(40 + (pollCount / maxPolls) * 55, 95)
        updateGenerationProgress(progress)
        
        // Check every 2 polls (every 6 seconds) for the style image
        if (pollCount % 2 === 0) {
          try {
            const contentRes = await contentAPI.getByInfluencer(influencerId)
            if (contentRes.success) {
              setGeneratedContent(contentRes.data || [])
              
              // Check specifically for style_image with this style
              const styleImages = contentRes.data.filter(
                c => c && c.type === 'style_image' && c.style === styleName
              )
              
              if (styleImages.length >= 1) {
                // Found the style image! Complete the generation
                clearInterval(pollInterval)
                addGenerationLog(`✅ Found ${styleImages.length} image(s) for ${styleName} style!`, 'success')
                
                // Auto-update training progress
                if (currentInfluencerId) {
                  const newProgress = calculateTrainingProgress()
                  try {
                    await influencersAPI.update(influencerId, {
                      trainingProgress: newProgress,
                      imagesLocked: contentRes.data.filter(c => c && (c.type === 'training_image' || c.type === 'profile_image' || c.type === 'style_image')).length
                    })
                  } catch (err) {
                    console.error('Error updating progress:', err)
                  }
                }
                
                updateGenerationProgress(100)
                completeGeneration(true, `Successfully generated ${styleName} style image!`)
                setGeneratingStyleImages(false)
                
                // Auto-close modal after 1.5 seconds and scroll to Step 4
                setTimeout(() => {
                  setShowGenerationModal(false)
                  // Scroll to Step 4 after modal closes
                  setTimeout(() => {
                    if (step4Ref.current) {
                      step4Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }, 100)
                }, 1500)
                return
              } else {
                addGenerationLog(`Checking for ${styleName} style image... (${pollCount}/${maxPolls})`, 'info')
              }
            }
          } catch (err) {
            console.error('Error checking progress:', err)
            addGenerationLog(`Error checking progress: ${err.message}`, 'warning')
          }
        } else {
          addGenerationLog(`Waiting for image... (${pollCount}/${maxPolls})`, 'info')
        }
        
        // Timeout after max polls
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          addGenerationLog('Generation is taking longer than expected. The image may still be generating in the background.', 'warning')
          completeGeneration(true, `Generation started for ${styleName} style. Check "Generated Content" to see the result when it's ready.`)
          setGeneratingStyleImages(false)
          
          // Auto-close modal after 2 seconds and scroll to Step 4
          setTimeout(() => {
            setShowGenerationModal(false)
            // Scroll to Step 4 after modal closes
            setTimeout(() => {
              if (step4Ref.current) {
                step4Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }, 100)
          }, 2000)
        }
      }, 3000) // Poll every 3 seconds
      
    } catch (error) {
      console.error('Error generating style images:', error)
      addGenerationLog(`Error: ${error.message || 'Failed to generate images'}`, 'error')
      completeGeneration(false, error.message || 'Failed to generate images')
      setGeneratingStyleImages(false)
    }
  }

  // Generate profile image for current influencer
  const handleGenerateProfileImage = async () => {
    if (!influencerName || !gender || !age) {
      alert('Please fill in at least Name, Gender, and Age before generating profile image')
      return
    }

    setGeneratingProfile(true)
    startGeneration('Generating Profile Image')
    addGenerationLog(`Generating profile image for ${influencerName}...`, 'info')
    updateGenerationProgress(10)
    
    try {
      // Ensure influencer exists
      let influencerId = currentInfluencerId
      if (!influencerId) {
        const newInfluencer = {
          name: influencerName,
          description: description || 'Content Creator',
          gender,
          age,
          location: location || '',
          hairColor: hairColor || '',
          activities: activities || [],
          settings: settings || [],
          additionalInfo: additionalInfo || [],
          clothingStyles: selectedStyles || [],
          feedPosts: feedPosts || 0,
          storyPosts: storyPosts || 0,
          dailyContentEnabled: false,
          trainingProgress: 0,
          imagesLocked: 0,
          stylesChosen: selectedStyles.length || 0
        }
        const createRes = await influencersAPI.create(newInfluencer)
        influencerId = createRes.data.id
        setCurrentInfluencerId(influencerId)
      }

      const influencerData = {
        name: influencerName,
        description,
        gender,
        age,
        location,
        hairColor,
        activities,
        settings,
        clothingStyles: selectedStyles
      }

      addGenerationLog('Calling AI service to generate profile image...', 'info')
      updateGenerationProgress(30)
      
      // Generate profile image
      const profileRes = await aiAPI.generateProfile(influencerData)
      updateGenerationProgress(60)
      if (profileRes.success && profileRes.data.url) {
        const fullImageUrl = profileRes.data.url.startsWith('http') 
          ? profileRes.data.url 
          : `http://localhost:3001${profileRes.data.url}`
        setProfileImageUrl(fullImageUrl)
        
        // Update influencer with profile image
        try {
          await influencersAPI.update(influencerId, {
            imageUrl: fullImageUrl
          })
          
          // Add profile image as content
          await contentAPI.create({
            influencerId: influencerId,
            type: 'profile_image',
            url: profileRes.data.url,
            status: 'completed'
          })
          
          addGenerationLog('Profile image generated successfully!', 'success')
          updateGenerationProgress(80)
          
          // Refresh content
          const contentRes = await contentAPI.getByInfluencer(influencerId)
          if (contentRes.success) {
            setGeneratedContent(contentRes.data || [])
            
            // Auto-update training progress
            if (currentInfluencerId) {
              const newProgress = calculateTrainingProgress()
              try {
                await influencersAPI.update(influencerId, {
                  trainingProgress: newProgress,
                  imagesLocked: contentRes.data.filter(c => c && (c.type === 'training_image' || c.type === 'profile_image')).length
                })
                addGenerationLog('Training progress updated', 'success')
              } catch (err) {
                console.error('Error updating progress:', err)
                addGenerationLog('Warning: Could not update training progress', 'warning')
              }
            }
          }
          
          updateGenerationProgress(100)
          completeGeneration(true, 'Profile image generated and saved successfully!')
          
          // Auto-close modal after 1.5 seconds
          setTimeout(() => {
            setShowGenerationModal(false)
          }, 1500)
        } catch (err) {
          console.error('Error updating influencer:', err)
          completeGeneration(false, 'Profile image generated but failed to save. Please try again.')
        }
      } else {
        completeGeneration(false, 'Failed to generate profile image. Please try again.')
      }
    } catch (error) {
      console.error('Error generating profile image:', error)
      addGenerationLog(`Error: ${error.message || 'Failed to generate profile image'}`, 'error')
      completeGeneration(false, error.message || 'Failed to generate profile image')
    } finally {
      setGeneratingProfile(false)
    }
  }

  const handleUploadStyleImages = async (files, styleName) => {
    if (!files || files.length === 0) {
      alert('Please select at least one image')
      return
    }

    setUploadingStyleImages(true)
    try {
      // Ensure influencer exists
      let influencerId = currentInfluencerId
      if (!influencerId) {
        const newInfluencer = {
          name: influencerName,
          description: description || 'Content Creator',
          gender,
          age,
          location: location || '',
          hairColor: hairColor || '',
          activities: activities || [],
          settings: settings || [],
          additionalInfo: additionalInfo || [],
          clothingStyles: selectedStyles || [],
          feedPosts: feedPosts || 0,
          storyPosts: storyPosts || 0,
          dailyContentEnabled: false,
          trainingProgress: 0,
          imagesLocked: 0,
          stylesChosen: selectedStyles.length || 0
        }
        const createRes = await influencersAPI.create(newInfluencer)
        influencerId = createRes.data.id
        setCurrentInfluencerId(influencerId)
      }

      // Upload all files at once
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('image', file)
      })
      formData.append('influencerId', influencerId)
      formData.append('type', 'style_image')
      formData.append('style', styleName)

      const response = await fetch('http://localhost:3001/api/content/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to upload images' }))
        throw new Error(errorData.error || `Failed to upload images`)
      }

      const result = await response.json()
      
      // Add style to selected styles
      if (!selectedStyles.includes(styleName)) {
        const updatedStyles = [...selectedStyles, styleName]
        setSelectedStyles(updatedStyles)
        
        // Update influencer with the new style
        try {
          await influencersAPI.update(influencerId, {
            clothingStyles: updatedStyles,
            stylesChosen: updatedStyles.length
          })
          console.log(`✅ Style "${styleName}" added to influencer profile`)
        } catch (err) {
          console.error('Error updating influencer styles:', err)
        }
      }
      
      alert(`✅ Successfully uploaded ${result.count || files.length} image(s) for ${styleName} style!`)
      setStyleModalOpen(false)
      
      // Refresh content
      const contentRes = await contentAPI.getByInfluencer(influencerId)
      if (contentRes.success) {
        setGeneratedContent(contentRes.data || [])
        
        // Auto-update training progress
        if (currentInfluencerId) {
          const newProgress = calculateTrainingProgress()
          try {
            await influencersAPI.update(influencerId, {
              trainingProgress: newProgress,
              imagesLocked: contentRes.data.filter(c => c && (c.type === 'training_image' || c.type === 'profile_image')).length
            })
          } catch (err) {
            console.error('Error updating progress:', err)
          }
        }
      }
    } catch (error) {
      console.error('Error uploading style images:', error)
      alert(`Error: ${error.message || 'Failed to upload images'}`)
    } finally {
      setUploadingStyleImages(false)
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
        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading influencer data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : (
          <div className="flex gap-6">
            {/* Left Column - Main Content */}
            <div className="flex-1 space-y-6">
              {/* Training Studio Section */}
              <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link to="/influencers" className="text-sm text-gray-400 hover:text-white mb-4 inline-flex items-center space-x-1">
                      <HiChevronLeft className="w-4 h-4" />
                      <span>Back to Influencers</span>
                    </Link>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Training Studio
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-white">
                        {isEditMode ? `Edit ${influencerName || 'Influencer'}'s Profile` : 'Design an influencer your audience remembers'}
                      </h2>
                      <div className="flex items-center space-x-3">
                        {/* Auto-save notification badge */}
                        {saveStatus && (
                          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            saveStatus === 'saving' 
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : saveStatus === 'saved'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {saveStatus === 'saving' && (
                              <>
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <span>Saving...</span>
                              </>
                            )}
                            {saveStatus === 'saved' && (
                              <>
                                <HiCheckCircle className="w-4 h-4" />
                                <span>Saved</span>
                              </>
                            )}
                            {saveStatus === 'error' && (
                              <>
                                <span>⚠️ Error saving</span>
                              </>
                            )}
                          </div>
                        )}
                        <button
                          onClick={handleSave}
                          className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
                        >
                          {isEditMode ? 'Save Changes' : 'Create Influencer'}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">
                      Training teaches the model how your influencer looks, what they do daily, and how much content should drop. Upload consistent shots, describe the vibe, then lock in automations.
                    </p>
                    <div className="flex space-x-3">
                      <button className="bg-dark-card hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors border border-gray-800/30">
                        Continue training <HiChevronRight className="w-4 h-4 inline ml-1" />
                      </button>
                      <button className="bg-dark-card hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors border border-gray-800/30">
                        Watch training guide <HiChevronRight className="w-4 h-4 inline ml-1" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="ml-6 w-64">
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Training progress</span>
                        <span className="text-sm font-semibold text-white">{trainingProgress}%</span>
                      </div>
                      <div className="w-full bg-dark-card rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${trainingProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2">NEXT UP</p>
                      {trainingProgress < 100 ? (
                        <>
                          {!influencerName || !description || !gender || !age || !location ? (
                            <>
                              <p className="text-sm text-white font-medium mb-1">Complete Step 1: Basics</p>
                              <p className="text-xs text-gray-400">Fill in all required fields</p>
                            </>
                          ) : (!activities.length || !settings.length || !additionalInfo.length) ? (
                            <>
                              <p className="text-sm text-white font-medium mb-1">Complete Step 2: Influencer Profile</p>
                              <p className="text-xs text-gray-400">Add activities, settings, and info</p>
                            </>
                          ) : (!profileImageUrl && !contentArray.some(c => c && c.type === 'profile_image')) || 
                               contentArray.filter(c => c && c.type === 'training_image').length < 20 ? (
                            <>
                              <p className="text-sm text-white font-medium mb-1">Complete Step 3: Training Images</p>
                              <p className="text-xs text-gray-400">
                                {contentArray.filter(c => c && c.type === 'training_image').length}/20 training images
                              </p>
                            </>
                          ) : selectedStyles.length === 0 ? (
                            <>
                              <p className="text-sm text-white font-medium mb-1">Complete Step 4: Clothing Styles</p>
                              <p className="text-xs text-gray-400">Select at least one style</p>
                            </>
                          ) : (feedPosts === 0 && storyPosts === 0) ? (
                            <>
                              <p className="text-sm text-white font-medium mb-1">Complete Step 5: Content Plan</p>
                              <p className="text-xs text-gray-400">Set feed or story posts</p>
                            </>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-white font-medium mb-1">✅ Training Complete!</p>
                          <p className="text-xs text-gray-400">All steps completed</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 1: Basics */}
              <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">STEP 1: Basics</h3>
                    <p className="text-sm text-gray-400 mt-1">Name your influencer and add a short description</p>
                  </div>
                  {!isEditMode && (
                    <button
                      onClick={applyEmilyPellegriniStrategy}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-purple-600/30 border border-purple-400/20"
                    >
                      <HiOutlineSparkles className="w-5 h-5" />
                      <span>Apply Emily Strategy</span>
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Influencer Name</label>
                    <input
                      type="text"
                      value={influencerName}
                      onChange={(e) => {
                        setInfluencerName(e.target.value)
                        autoSave()
                      }}
                      className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value)
                        autoSave()
                      }}
                      className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter description"
                    />
                  </div>
                  
                  {/* Profile Image Generation */}
                  <div className="pt-4 border-t border-gray-800/30">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Profile Image</label>
                    {profileImageUrl ? (
                      <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <p className="text-sm text-green-400 mb-2">✓ Profile image generated!</p>
                        <button
                          onClick={() => setShowProfileImageModal(true)}
                          className="cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          <img src={profileImageUrl} alt="Profile" className="w-32 h-32 rounded-lg object-cover object-top" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleGenerateProfileImage}
                        disabled={generatingProfile || !influencerName || !gender || !age}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <HiOutlineSparkles className="w-5 h-5" />
                        <span>{generatingProfile ? 'Generating...' : 'Generate Profile Image with AI'}</span>
                      </button>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Generate a profile image based on the influencer's details</p>
                  </div>
                </div>
              </div>

              {/* Step 2: Influencer Profile */}
              <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                <h3 className="text-lg font-semibold text-white mb-4">STEP 2: Influencer Profile</h3>
                
                <div className="space-y-6">
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Gender</label>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          setGender('Male')
                          autoSave()
                        }}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          gender === 'Male'
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'bg-dark-card border-gray-800/30 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        onClick={() => {
                          setGender('Female')
                          autoSave()
                        }}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          gender === 'Female'
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'bg-dark-card border-gray-800/30 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setAge(Math.max(18, age - 1))
                          autoSave()
                        }}
                        className="w-10 h-10 bg-dark-card border border-gray-800/30 rounded-lg flex items-center justify-center text-white hover:bg-gray-700"
                      >
                        <HiMinus className="w-5 h-5" />
                      </button>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => {
                          setAge(parseInt(e.target.value) || 18)
                          autoSave()
                        }}
                        className="w-20 px-4 py-2 bg-dark-card border border-gray-800/30 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => {
                          setAge(age + 1)
                          autoSave()
                        }}
                        className="w-10 h-10 bg-dark-card border border-gray-800/30 rounded-lg flex items-center justify-center text-white hover:bg-gray-700"
                      >
                        <HiPlus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value)
                        autoSave()
                      }}
                      className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter location"
                    />
                  </div>

                  {/* Desired Hair Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Desired Hair Color</label>
                    <input
                      type="text"
                      value={hairColor}
                      onChange={(e) => {
                        setHairColor(e.target.value)
                        autoSave()
                      }}
                      className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. platinum blonde, honey brown"
                    />
                  </div>

                  {/* Activities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Activities (min 3)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {activities.map((activity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/30"
                        >
                          <span>{activity}</span>
                          <button
                            onClick={() => handleRemoveTag('activity', index, setActivities)}
                            className="hover:text-green-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault()
                          handleAddTag('activity', newActivity, setNewActivity, setActivities)
                        }
                      }}
                      className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Type and press enter or comma to add..."
                    />
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2 font-medium">💡 Quick suggestions - Click to add:</p>
                      <div className="flex flex-wrap gap-2">
                        {quickSuggestions.activities.map((suggestion, index) => {
                          const isAdded = activities.includes(suggestion)
                          return (
                            <button
                              key={index}
                              onClick={() => handleAddTag('activity', suggestion, setNewActivity, setActivities)}
                              disabled={isAdded}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                                isAdded
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed opacity-60'
                                  : 'bg-dark-card text-gray-300 border-gray-700 hover:border-purple-500/50 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer'
                              }`}
                            >
                              {isAdded ? '✓ ' : ''}{suggestion}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Settings/Sceneries */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Setting/Sceneries (min 3)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {settings.map((setting, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/30"
                        >
                          <span>{setting}</span>
                          <button
                            onClick={() => handleRemoveTag('setting', index, setSettings)}
                            className="hover:text-green-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={newSetting}
                      onChange={(e) => setNewSetting(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault()
                          handleAddTag('setting', newSetting, setNewSetting, setSettings)
                        }
                      }}
                      className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Type and press enter or comma to add..."
                    />
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2 font-medium">💡 Quick suggestions - Click to add:</p>
                      <div className="flex flex-wrap gap-2">
                        {quickSuggestions.settings.map((suggestion, index) => {
                          const isAdded = settings.includes(suggestion)
                          return (
                            <button
                              key={index}
                              onClick={() => handleAddTag('setting', suggestion, setNewSetting, setSettings)}
                              disabled={isAdded}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                                isAdded
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed opacity-60'
                                  : 'bg-dark-card text-gray-300 border-gray-700 hover:border-purple-500/50 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer'
                              }`}
                            >
                              {isAdded ? '✓ ' : ''}{suggestion}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Additional Information (min 3)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {additionalInfo.map((info, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/30"
                        >
                          <span>{info}</span>
                          <button
                            onClick={() => handleRemoveTag('info', index, setAdditionalInfo)}
                            className="hover:text-green-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={newInfo}
                      onChange={(e) => setNewInfo(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault()
                          handleAddTag('info', newInfo, setNewInfo, setAdditionalInfo)
                        }
                      }}
                      className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Type and press enter or comma to add..."
                    />
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2 font-medium">💡 Quick suggestions - Click to add:</p>
                      <div className="flex flex-wrap gap-2">
                        {quickSuggestions.additional.map((suggestion, index) => {
                          const isAdded = additionalInfo.includes(suggestion)
                          return (
                            <button
                              key={index}
                              onClick={() => handleAddTag('info', suggestion, setNewInfo, setAdditionalInfo)}
                              disabled={isAdded}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                                isAdded
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed opacity-60'
                                  : 'bg-dark-card text-gray-300 border-gray-700 hover:border-purple-500/50 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer'
                              }`}
                            >
                              {isAdded ? '✓ ' : ''}{suggestion}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Training Images */}
              <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">STEP 3: Training Images</h3>
                  {isEditMode && (
                    <button
                      onClick={async () => {
                        try {
                          const influencerId = currentInfluencerId || (editId ? parseInt(editId) : null)
                          if (!influencerId) {
                            alert('No influencer ID found')
                            return
                          }
                          const contentRes = await contentAPI.getByInfluencer(influencerId)
                          if (contentRes.success && contentRes.data) {
                            const contentArray = Array.isArray(contentRes.data) ? contentRes.data : []
                            const trainingImgs = contentArray
                              .filter(c => c && c.type === 'training_image')
                              .sort((a, b) => {
                                if (a.createdAt && b.createdAt) {
                                  return new Date(a.createdAt) - new Date(b.createdAt)
                                }
                                return (a.id || 0) - (b.id || 0)
                              })
                              .map(c => c.url && c.url.startsWith('http') ? c.url : `http://localhost:3001${c.url}`)
                            setGeneratedContent(contentArray)
                            setTrainingImages(trainingImgs)
                            console.log(`✅ Refreshed: Found ${trainingImgs.length} training images`)
                            if (trainingImgs.length > 0) {
                              alert(`✅ Refreshed! Found ${trainingImgs.length} training images.`)
                            } else {
                              alert('No training images found yet. They may still be generating.')
                            }
                          }
                        } catch (err) {
                          console.error('Error refreshing:', err)
                          alert('Error refreshing content')
                        }
                      }}
                      className="bg-dark-card hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-gray-800/30 flex items-center space-x-2"
                    >
                      <HiOutlineRefresh className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-gray-400 mb-6">You need 20 training images. Choose one of the options below:</p>

                {/* Preview Prompts Button */}
                {!trainingImageMethod && trainingImages.length === 0 && (
                  <div className="mb-4">
                    <button
                      onClick={generatePromptPreview}
                      className="bg-dark-card hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-gray-800/30 flex items-center space-x-2"
                    >
                      <HiOutlineEye className="w-5 h-5" />
                      <span>Preview Prompts Before Generation</span>
                    </button>
                  </div>
                )}

                {/* Two Options */}
                {!trainingImageMethod && trainingImages.length === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Option 1: Generate with AI */}
                    <button
                      onClick={handleGenerateTrainingImages}
                      disabled={generating}
                      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex flex-col items-center justify-center space-y-2 border border-purple-400/20"
                    >
                      <HiOutlineSparkles className="w-8 h-8" />
                      <span className="text-lg">Generate 20 photos with AI</span>
                      <span className="text-sm text-purple-100">AI will create diverse training images based on your profile data</span>
                    </button>

                    {/* Option 2: Upload */}
                    <label className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/30 cursor-pointer text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex flex-col items-center justify-center space-y-2 border border-blue-400/20">
                      <HiOutlineCloudUpload className="w-8 h-8" />
                      <span className="text-lg">Upload 20 photos</span>
                      <span className="text-sm text-blue-100">Upload your own training images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleUploadTrainingImages(e.target.files)}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                    </label>
                  </div>
                )}

                {/* Show status when method is selected */}
                {trainingImageMethod === 'ai' && generating && (
                  <div className="mb-4 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                    <p className="text-sm text-purple-400">🔄 Generating 20 training images with AI... This may take a few minutes.</p>
                  </div>
                )}

                {trainingImageMethod === 'upload' && uploadingImages && (
                  <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-400">🔄 Uploading images...</p>
                  </div>
                )}

                <div className="mb-4">
                  <button className="text-sm text-gray-400 hover:text-white flex items-center space-x-1">
                    <span>Training Image Guidelines</span>
                    <HiChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {trainingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-green-400 mb-2">✓ {trainingImages.length} training image(s) uploaded</p>
                  </div>
                )}

                {isEditMode && trainingImages.length > 0 && trainingImages.length < 20 && (
                  <div className="mb-4 p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-400 font-medium mb-1">
                          Missing {20 - trainingImages.length} training image(s)
                        </p>
                        <p className="text-xs text-orange-300">
                          Generate only the missing images to complete your training set
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateMissingTrainingImages}
                        disabled={generating}
                        className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-lg shadow-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
                      >
                        <HiOutlineSparkles className="w-5 h-5" />
                        <span>{generating ? 'Generating...' : `Generate ${20 - trainingImages.length} Missing`}</span>
                      </button>
                    </div>
                  </div>
                )}

                {isEditMode && trainingImages.length > 0 && trainingImages.length === 20 && (
                  <p className="text-sm text-yellow-400 mb-4">Images cannot be modified in edit mode</p>
                )}

                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const hasImage = i < trainingImages.length
                    // Show loading on the first empty slot when generating
                    const isLoading = generating && !hasImage && i === trainingImages.length
                    
                    // Find the content object for this image
                    const trainingImageContent = hasImage 
                      ? generatedContent
                          .filter(c => c && c.type === 'training_image')
                          .sort((a, b) => {
                            if (a.createdAt && b.createdAt) {
                              return new Date(a.createdAt) - new Date(b.createdAt)
                            }
                            return (a.id || 0) - (b.id || 0)
                          })[i]
                      : null
                    
                    return (
                      <div 
                        key={i} 
                        className={`aspect-square bg-dark-card rounded-lg border border-gray-800/30 overflow-hidden relative ${
                          hasImage ? 'cursor-pointer hover:border-purple-500/50 transition-all' : ''
                        }`}
                        onClick={() => {
                          if (hasImage && trainingImageContent) {
                            setSelectedTrainingImage(trainingImageContent)
                            setCustomPrompt(trainingImageContent.prompt || '')
                            setTrainingImageModalOpen(true)
                          }
                        }}
                      >
                        {hasImage ? (
                          <>
                            <img 
                              src={trainingImages[i]} 
                              alt={`Training ${i + 1}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                              <span className="text-white text-sm font-medium">Click to view/edit</span>
                            </div>
                          </>
                        ) : isLoading ? (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border-2 border-purple-500/50">
                            <div className="flex flex-col items-center space-y-2">
                              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs text-purple-400 font-medium">Generating...</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                            <span className="text-2xl opacity-50">📷</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Step 4: Clothing Style */}
              <div ref={step4Ref} className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                <h3 className="text-lg font-semibold text-white mb-4">STEP 4: Clothing Style</h3>
                <p className="text-sm text-gray-400 mb-6">Style (Select up to 4)</p>
                <div className="grid grid-cols-3 gap-4">
                  {clothingStyles.map((style) => {
                    // Find the generated image for this EXACT style (case-sensitive, exact match)
                    // CRITICAL: Only get ONE image per style - NEVER combine multiple images
                    const styleImages = generatedContent.filter(
                      c => c && 
                           c.type === 'style_image' && 
                           c.style && 
                           String(c.style).trim().toUpperCase() === String(style.name).trim().toUpperCase()
                    )
                    
                    // Get ONLY the FIRST (oldest) image for this style
                    // NEVER combine or show multiple images - always just ONE single image
                    const styleImage = styleImages.length > 0 
                      ? styleImages.sort((a, b) => {
                          // Sort by createdAt (oldest first) or by id (lowest first) to get the original
                          if (a.createdAt && b.createdAt) {
                            return new Date(a.createdAt) - new Date(b.createdAt)
                          }
                          return (a.id || 0) - (b.id || 0)
                        })[0] // ALWAYS take only the first one - NEVER combine multiple images
                      : null
                    
                    // Log to ensure we're only using one image
                    if (styleImages.length > 1) {
                      console.warn(`⚠️ Found ${styleImages.length} images for style "${style.name}", using only the oldest one (ID: ${styleImage?.id}). Others will be ignored.`)
                    }
                    
                    // Get the URL for ONLY this one image
                    const imageUrl = styleImage?.url 
                      ? (styleImage.url.startsWith('http') 
                          ? styleImage.url 
                          : `http://localhost:3001${styleImage.url}`)
                      : null
                    
                    return (
                      <button
                        key={style.name}
                        onClick={() => handleStyleClick(style.name)}
                        className={`relative aspect-square bg-dark-card rounded-full border-2 flex flex-col items-center justify-center transition-all overflow-hidden ${
                          selectedStyles.includes(style.name)
                            ? 'border-purple-500 ring-2 ring-purple-500/50'
                            : 'border-gray-800/30 hover:border-gray-600'
                        }`}
                      >
                        {/* CRITICAL: Only render ONE image - never multiple */}
                        {imageUrl ? (
                          <img 
                            key={`style-img-${styleImage.id}`} // Use unique key to prevent multiple renders
                            src={imageUrl} 
                            alt={style.name}
                            className="w-full h-full object-cover rounded-full"
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} // Ensure only one image is visible
                            onError={(e) => {
                              // If image fails to load, hide it and show text instead
                              e.target.style.display = 'none'
                              const parent = e.target.parentElement
                              if (parent) {
                                const fallback = parent.querySelector('.style-fallback')
                                if (fallback) fallback.style.display = 'flex'
                              }
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden style-fallback' : ''}`}>
                          <span className="text-xs text-gray-500 font-medium">{style.name}</span>
                        </div>
                        {selectedStyles.includes(style.name) && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center z-10 shadow-lg">
                            <HiCheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Style Selection Modal */}
              {styleModalOpen && selectedStyleForModal && (() => {
                // Check if there's already an image for this style
                const existingStyleImages = generatedContent.filter(
                  c => c && c.type === 'style_image' && c.style === selectedStyleForModal
                )
                const hasExistingImage = existingStyleImages.length > 0
                
                return (
                  <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setStyleModalOpen(false)
                      }
                    }}
                  >
                    <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-white/10">
                      {/* Close Button */}
                      <button
                        onClick={() => setStyleModalOpen(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                      >
                        <HiX className="w-6 h-6" />
                      </button>

                      <h3 className="text-2xl font-bold text-white mb-2">
                        {hasExistingImage ? 'Regenerate' : 'Add'} {selectedStyleForModal} Style
                      </h3>
                      <p className="text-sm text-gray-400 mb-6">
                        {hasExistingImage 
                          ? `You already have ${existingStyleImages.length} image(s) for this style. Choose an option:`
                          : 'Choose how you want to add images for this style'
                        }
                      </p>

                      <div className="space-y-4">
                        {hasExistingImage && (
                          /* Option 0: Regenerate with AI (replaces existing) */
                          <button
                            onClick={() => handleRegenerateStyleImages(selectedStyleForModal)}
                            disabled={generatingStyleImages}
                            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-lg shadow-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex flex-col items-center justify-center space-y-2 border border-orange-400/20"
                          >
                            <HiOutlineRefresh className="w-8 h-8" />
                            <span className="text-lg">Regenerate with AI</span>
                            <span className="text-sm text-orange-100">Replace existing image(s) with a new AI-generated image</span>
                            {generatingStyleImages && (
                              <span className="text-sm text-orange-200">Regenerating...</span>
                            )}
                          </button>
                        )}
                        
                        {/* Option 1: Generate with AI */}
                        <button
                          onClick={() => handleGenerateStyleImages(selectedStyleForModal)}
                          disabled={generatingStyleImages}
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex flex-col items-center justify-center space-y-2 border border-purple-400/20"
                        >
                          <HiOutlineSparkles className="w-8 h-8" />
                          <span className="text-lg">{hasExistingImage ? 'Generate Another' : 'Generate with AI'}</span>
                          <span className="text-sm text-purple-100">AI will create images based on your profile and {selectedStyleForModal} style</span>
                          {generatingStyleImages && (
                            <span className="text-sm text-purple-200">Generating...</span>
                          )}
                        </button>

                      {/* Option 2: Upload */}
                      <label className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/30 cursor-pointer text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex flex-col items-center justify-center space-y-2 border border-blue-400/20">
                        <HiOutlineCloudUpload className="w-8 h-8" />
                        <span className="text-lg">Upload Images</span>
                        <span className="text-sm text-blue-100">Upload your own {selectedStyleForModal} style images</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleUploadStyleImages(e.target.files, selectedStyleForModal)
                            }
                          }}
                          className="hidden"
                          disabled={uploadingStyleImages}
                        />
                        {uploadingStyleImages && (
                          <span className="text-sm text-blue-200">Uploading...</span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
                )
              })()}

              {/* Prompt Preview Modal */}
              {showPromptPreview && previewPrompts.length > 0 && (
                <div 
                  className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowPromptPreview(false)
                    }
                  }}
                >
                  <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full border border-white/10 max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Close Button */}
                    <button
                      onClick={() => setShowPromptPreview(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                    >
                      <HiX className="w-6 h-6" />
                    </button>

                    <h3 className="text-2xl font-bold text-white mb-2">Training Image Prompts Preview</h3>
                    <p className="text-sm text-gray-400 mb-6">
                      Review the prompts that will be used to generate your 20 training images. These are optimized based on your profile data.
                    </p>

                    {/* Prompts List */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                      {previewPrompts.map((item) => (
                        <div key={item.number} className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-semibold">
                                Image {item.number}/20
                              </span>
                              <span className="text-xs text-gray-400">
                                {item.outfit} • {item.setting}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 font-mono bg-dark-surface/50 p-3 rounded border border-gray-800/30">
                            {item.prompt}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-4 mt-6 pt-6 border-t border-gray-800/50">
                      <button
                        onClick={() => {
                          setShowPromptPreview(false)
                          handleGenerateTrainingImages()
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                      >
                        Generate with These Prompts
                      </button>
                      <button
                        onClick={() => setShowPromptPreview(false)}
                        className="px-6 py-3 bg-dark-card hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors border border-gray-800/30"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Training Image Modal */}
              {trainingImageModalOpen && selectedTrainingImage && (() => {
                const imageUrl = selectedTrainingImage.url?.startsWith('http') 
                  ? selectedTrainingImage.url 
                  : `http://localhost:3001${selectedTrainingImage.url}`
                
                return (
                  <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setTrainingImageModalOpen(false)
                      }
                    }}
                  >
                    <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto">
                      {/* Close Button */}
                      <button
                        onClick={() => setTrainingImageModalOpen(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                      >
                        <HiX className="w-6 h-6" />
                      </button>

                      <h3 className="text-2xl font-bold text-white mb-4">
                        Training Image #{generatedContent.filter(c => c && c.type === 'training_image').findIndex(c => c.id === selectedTrainingImage.id) + 1}
                      </h3>

                      {/* Image Preview */}
                      <div className="mb-6">
                        <img 
                          src={imageUrl} 
                          alt="Training Image" 
                          className="w-full rounded-lg border border-gray-800/30"
                        />
                      </div>

                      {/* Prompt Section */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Prompt / Description
                        </label>
                        <textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px]"
                          placeholder="Enter or modify the prompt used to generate this image..."
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          Modify the prompt to change how this image is regenerated
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-4">
                        <button
                          onClick={handleRegenerateTrainingImage}
                          disabled={regeneratingTrainingImage}
                          className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-lg shadow-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <HiOutlineRefresh className="w-5 h-5" />
                          <span>{regeneratingTrainingImage ? 'Regenerating...' : 'Regenerate with AI'}</span>
                        </button>
                        <button
                          onClick={() => setTrainingImageModalOpen(false)}
                          className="px-6 py-4 bg-dark-card hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors border border-gray-800/30"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Step 5: Daily Automatic Content Output */}
              <div className="relative group">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-purple-gradient rounded-2xl opacity-50 blur-xl"></div>
                {/* Glass Card */}
                <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-6 gradient-border-card">
                  <h3 className="text-lg font-semibold text-white mb-4">STEP 5: Daily Automatic Content Output</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Set how many Feed posts, Stories, and Reels you want to automate daily to get your income.
                  </p>
                  
                  <div className="space-y-6">
                    {/* Images */}
                    <div className="bg-dark-card backdrop-blur-sm rounded-xl p-4 gradient-border-card">
                      <h4 className="text-sm font-semibold text-white mb-4">Images</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Feed Posts</span>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={feedPosts}
                              onChange={(e) => {
                                setFeedPosts(parseInt(e.target.value))
                                autoSave()
                              }}
                              className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <span className="text-sm text-white font-medium w-8 text-center">{feedPosts}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Story Posts</span>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={storyPosts}
                              onChange={(e) => {
                                setStoryPosts(parseInt(e.target.value))
                                autoSave()
                              }}
                              className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <span className="text-sm text-white font-medium w-8 text-center">{storyPosts}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Videos */}
                    <div className="bg-dark-card backdrop-blur-sm rounded-xl p-4 gradient-border-card">
                      <h4 className="text-sm font-semibold text-white mb-4">Videos</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">6-Second Videos</span>
                          <div className="flex items-center space-x-3">
                            <input 
                              type="range" 
                              min="0" 
                              max="10" 
                              value="0" 
                              className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <span className="text-sm text-white font-medium w-8 text-center">0</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">15-Second Videos</span>
                          <div className="flex items-center space-x-3">
                            <input 
                              type="range" 
                              min="0" 
                              max="10" 
                              value="0" 
                              className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <span className="text-sm text-white font-medium w-8 text-center">0</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">30-Second Videos</span>
                          <div className="flex items-center space-x-3">
                            <input 
                              type="range" 
                              min="0" 
                              max="10" 
                              value="0" 
                              className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <span className="text-sm text-white font-medium w-8 text-center">0</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trends Studio */}
                    <div className="bg-dark-card backdrop-blur-sm rounded-xl p-4 gradient-border-card">
                      <h4 className="text-sm font-semibold text-white mb-2">Trends Studio</h4>
                      <p className="text-xs text-gray-400 mb-4">Viral reels powered by trending reference videos</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Daily Trends</span>
                        <div className="flex items-center space-x-3">
                          <input 
                            type="range" 
                            min="0" 
                            max="10" 
                            value="0" 
                            className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                          <span className="text-sm text-white font-medium w-8 text-center">0</span>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Video Modes */}
                    <div className="bg-dark-card backdrop-blur-sm rounded-xl p-4 gradient-border-card">
                      <h4 className="text-sm font-semibold text-white mb-4">Advanced Video Modes</h4>
                      <div className="space-y-4">
                        {['Multi-Angle', 'Pause Challenge', 'Outfit Changer', 'Before & After'].map((mode) => (
                          <div key={mode} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{mode}</span>
                            <div className="flex items-center space-x-3">
                              <input 
                                type="range" 
                                min="0" 
                                max="10" 
                                value="0" 
                                className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                              />
                              <span className="text-sm text-white font-medium w-8 text-center">0</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Training Checklist */}
            <div className="w-80 space-y-6">
              <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50 sticky top-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">Training checklist</h3>
                    <span className="text-sm font-semibold text-white">{trainingProgress}%</span>
                  </div>
                  <div className="w-full bg-dark-card rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-purple-500 h-2 rounded-full"
                      style={{ width: `${trainingProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Images locked:</span>
                      <span className="text-white font-medium">{imagesLocked}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Styles chosen:</span>
                      <span className="text-white font-medium">{stylesChosen}/4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Automation credits:</span>
                      <span className="text-white font-medium">{automationCredits}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {checklistItems.map((item) => (
                    <div key={item.num} className="flex items-start space-x-3">
                      {item.completed ? (
                        <HiCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <HiOutlineCheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm text-white font-medium">{item.num}. {item.title}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
          
          {/* Fixed Bottom Button */}
          <div className="fixed bottom-6 right-6">
            <button 
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              {isEditMode ? 'Save Changes' : 'Create Influencer'}
            </button>
          </div>
        </div>
      </div>

      {/* Generation Progress Modal */}
      {showGenerationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-surface rounded-2xl border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
              <div>
                <h3 className="text-xl font-semibold text-white">{generationTitle}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {generationStatus === 'generating' && `Progress: ${generationProgress.toFixed(0)}%`}
                  {generationStatus === 'completed' && 'Generation completed!'}
                  {generationStatus === 'error' && 'Generation failed'}
                </p>
              </div>
              {generationStatus !== 'generating' && (
                <button
                  onClick={() => {
                    setShowGenerationModal(false)
                    // If this was a style image generation, scroll to Step 4
                    if (generatingStyleImages || generationTitle.includes('Style')) {
                      setTimeout(() => {
                        if (step4Ref.current) {
                          step4Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      }, 100)
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
                {generationStatus === 'completed' && 'Generation completed successfully!'}
                {generationStatus === 'error' && 'An error occurred during generation'}
              </div>
              {generationStatus === 'completed' && (
                <button
                  onClick={() => {
                    setShowGenerationModal(false)
                    // If this was a style image generation, scroll to Step 4 instead of reloading
                    if (generatingStyleImages || generationTitle.includes('Style')) {
                      setTimeout(() => {
                        if (step4Ref.current) {
                          step4Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      }, 100)
                    } else {
                      window.location.reload()
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
                >
                  Close
                </button>
              )}
              {generationStatus === 'error' && (
                <button
                  onClick={() => {
                    setShowGenerationModal(false)
                    // If this was a style image generation, scroll to Step 4
                    if (generatingStyleImages || generationTitle.includes('Style')) {
                      setTimeout(() => {
                        if (step4Ref.current) {
                          step4Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      }, 100)
                    }
                  }}
                  className="bg-dark-card hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors border border-gray-800/30"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Image Modal Gallery */}
      {showProfileImageModal && profileImageUrl && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProfileImageModal(false)
            }
          }}
        >
          <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-6 max-w-4xl w-full border border-white/10">
            {/* Close Button */}
            <button
              onClick={() => setShowProfileImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-dark-surface hover:bg-gray-700 text-white p-3 rounded-full transition-colors border border-gray-800/30"
              aria-label="Close gallery"
            >
              <HiX className="w-6 h-6" />
            </button>

            {/* Image Container */}
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-2xl font-bold text-white mb-4">Profile Image</h3>
              
              {/* Large Image */}
              <div className="relative w-full max-w-2xl mb-6">
                <img 
                  src={profileImageUrl} 
                  alt={`${influencerName || 'Influencer'} Profile`}
                  className="w-full h-auto rounded-xl object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Image Info */}
              <div className="w-full max-w-2xl bg-dark-card backdrop-blur-sm rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-400">Influencer</p>
                    <p className="text-lg font-semibold text-white">{influencerName || 'Unknown'}</p>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                    Profile Image
                  </span>
                </div>
                {description && (
                  <p className="text-sm text-gray-400 mt-2">{description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Influencers


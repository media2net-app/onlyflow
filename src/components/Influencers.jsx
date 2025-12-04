import { useState, useEffect } from 'react'
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
  const [generatingProfile, setGeneratingProfile] = useState(false)
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('idle') // idle, generating, completed, error
  const [generationLog, setGenerationLog] = useState([])
  const [generationTitle, setGenerationTitle] = useState('Generating...')
  const [showProfileImageModal, setShowProfileImageModal] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'saving', 'saved', 'error'
  const [saveTimeout, setSaveTimeout] = useState(null)

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
        
        if (influencerRes.success && influencerRes.data) {
          const inf = influencerRes.data
          setCurrentInfluencerId(inf.id)
          setInfluencerName(inf.name || '')
          setDescription(inf.description || '')
          setGender(inf.gender || 'Female')
          setAge(inf.age || 24)
          setLocation(inf.location || '')
          setHairColor(inf.hairColor || '')
          setActivities(Array.isArray(inf.activities) ? inf.activities : [])
          setSettings(Array.isArray(inf.settings) ? inf.settings : [])
          setAdditionalInfo(Array.isArray(inf.additionalInfo) ? inf.additionalInfo : [])
          setSelectedStyles(Array.isArray(inf.clothingStyles) ? inf.clothingStyles : (Array.isArray(inf.stylesChosen) ? inf.stylesChosen : []))
          setFeedPosts(inf.feedPosts || 0)
          setStoryPosts(inf.storyPosts || 0)
          
          if (inf.imageUrl) {
            const fullImageUrl = inf.imageUrl.startsWith('http') 
              ? inf.imageUrl 
              : `http://localhost:3001${inf.imageUrl}`
            setProfileImageUrl(fullImageUrl)
          }
        } else {
          setError(influencerRes.error || 'Failed to load influencer data')
        }
        
        if (contentRes.success && contentRes.data) {
          setGeneratedContent(Array.isArray(contentRes.data) ? contentRes.data : [])
          
          // Load training images from content
          const contentArray = Array.isArray(contentRes.data) ? contentRes.data : []
          const trainingImgs = contentArray
            .filter(c => c && (c.type === 'training_image' || c.type === 'profile_image'))
            .map(c => c.url && c.url.startsWith('http') ? c.url : `http://localhost:3001${c.url}`)
          setTrainingImages(trainingImgs)
          
          // Auto-select styles from existing style_image content
          const styleImages = contentArray.filter(c => c && c.type === 'style_image' && c.style)
          if (styleImages.length > 0) {
            const foundStyles = [...new Set(styleImages.map(c => c.style).filter(Boolean))]
            if (foundStyles.length > 0) {
              // Merge with existing selected styles
              const currentStyles = Array.isArray(inf.clothingStyles) ? inf.clothingStyles : []
              const mergedStyles = [...new Set([...currentStyles, ...foundStyles])]
              setSelectedStyles(mergedStyles)
              
              // Update influencer with merged styles if different
              if (mergedStyles.length !== currentStyles.length || 
                  mergedStyles.some(s => !currentStyles.includes(s))) {
                try {
                  await influencersAPI.update(inf.id, {
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
      } catch (err) {
        console.error('Error loading influencer data:', err)
        setError(err.message || 'Failed to load influencer data')
      } finally {
        setLoading(false)
      }
    }
    
    loadInfluencerData()
  }, [isEditMode, editId])

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
      
      // Poll for progress
      let pollCount = 0
      const maxPolls = 60
      const pollInterval = setInterval(async () => {
        pollCount++
        const progress = Math.min(50 + (pollCount / maxPolls) * 45, 95)
        updateGenerationProgress(progress)
        addGenerationLog(`Checking progress... (${pollCount}/${maxPolls})`, 'info')
        
        if (pollCount % 10 === 0) {
          try {
            const contentRes = await contentAPI.getByInfluencer(influencerId)
            if (contentRes.success) {
              const trainingCount = contentRes.data.filter(c => c && c.type === 'training_image').length
              addGenerationLog(`Found ${trainingCount}/25 training images so far...`, 'info')
              
              if (trainingCount >= 25) {
                clearInterval(pollInterval)
                setGeneratedContent(contentRes.data || [])
                const trainingImgs = contentRes.data
                  .filter(c => c.type === 'training_image' || c.type === 'profile_image')
                  .map(c => c.url.startsWith('http') ? c.url : `http://localhost:3001${c.url}`)
                setTrainingImages(trainingImgs)
                
                updateGenerationProgress(100)
                completeGeneration(true, 'All images generated successfully!')
                setGenerating(false)
              } else {
                setGeneratedContent(contentRes.data || [])
                const trainingImgs = contentRes.data
                  .filter(c => c.type === 'training_image' || c.type === 'profile_image')
                  .map(c => c.url.startsWith('http') ? c.url : `http://localhost:3001${c.url}`)
                setTrainingImages(trainingImgs)
              }
            }
          } catch (err) {
            console.error('Error checking progress:', err)
          }
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
  const handleGenerateTrainingImages = async () => {
    if (!influencerName || !gender || !age) {
      alert('Please fill in at least Name, Gender, and Age before generating')
      return
    }

    setGenerating(true)
    setTrainingImageMethod('ai')
    startGeneration('Generating 20 Training Images')
    addGenerationLog(`Generating 20 training images for ${influencerName}...`, 'info')
    addGenerationLog('This may take several minutes. Please wait...', 'info')
    updateGenerationProgress(5)
    
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
      
      // Start generation in background
      aiAPI.generateTrainingImages(influencerDataWithId, 20)
        .then(() => {
          addGenerationLog('AI generation request sent successfully', 'success')
          updateGenerationProgress(30)
        })
        .catch(err => {
          addGenerationLog(`Error: ${err.message}`, 'error')
          completeGeneration(false, err.message || 'Failed to start generation')
        })
      
      // Poll for progress updates
      let pollCount = 0
      const maxPolls = 60 // Poll for up to 3 minutes
      const pollInterval = setInterval(async () => {
        pollCount++
        const progress = Math.min(30 + (pollCount / maxPolls) * 60, 90)
        updateGenerationProgress(progress)
        addGenerationLog(`Checking progress... (${pollCount}/${maxPolls})`, 'info')
        
        // Check content every 10 polls (every 20 seconds)
        if (pollCount % 10 === 0) {
          try {
            const contentRes = await contentAPI.getByInfluencer(influencerId)
            if (contentRes.success) {
              const trainingCount = contentRes.data.filter(c => c && c.type === 'training_image').length
              addGenerationLog(`Found ${trainingCount}/20 training images so far...`, 'info')
              
              if (trainingCount >= 20) {
                clearInterval(pollInterval)
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
                
                updateGenerationProgress(100)
                completeGeneration(true, 'All 20 training images generated successfully!')
                setGenerating(false)
              } else {
                setGeneratedContent(contentRes.data || [])
                const trainingImgs = contentRes.data
                  .filter(c => c.type === 'training_image')
                  .map(c => c.url.startsWith('http') ? c.url : `http://localhost:3001${c.url}`)
                setTrainingImages(trainingImgs)
              }
            }
          } catch (err) {
            console.error('Error checking progress:', err)
          }
        }
        
        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          addGenerationLog('Generation is taking longer than expected. Images may still be generating in the background.', 'warning')
          completeGeneration(true, 'Generation started. Check "Generated Content" to see results as they appear.')
          setGenerating(false)
        }
      }, 3000) // Poll every 3 seconds
      
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
    // If already selected, just toggle it off
    if (selectedStyles.includes(styleName)) {
      toggleStyle(styleName)
    } else {
      // Open modal to choose upload or AI generation
      setSelectedStyleForModal(styleName)
      setStyleModalOpen(true)
    }
  }

  const handleGenerateStyleImages = async (styleName) => {
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

    // Check if images already exist for this style
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
      
      // Poll for progress
      let pollCount = 0
      const maxPolls = 40
      const pollInterval = setInterval(async () => {
        pollCount++
        const progress = Math.min(40 + (pollCount / maxPolls) * 50, 90)
        updateGenerationProgress(progress)
        addGenerationLog(`Checking progress... (${pollCount}/${maxPolls})`, 'info')
        
        if (pollCount % 5 === 0) {
          try {
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
          } catch (err) {
            console.error('Error checking progress:', err)
          }
        }
        
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          addGenerationLog('Generation started. Images may still be generating in the background.', 'info')
          completeGeneration(true, `Generation started for ${styleName} style! Check "Generated Content" to see results.`)
          setGeneratingStyleImages(false)
        }
      }, 3000)
      
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
                <h3 className="text-lg font-semibold text-white mb-4">STEP 1: Basics</h3>
                <p className="text-sm text-gray-400 mb-6">Name your influencer and add a short description</p>
                
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
                </div>
                
                <p className="text-sm text-gray-400 mb-6">You need 20 training images. Choose one of the options below:</p>

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

                {isEditMode && trainingImages.length > 0 && (
                  <p className="text-sm text-yellow-400 mb-4">Images cannot be modified in edit mode</p>
                )}

                <div className="grid grid-cols-4 gap-3">
                  {trainingImages.length > 0 ? (
                    trainingImages.map((img, i) => (
                      <div key={i} className="aspect-square bg-dark-card rounded-lg border border-gray-800/30 overflow-hidden">
                        <img src={img} alt={`Training ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-dark-card rounded-lg border border-gray-800/30 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                          <span className="text-2xl">📷</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Step 4: Clothing Style */}
              <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                <h3 className="text-lg font-semibold text-white mb-4">STEP 4: Clothing Style</h3>
                <p className="text-sm text-gray-400 mb-6">Style (Select up to 4)</p>
                <div className="grid grid-cols-3 gap-4">
                  {clothingStyles.map((style) => (
                    <button
                      key={style.name}
                      onClick={() => handleStyleClick(style.name)}
                      className={`relative aspect-square bg-dark-card rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                        selectedStyles.includes(style.name)
                          ? 'border-purple-500 ring-2 ring-purple-500/50'
                          : 'border-gray-800/30 hover:border-gray-600'
                      }`}
                    >
                      <span className="text-4xl mb-2">{style.image}</span>
                      <span className="text-xs text-white font-medium">{style.name}</span>
                      {selectedStyles.includes(style.name) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <HiCheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selection Modal */}
              {styleModalOpen && selectedStyleForModal && (
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
                      Add {selectedStyleForModal} Style
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                      Choose how you want to add images for this style
                    </p>

                    <div className="space-y-4">
                      {/* Option 1: Generate with AI */}
                      <button
                        onClick={() => handleGenerateStyleImages(selectedStyleForModal)}
                        disabled={generatingStyleImages}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex flex-col items-center justify-center space-y-2 border border-purple-400/20"
                      >
                        <HiOutlineSparkles className="w-8 h-8" />
                        <span className="text-lg">Generate with AI</span>
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
              )}

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
                  onClick={() => setShowGenerationModal(false)}
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
                    window.location.reload()
                  }}
                  className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
                >
                  Close
                </button>
              )}
              {generationStatus === 'error' && (
                <button
                  onClick={() => setShowGenerationModal(false)}
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


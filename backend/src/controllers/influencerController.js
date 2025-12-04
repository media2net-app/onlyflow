// Import storage service
import { 
  initializeStorage, 
  loadInfluencers, 
  saveInfluencers 
} from '../services/storageService.js'

// Influencers array - loaded from storage
export let influencers = []

// Initialize influencers from storage on module load
const initializeInfluencers = async () => {
  try {
    await initializeStorage()
    influencers = await loadInfluencers()
    console.log(`✅ Loaded ${influencers.length} influencer(s) from storage`)
    
    // Ensure we have at least the default Mila influencer
    if (influencers.length === 0) {
      influencers = [
        {
          id: 1,
          name: 'Mila',
          description: 'Content Creator',
          image: 'M',
          imageUrl: '/storage/profile_mila.jpg',
          gender: 'Female',
          age: 24,
          location: 'Los Angeles',
          feedPosts: 2,
          storyPosts: 0,
          video5s: 0,
          video8s: 0,
          captionVideo: false,
          trendsVideos: 0,
          multiAngle: 0,
          pauseChallenge: 0,
          outfitChanger: 0,
          beforeAfter: 0,
          dailyContentEnabled: true,
          trainingProgress: 60,
          imagesLocked: 11,
          stylesChosen: 2,
          createdAt: new Date().toISOString()
        }
      ]
      await saveInfluencers(influencers)
    }
  } catch (error) {
    console.error('Error initializing influencers:', error)
    // Fallback to default
    influencers = [
      {
        id: 1,
        name: 'Mila',
        description: 'Content Creator',
        image: 'M',
        imageUrl: '/storage/profile_mila.jpg',
        gender: 'Female',
        age: 24,
        location: 'Los Angeles',
        feedPosts: 2,
        storyPosts: 0,
        video5s: 0,
        video8s: 0,
        captionVideo: false,
        trendsVideos: 0,
        multiAngle: 0,
        pauseChallenge: 0,
        outfitChanger: 0,
        beforeAfter: 0,
        dailyContentEnabled: true,
        trainingProgress: 60,
        imagesLocked: 11,
        stylesChosen: 2,
        createdAt: new Date().toISOString()
      }
    ]
  }
}

// Initialize on module load
initializeInfluencers().catch(console.error)

export const getAllInfluencers = (req, res) => {
  const { search, filter } = req.query
  
  let filtered = [...influencers]
  
  // Search filter
  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(inf => 
      inf.name.toLowerCase().includes(searchLower) ||
      inf.description.toLowerCase().includes(searchLower)
    )
  }
  
  // Daily content filter
  if (filter === 'daily') {
    filtered = filtered.filter(inf => inf.dailyContentEnabled)
  }
  
  res.json({
    success: true,
    data: filtered,
    count: filtered.length
  })
}

export const getInfluencerById = (req, res) => {
  const { id } = req.params
  const influencer = influencers.find(inf => inf.id === parseInt(id))
  
  if (!influencer) {
    return res.status(404).json({
      success: false,
      error: 'Influencer not found'
    })
  }
  
  res.json({
    success: true,
    data: influencer
  })
}

export const createInfluencer = async (req, res) => {
  try {
    // Calculate next ID
    const nextId = influencers.length > 0 
      ? Math.max(...influencers.map(inf => inf.id)) + 1 
      : 1
    
    const newInfluencer = {
      id: nextId,
      ...req.body,
      createdAt: new Date().toISOString(),
      trainingProgress: req.body.trainingProgress || 0,
      imagesLocked: req.body.imagesLocked || 0,
      stylesChosen: req.body.stylesChosen || 0
    }
    
    influencers.push(newInfluencer)
    
    // Save to storage
    await saveInfluencers(influencers)
    
    res.status(201).json({
      success: true,
      data: newInfluencer
    })
  } catch (error) {
    console.error('Error creating influencer:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create influencer'
    })
  }
}

export const updateInfluencer = async (req, res) => {
  try {
    const { id } = req.params
    const index = influencers.findIndex(inf => inf.id === parseInt(id))
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found'
      })
    }
    
    influencers[index] = {
      ...influencers[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    }
    
    // Save to storage
    await saveInfluencers(influencers)
    
    res.json({
      success: true,
      data: influencers[index]
    })
  } catch (error) {
    console.error('Error updating influencer:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update influencer'
    })
  }
}

// Set profile image from existing content
export const setProfileFromContent = async (req, res) => {
  const { id } = req.params
  const { contentId } = req.body
  
  const index = influencers.findIndex(inf => inf.id === parseInt(id))
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Influencer not found'
    })
  }
  
    // Get content item
  try {
    // Import content controller to access content array
    const contentModule = await import('./contentController.js')
    
    // Get all content from exported array
    const allContent = contentModule.content || []
    const contentItem = allContent.find(c => c.id === parseInt(contentId))
    
    if (!contentItem) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      })
    }
    
    if (contentItem.influencerId !== parseInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'Content does not belong to this influencer'
      })
    }
    
    // Update influencer with content image as profile
    influencers[index] = {
      ...influencers[index],
      imageUrl: contentItem.url,
      updatedAt: new Date().toISOString()
    }
    
    // Save to storage
    await saveInfluencers(influencers)
    
    console.log(`✅ Updated influencer ${influencers[index].name} profile image to: ${contentItem.url}`)
    
    res.json({
      success: true,
      data: influencers[index],
      message: 'Profile image updated from content'
    })
  } catch (error) {
    console.error('Error setting profile from content:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to set profile from content'
    })
  }
}

// Auto-update profile from first generated content (helper function)
export const autoUpdateProfileFromContent = async (influencerId) => {
  try {
    const contentModule = await import('./contentController.js')
    const allContent = contentModule.content || []
    
    // Find first feed_post for this influencer
    const firstFeedPost = allContent.find(c => 
      c.influencerId === influencerId && 
      c.type === 'feed_post'
    )
    
    if (firstFeedPost) {
      const index = influencers.findIndex(inf => inf.id === influencerId)
      if (index !== -1) {
        influencers[index] = {
          ...influencers[index],
          imageUrl: firstFeedPost.url,
          updatedAt: new Date().toISOString()
        }
        // Save to storage
        await saveInfluencers(influencers)
        console.log(`✅ Auto-updated influencer ${influencers[index].name} profile from first feed_post: ${firstFeedPost.url}`)
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Error auto-updating profile from content:', error)
    return false
  }
}

export const deleteInfluencer = async (req, res) => {
  try {
    const { id } = req.params
    const index = influencers.findIndex(inf => inf.id === parseInt(id))
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found'
      })
    }
    
    influencers.splice(index, 1)
    
    // Save to storage
    await saveInfluencers(influencers)
    
    res.json({
      success: true,
      message: 'Influencer deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting influencer:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete influencer'
    })
  }
}


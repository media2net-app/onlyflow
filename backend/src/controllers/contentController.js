// Content storage - Only real generated content (no dummy data)
// Export content array so other controllers can access it
export let content = []

// Import storage service
import { 
  initializeStorage, 
  loadContent, 
  saveContent 
} from '../services/storageService.js'

// Initialize content from existing storage files on server start
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const storageDir = path.join(__dirname, '../../storage')

// Function to initialize content from JSON storage and file system
export const initializeContentFromStorage = async () => {
  try {
    // First, load content from JSON storage
    await initializeStorage()
    const savedContent = await loadContent()
    
    if (savedContent.length > 0) {
      content = savedContent
      console.log(`✅ Loaded ${content.length} content item(s) from JSON storage`)
    }
    
    // Also scan storage directory for any files that might not be in JSON yet
    try {
      const files = await fs.readdir(storageDir)
      const contentFiles = files.filter(file => 
        (file.startsWith('content_') || file.startsWith('profile_') || file.startsWith('training_')) && 
        (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
      )
      
      console.log(`📦 Found ${contentFiles.length} existing content files in storage directory`)
      
      for (const file of contentFiles) {
        const fileUrl = `/storage/${file}`
        
        // Check if this content already exists in our array
        const exists = content.some(c => c.url === fileUrl)
        if (!exists) {
          // Try to parse influencer ID from filename
          let influencerId = 1 // Default
          let contentType = 'feed_post'
          
          if (file.startsWith('profile_')) {
            contentType = 'profile_image'
          } else if (file.startsWith('training_')) {
            contentType = 'training_image'
            const match = file.match(/training_(\d+)_/)
            if (match) influencerId = parseInt(match[1])
          } else if (file.startsWith('content_')) {
            const match = file.match(/content_(\d+)_/)
            if (match) influencerId = parseInt(match[1])
          }
          
          const newContent = {
            id: content.length > 0 ? Math.max(...content.map(c => c.id)) + 1 : 1,
            influencerId: influencerId,
            type: contentType,
            url: fileUrl,
            status: 'completed',
            createdAt: new Date().toISOString()
          }
          content.push(newContent)
          console.log(`✅ Restored content from file: ${file}`)
        }
      }
      
      // Save updated content to JSON
      if (content.length > savedContent.length) {
        await saveContent(content)
      }
    } catch (dirError) {
      console.log('Storage directory scan skipped:', dirError.message)
    }
    
    console.log(`✅ Content initialization complete. Total content items: ${content.length}`)
  } catch (error) {
    console.error('Error initializing content from storage:', error)
  }
}

// Auto-initialize on module load
initializeContentFromStorage().catch(console.error)

export const getAllContent = (req, res) => {
  res.json({
    success: true,
    data: content,
    count: content.length
  })
}

export const getContentById = (req, res) => {
  const { id } = req.params
  const contentItem = content.find(c => c.id === parseInt(id))
  
  if (!contentItem) {
    return res.status(404).json({
      success: false,
      error: 'Content not found'
    })
  }
  
  res.json({
    success: true,
    data: contentItem
  })
}

export const getContentByInfluencer = (req, res) => {
  const { influencerId } = req.params
  const influencerContent = content.filter(c => c.influencerId === parseInt(influencerId))
  
  res.json({
    success: true,
    data: influencerContent,
    count: influencerContent.length
  })
}

export const createContent = async (req, res) => {
  try {
    // Generate unique ID based on highest existing ID
    const newId = content.length > 0 
      ? Math.max(...content.map(c => c.id)) + 1 
      : 1
    
    const newContent = {
      id: newId,
      ...req.body,
      createdAt: new Date().toISOString(),
      status: req.body.status || 'completed'
    }
    
    content.push(newContent)
    
    // Save to storage
    await saveContent(content)
    
    res.status(201).json({
      success: true,
      data: newContent
    })
  } catch (error) {
    console.error('Error creating content:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create content'
    })
  }
}

export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params
    const index = content.findIndex(c => c.id === parseInt(id))
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      })
    }
    
    const contentItem = content[index]
    
    // Delete physical file if it's a local file
    if (contentItem.url && contentItem.url.startsWith('/storage/')) {
      try {
        const filename = contentItem.url.replace('/storage/', '')
        const filePath = path.join(storageDir, filename)
        
        // Check if file exists before trying to delete
        try {
          await fs.access(filePath)
          await fs.unlink(filePath)
          console.log(`✅ Deleted file: ${filename}`)
        } catch (fileError) {
          // File doesn't exist or can't be deleted - log but continue
          console.log(`⚠️  Could not delete file ${filename}:`, fileError.message)
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError)
        // Continue with database deletion even if file deletion fails
      }
    }
    
    // Remove from content array
    content.splice(index, 1)
    
    // Save to storage
    await saveContent(content)
    
    res.json({
      success: true,
      message: 'Content deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting content:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete content'
    })
  }
}

// Internal function to create content (used by AI service and generation service)
// This allows services to add content directly without going through HTTP
export const createContentInternal = async (contentData) => {
  try {
    // Generate unique ID
    const newId = content.length > 0 
      ? Math.max(...content.map(c => c.id)) + 1 
      : 1
    
    const newContent = {
      id: newId,
      ...contentData,
      createdAt: new Date().toISOString(),
      status: contentData.status || 'completed'
    }
    
    content.push(newContent)
    
    // Save to storage
    await saveContent(content)
    
    console.log(`✅ New content added (ID: ${newId}):`, {
      type: newContent.type,
      influencerId: newContent.influencerId,
      url: newContent.url
    })
    
    return newContent
  } catch (error) {
    console.error('Error in createContentInternal:', error)
    throw error
  }
}

// Configure multer for file uploads
const upload = multer({
  dest: storageDir,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// Upload training images
export const uploadTrainingImages = async (req, res) => {
  try {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      })
    }

    const files = req.files || [req.file]
    const influencerId = parseInt(req.body.influencerId)
    const contentType = req.body.type || 'training_image'
    const style = req.body.style || null

    if (!influencerId) {
      return res.status(400).json({
        success: false,
        error: 'Influencer ID is required'
      })
    }

    const uploadedContent = []

    for (const file of files) {
      // Generate unique filename
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 10000)
      const ext = path.extname(file.originalname) || '.png'
      const filename = `training_${influencerId}_${timestamp}_${random}${ext}`
      const filepath = path.join(storageDir, filename)

      // Move file from temp location to storage
      await fs.rename(file.path, filepath)

      const fileUrl = `/storage/${filename}`

      // Create content entry
      const newId = content.length > 0 
        ? Math.max(...content.map(c => c.id)) + 1 
        : 1

      const newContent = {
        id: newId,
        influencerId: influencerId,
        type: contentType,
        url: fileUrl,
        status: 'completed',
        createdAt: new Date().toISOString()
      }

      // Add style property if it's a style_image
      if (contentType === 'style_image' && style) {
        newContent.style = style
      }

      content.push(newContent)
      uploadedContent.push(newContent)
    }
    
    // Save to storage
    await saveContent(content)

    res.status(201).json({
      success: true,
      data: uploadedContent,
      count: uploadedContent.length,
      message: `Successfully uploaded ${uploadedContent.length} image(s)`
    })
  } catch (error) {
    console.error('Error uploading images:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload images'
    })
  }
}

// Export multer middleware
export const uploadMiddleware = upload.array('image', 20) // Max 20 files


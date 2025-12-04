import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Storage directory
const storageDir = path.join(__dirname, '../../data')
const influencersFile = path.join(storageDir, 'influencers.json')
const contentFile = path.join(storageDir, 'content.json')

// Ensure storage directory exists
export const ensureStorageDir = async () => {
  try {
    await fs.mkdir(storageDir, { recursive: true })
  } catch (error) {
    console.error('Error creating storage directory:', error)
  }
}

// Initialize storage files if they don't exist
export const initializeStorage = async () => {
  await ensureStorageDir()
  
  // Initialize influencers file
  try {
    await fs.access(influencersFile)
  } catch {
    // File doesn't exist, create with default data
    const defaultInfluencers = [
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
    await fs.writeFile(influencersFile, JSON.stringify(defaultInfluencers, null, 2))
    console.log('✅ Created influencers.json with default data')
  }
  
  // Initialize content file
  try {
    await fs.access(contentFile)
  } catch {
    // File doesn't exist, create empty array
    await fs.writeFile(contentFile, JSON.stringify([], null, 2))
    console.log('✅ Created content.json')
  }
}

// Load influencers from storage
export const loadInfluencers = async () => {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(influencersFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading influencers:', error)
    return []
  }
}

// Save influencers to storage
export const saveInfluencers = async (influencers) => {
  try {
    await ensureStorageDir()
    await fs.writeFile(influencersFile, JSON.stringify(influencers, null, 2))
    console.log(`✅ Saved ${influencers.length} influencer(s) to storage`)
  } catch (error) {
    console.error('Error saving influencers:', error)
    throw error
  }
}

// Load content from storage
export const loadContent = async () => {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(contentFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading content:', error)
    return []
  }
}

// Save content to storage
export const saveContent = async (content) => {
  try {
    await ensureStorageDir()
    await fs.writeFile(contentFile, JSON.stringify(content, null, 2))
    console.log(`✅ Saved ${content.length} content item(s) to storage`)
  } catch (error) {
    console.error('Error saving content:', error)
    throw error
  }
}

// Auto-save wrapper - saves data after operation
export const withAutoSave = async (operation, dataType) => {
  const result = await operation()
  
  // Auto-save after operation
  if (dataType === 'influencers') {
    // Get current influencers and save
    const influencers = await loadInfluencers()
    await saveInfluencers(influencers)
  } else if (dataType === 'content') {
    // Get current content and save
    const content = await loadContent()
    await saveContent(content)
  }
  
  return result
}


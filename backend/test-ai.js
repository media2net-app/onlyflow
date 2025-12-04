// Quick test script for AI generation
import dotenv from 'dotenv'
import { generateProfileImage } from './src/services/aiService.js'
import fs from 'fs/promises'

dotenv.config()

async function testAI() {
  console.log('🧪 Testing AI Image Generation...\n')
  
  // Check if API key is set
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.error('❌ HUGGINGFACE_API_KEY not found in .env file')
    process.exit(1)
  }
  
  console.log('✅ API Key found\n')
  
  // Test data
  const testInfluencer = {
    name: 'Test Influencer',
    gender: 'Female',
    age: 25,
    location: 'Los Angeles',
    hairColor: 'blonde',
    activities: ['modeling', 'fitness'],
    settings: ['studio', 'outdoor'],
    clothingStyles: ['CASUAL']
  }
  
  try {
    console.log('🔄 Generating test profile image...')
    console.log('This may take 30-60 seconds...\n')
    
    const imageBuffer = await generateProfileImage(testInfluencer)
    
    // Save test image
    await fs.mkdir('storage', { recursive: true })
    await fs.writeFile('storage/test-profile.png', imageBuffer)
    
    console.log('✅ Success! Test image saved to: storage/test-profile.png')
    console.log('📏 Image size:', (imageBuffer.length / 1024).toFixed(2), 'KB')
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('401')) {
      console.error('   → Check if your API token is correct')
    } else if (error.message.includes('503')) {
      console.error('   → Model is loading, wait a minute and try again')
    } else if (error.message.includes('429')) {
      console.error('   → Rate limit exceeded, wait a bit')
    }
    process.exit(1)
  }
}

testAI()


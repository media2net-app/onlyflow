import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const creditsFile = path.join(__dirname, '../../data/credits.json')

// Ensure data directory exists
const dataDir = path.dirname(creditsFile)
fs.mkdir(dataDir, { recursive: true }).catch(console.error)

// Cost per image generation (Minimax image-01: $0.01 per image)
const COST_PER_IMAGE = 0.01

/**
 * Initialize credits file with starting balance
 */
async function initializeCredits() {
  try {
    await fs.access(creditsFile)
  } catch {
    // File doesn't exist, create it with initial balance
    const initialCredits = {
      balance: 9.95, // Starting balance from Replicate account
      currency: 'USD',
      totalSpent: 0.00,
      totalGenerated: 0,
      lastUpdated: new Date().toISOString(),
      transactions: []
    }
    await fs.writeFile(creditsFile, JSON.stringify(initialCredits, null, 2))
    console.log('✅ Credits file initialized with $9.95')
  }
}

/**
 * Get current credits balance
 * @returns {Promise<{balance: number, currency: string, totalSpent: number, totalGenerated: number}>}
 */
export async function getCredits() {
  await initializeCredits()
  
  try {
    const data = await fs.readFile(creditsFile, 'utf-8')
    const credits = JSON.parse(data)
    return {
      balance: credits.balance || 0,
      currency: credits.currency || 'USD',
      totalSpent: credits.totalSpent || 0,
      totalGenerated: credits.totalGenerated || 0,
      available: true
    }
  } catch (error) {
    console.error('Error reading credits file:', error)
    return {
      balance: 9.95, // Fallback
      currency: 'USD',
      totalSpent: 0,
      totalGenerated: 0,
      available: false
    }
  }
}

/**
 * Deduct credits for image generation
 * @param {number} count - Number of images generated
 * @returns {Promise<{success: boolean, newBalance: number, cost: number, error?: string}>}
 */
export async function deductCredits(count = 1) {
  await initializeCredits()
  
  try {
    const data = await fs.readFile(creditsFile, 'utf-8')
    const credits = JSON.parse(data)
    
    const cost = count * COST_PER_IMAGE
    const newBalance = (credits.balance || 0) - cost
    
    // Check if sufficient balance
    if (newBalance < 0) {
      return {
        success: false,
        newBalance: credits.balance || 0,
        cost: cost,
        error: 'Insufficient credits'
      }
    }
    
    // Update credits
    credits.balance = Math.round(newBalance * 100) / 100 // Round to 2 decimals
    credits.totalSpent = (credits.totalSpent || 0) + cost
    credits.totalSpent = Math.round(credits.totalSpent * 100) / 100
    credits.totalGenerated = (credits.totalGenerated || 0) + count
    credits.lastUpdated = new Date().toISOString()
    
    // Add transaction
    if (!credits.transactions) {
      credits.transactions = []
    }
    credits.transactions.push({
      type: 'deduction',
      amount: cost,
      count: count,
      timestamp: new Date().toISOString(),
      description: `Generated ${count} image${count > 1 ? 's' : ''}`
    })
    
    // Keep only last 100 transactions
    if (credits.transactions.length > 100) {
      credits.transactions = credits.transactions.slice(-100)
    }
    
    await fs.writeFile(creditsFile, JSON.stringify(credits, null, 2))
    
    console.log(`💰 Credits deducted: $${cost.toFixed(2)} (${count} images). New balance: $${credits.balance.toFixed(2)}`)
    
    return {
      success: true,
      newBalance: credits.balance,
      cost: cost,
      currency: credits.currency || 'USD'
    }
  } catch (error) {
    console.error('Error deducting credits:', error)
    return {
      success: false,
      newBalance: 0,
      cost: count * COST_PER_IMAGE,
      error: error.message
    }
  }
}

/**
 * Add credits (for manual top-up)
 * @param {number} amount - Amount to add
 * @returns {Promise<{success: boolean, newBalance: number, error?: string}>}
 */
export async function addCredits(amount) {
  await initializeCredits()
  
  try {
    const data = await fs.readFile(creditsFile, 'utf-8')
    const credits = JSON.parse(data)
    
    const newBalance = (credits.balance || 0) + amount
    credits.balance = Math.round(newBalance * 100) / 100
    credits.lastUpdated = new Date().toISOString()
    
    // Add transaction
    if (!credits.transactions) {
      credits.transactions = []
    }
    credits.transactions.push({
      type: 'addition',
      amount: amount,
      timestamp: new Date().toISOString(),
      description: 'Manual credit top-up'
    })
    
    await fs.writeFile(creditsFile, JSON.stringify(credits, null, 2))
    
    console.log(`💰 Credits added: $${amount.toFixed(2)}. New balance: $${credits.balance.toFixed(2)}`)
    
    return {
      success: true,
      newBalance: credits.balance,
      currency: credits.currency || 'USD'
    }
  } catch (error) {
    console.error('Error adding credits:', error)
    return {
      success: false,
      newBalance: credits.balance || 0,
      error: error.message
    }
  }
}

/**
 * Get cost per image
 */
export function getCostPerImage() {
  return COST_PER_IMAGE
}


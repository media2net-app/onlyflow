import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Use Prisma Accelerate if available, otherwise use direct connection
const prismaOptions = process.env.PRISMA_ACCELERATE_URL 
  ? { accelerateUrl: process.env.PRISMA_ACCELERATE_URL }
  : {} // For direct connection, Prisma will use DATABASE_URL from env

const prisma = new PrismaClient(prismaOptions)

async function main() {
  console.log('🌱 Starting seed...')

  try {
    // Load existing data from JSON files
    const influencersPath = join(__dirname, '../data/influencers.json')
    const contentPath = join(__dirname, '../data/content.json')

    const influencersData = JSON.parse(readFileSync(influencersPath, 'utf-8'))
    const contentData = JSON.parse(readFileSync(contentPath, 'utf-8'))

    console.log(`📦 Found ${influencersData.length} influencers and ${contentData.length} content items`)

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await prisma.content.deleteMany()
    // await prisma.influencer.deleteMany()

    // Seed influencers
    for (const influencer of influencersData) {
      const { id, createdAt, updatedAt, ...data } = influencer
      
      await prisma.influencer.upsert({
        where: { id },
        update: {
          ...data,
          updatedAt: updatedAt ? new Date(updatedAt) : new Date()
        },
        create: {
          id,
          ...data,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          updatedAt: updatedAt ? new Date(updatedAt) : new Date()
        }
      })
      console.log(`✅ Upserted influencer: ${influencer.name} (ID: ${id})`)
    }

    // Seed content
    for (const content of contentData) {
      const { id, createdAt, updatedAt, ...data } = content
      
      await prisma.content.upsert({
        where: { id },
        update: {
          ...data,
          updatedAt: updatedAt ? new Date(updatedAt) : new Date()
        },
        create: {
          id,
          ...data,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          updatedAt: updatedAt ? new Date(updatedAt) : new Date()
        }
      })
      console.log(`✅ Upserted content: ${content.type} (ID: ${id})`)
    }

    console.log('✨ Seed completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


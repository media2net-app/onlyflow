import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  // Use Prisma Accelerate if available
  ...(process.env.PRISMA_ACCELERATE_URL && {
    accelerateUrl: process.env.PRISMA_ACCELERATE_URL
  })
})

export default prisma


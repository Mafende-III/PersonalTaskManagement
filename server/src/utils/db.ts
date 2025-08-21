import { PrismaClient } from '@prisma/client'

// Initialize Prisma client
export const db = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Connect to database
export async function connectDatabase() {
  try {
    await db.$connect()
    console.log('📊 Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

// Disconnect from database
export async function disconnectDatabase() {
  await db.$disconnect()
  console.log('📊 Database disconnected')
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDatabase()
}) 
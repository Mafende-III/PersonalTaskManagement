import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDatabase } from './utils/db'
import authRoutes from './routes/auth'
import taskRoutes from './routes/task'
import projectRoutes from './routes/project'
import commentRoutes from './routes/comment'
import attachmentRoutes from './routes/attachment'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Task Management API is running!' })
})

// Auth routes
app.use('/api/auth', authRoutes)

// Task routes
app.use('/api/tasks', taskRoutes)

// Project routes
app.use('/api/projects', projectRoutes)

// Comment routes
app.use('/api/comments', commentRoutes)

// Attachment routes
app.use('/api/attachments', attachmentRoutes)

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase()
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`)
      console.log(`📡 Health check: http://localhost:${PORT}/health`)
      console.log(`🔗 API endpoint: http://localhost:${PORT}/api/test`)
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`)
      console.log(`📋 Task endpoints: http://localhost:${PORT}/api/tasks`)
      console.log(`📁 Project endpoints: http://localhost:${PORT}/api/projects`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer() 
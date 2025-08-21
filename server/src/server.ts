/// <reference path="./types/express.d.ts" />
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
import adminRoutes from './routes/admin'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5002

// Middleware
app.use(helmet())

// Configure CORS for production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.CLIENT_URL || 'http://localhost:5002']
  : ['http://localhost:5174', 'http://localhost:5175', 'http://localhost:5173', 'http://localhost:5002']

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
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

// Admin routes
app.use('/api/admin', adminRoutes)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path')
  
  // Serve static files from client build
  app.use(express.static(path.join(__dirname, '../../client/dist')))
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'))
  })
}

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
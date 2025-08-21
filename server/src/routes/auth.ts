import { Router } from 'express'
import { register, login, refresh, profile } from '../controllers/auth'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)

// Protected routes
router.get('/profile', authenticateToken, profile)

export default router 
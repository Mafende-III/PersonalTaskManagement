import { Router } from 'express'
import { commentController } from '../controllers/comment'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Comment routes
router.get('/task/:taskId', commentController.getTaskComments)
router.post('/', commentController.createComment)
router.put('/:commentId', commentController.updateComment)
router.delete('/:commentId', commentController.deleteComment)

export default router
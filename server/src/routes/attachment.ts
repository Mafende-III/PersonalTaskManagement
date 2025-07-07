import { Router } from 'express'
import { attachmentController } from '../controllers/attachment'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Attachment routes
router.get('/task/:taskId', attachmentController.getTaskAttachments)
router.get('/:attachmentId', attachmentController.getAttachment)
router.post('/', attachmentController.createAttachment)
router.delete('/:attachmentId', attachmentController.deleteAttachment)

export default router
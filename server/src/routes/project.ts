import express from 'express'
import { projectController } from '../controllers/project'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Apply auth middleware to all routes
router.use(authenticateToken)

// Project routes
router.get('/', projectController.getAllProjects)
router.get('/:id', projectController.getProjectById)
router.post('/', projectController.createProject)
router.put('/:id', projectController.updateProject)
router.delete('/:id', projectController.deleteProject)
router.get('/:id/stats', projectController.getProjectStats)

export default router
import express from 'express'
import { taskController } from '../controllers/task'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Apply auth middleware to all routes
router.use(authenticateToken)

// Task routes
router.get('/', taskController.getAllTasks)
router.get('/:id', taskController.getTaskById)
router.post('/', taskController.createTask)
router.put('/:id', taskController.updateTask)
router.delete('/:id', taskController.deleteTask)
router.patch('/positions', taskController.updateTaskPositions)

export default router
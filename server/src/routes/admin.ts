import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { checkAccountStatus, requireActiveAccount } from '../middleware/accountStatus'
import {
  getAllUsers,
  updateUserStatus,
  assignUserToPosition,
  getAllDepartments,
  getDepartmentPositions,
  deleteUser,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllPositions,
  createPosition,
  updatePosition,
  deletePosition
} from '../controllers/admin'

const router = Router()

// Apply authentication and account status checks to all admin routes
router.use(authenticateToken)
router.use(checkAccountStatus)

// TODO: Add admin permission check middleware here
// For now, we'll rely on frontend checks, but this should be properly secured

// User Management Routes
router.get('/users', getAllUsers)
router.put('/users/:userId/status', updateUserStatus)
router.put('/users/:userId/assign', assignUserToPosition)
router.delete('/users/:userId', deleteUser)

// Department Routes
router.get('/departments', getAllDepartments)
router.post('/departments', createDepartment)
router.put('/departments/:departmentId', updateDepartment)
router.delete('/departments/:departmentId', deleteDepartment)
router.get('/departments/:departmentId/positions', getDepartmentPositions)

// Position Routes
router.get('/positions', getAllPositions)
router.post('/positions', createPosition)
router.put('/positions/:positionId', updatePosition)
router.delete('/positions/:positionId', deletePosition)

export default router
import { UserAccountStatus } from 'task-management-shared'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        accountStatus?: UserAccountStatus
        departmentId?: string
        positionId?: string
      }
    }
  }
}

export {}
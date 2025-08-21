/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express'
import { UserAccountStatus } from 'task-management-shared'
import { db } from '../utils/db'

/**
 * Middleware to check user account status and apply appropriate restrictions
 */
export async function checkAccountStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    // Get user with account status
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        accountStatus: true,
        emailVerified: true,
        departmentId: true,
        positionId: true
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Check account status
    switch (user.accountStatus) {
      case UserAccountStatus.PENDING_VERIFICATION:
        return res.status(403).json({
          success: false,
          error: 'Account pending email verification',
          accountStatus: user.accountStatus
        })

      case UserAccountStatus.SUSPENDED:
        return res.status(403).json({
          success: false,
          error: 'Account suspended. Contact administrator.',
          accountStatus: user.accountStatus
        })

      case UserAccountStatus.ARCHIVED:
        return res.status(403).json({
          success: false,
          error: 'Account archived. Contact administrator.',
          accountStatus: user.accountStatus
        })

      case UserAccountStatus.UNASSIGNED:
        // Allow limited access - store user info for route-specific checks
        if (req.user) {
          req.user.accountStatus = user.accountStatus as UserAccountStatus
          req.user.departmentId = user.departmentId || undefined
          req.user.positionId = user.positionId || undefined
        }
        break

      case UserAccountStatus.ACTIVE:
        // Full access
        if (req.user) {
          req.user.accountStatus = user.accountStatus as UserAccountStatus
          req.user.departmentId = user.departmentId || undefined
          req.user.positionId = user.positionId || undefined
        }
        break

      default:
        return res.status(403).json({
          success: false,
          error: 'Invalid account status',
          accountStatus: user.accountStatus
        })
    }

    next()
  } catch (error) {
    console.error('Account status check error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

/**
 * Middleware specifically for unassigned users - restrict access to personal resources only
 */
export function requireActiveAccount(req: Request, res: Response, next: NextFunction) {
  const accountStatus = req.user?.accountStatus

  if (accountStatus === UserAccountStatus.UNASSIGNED) {
    return res.status(403).json({
      success: false,
      error: 'Feature not available for unassigned users. Request department access to unlock team features.',
      accountStatus: accountStatus
    })
  }

  next()
}

/**
 * Middleware to check if user can create personal projects
 */
export async function checkPersonalProjectLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        personalProjectLimit: true,
        canCreatePersonalProjects: true,
        _count: {
          select: {
            projects: {
              where: {
                type: 'PERSONAL'
              }
            }
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    if (!user.canCreatePersonalProjects) {
      return res.status(403).json({
        success: false,
        error: 'Personal project creation not allowed for this account'
      })
    }

    if (user._count.projects >= user.personalProjectLimit) {
      return res.status(403).json({
        success: false,
        error: `Personal project limit reached (${user.personalProjectLimit}). Delete existing projects or request limit increase.`
      })
    }

    next()
  } catch (error) {
    console.error('Personal project limit check error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
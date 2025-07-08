import { Request, Response } from 'express'
import { db } from '../utils/db'
import { UserAccountStatus } from 'task-management-shared'

/**
 * Get all users with their department and position information
 */
export async function getAllUsers(req: Request, res: Response) {
  try {
    const { status, search, departmentId } = req.query

    const whereClause: any = {}
    
    // Filter by status if provided
    if (status && Object.values(UserAccountStatus).includes(status as UserAccountStatus)) {
      whereClause.accountStatus = status
    }
    
    // Filter by department if provided
    if (departmentId) {
      whereClause.departmentId = departmentId
    }
    
    // Search by name or email if provided
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        verified: true,
        accountStatus: true,
        emailVerified: true,
        departmentId: true,
        positionId: true,
        canCreatePersonalProjects: true,
        canCreatePersonalTasks: true,
        personalProjectLimit: true,
        createdAt: true,
        updatedAt: true,
        position: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        _count: {
          select: {
            projects: true,
            tasks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: { users },
      message: 'Users retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    })
  }
}

/**
 * Update user account status
 */
export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { userId } = req.params
    const { status } = req.body

    // Validate status
    if (!Object.values(UserAccountStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid account status'
      })
    }

    // Don't allow updating your own status
    if (userId === req.user?.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update your own account status'
      })
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { accountStatus: status },
      select: {
        id: true,
        email: true,
        name: true,
        accountStatus: true,
        position: {
          select: {
            name: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'User status updated successfully'
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    })
  }
}

/**
 * Assign user to department and position
 */
export async function assignUserToPosition(req: Request, res: Response) {
  try {
    const { userId } = req.params
    const { departmentId, positionId } = req.body

    // Validate that position belongs to department
    if (positionId) {
      const position = await db.position.findFirst({
        where: {
          id: positionId,
          departmentId: departmentId
        }
      })

      if (!position) {
        return res.status(400).json({
          success: false,
          error: 'Position does not belong to the specified department'
        })
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        departmentId: departmentId || null,
        positionId: positionId || null,
        accountStatus: departmentId ? UserAccountStatus.ACTIVE : UserAccountStatus.UNASSIGNED
      },
      include: {
        position: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'User assignment updated successfully'
    })
  } catch (error) {
    console.error('Error assigning user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to assign user'
    })
  }
}

/**
 * Get all departments for user assignment
 */
export async function getAllDepartments(req: Request, res: Response) {
  try {
    const departments = await db.department.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            users: true,
            positions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    res.json({
      success: true,
      data: { departments },
      message: 'Departments retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching departments:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch departments'
    })
  }
}

/**
 * Get positions for a specific department
 */
export async function getDepartmentPositions(req: Request, res: Response) {
  try {
    const { departmentId } = req.params

    const positions = await db.position.findMany({
      where: { departmentId },
      select: {
        id: true,
        name: true,
        level: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        level: 'asc'
      }
    })

    res.json({
      success: true,
      data: { positions },
      message: 'Positions retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching positions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch positions'
    })
  }
}

/**
 * Delete a user (admin only)
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    const { userId } = req.params

    // Don't allow deleting yourself
    if (userId === req.user?.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      })
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Delete user (cascade will handle related data)
    await db.user.delete({
      where: { id: userId }
    })

    res.json({
      success: true,
      message: `User ${user.email} deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    })
  }
}

/**
 * Create a new department
 */
export async function createDepartment(req: Request, res: Response) {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Department name is required'
      })
    }

    const department = await db.department.create({
      data: {
        name,
        description: description || ''
      },
      include: {
        _count: {
          select: {
            users: true,
            positions: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: { department },
      message: 'Department created successfully'
    })
  } catch (error) {
    console.error('Error creating department:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create department'
    })
  }
}

/**
 * Update a department
 */
export async function updateDepartment(req: Request, res: Response) {
  try {
    const { departmentId } = req.params
    const { name, description } = req.body

    const department = await db.department.update({
      where: { id: departmentId },
      data: {
        name,
        description
      },
      include: {
        _count: {
          select: {
            users: true,
            positions: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: { department },
      message: 'Department updated successfully'
    })
  } catch (error) {
    console.error('Error updating department:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update department'
    })
  }
}

/**
 * Delete a department
 */
export async function deleteDepartment(req: Request, res: Response) {
  try {
    const { departmentId } = req.params

    // Check if department has users
    const department = await db.department.findUnique({
      where: { id: departmentId },
      include: {
        _count: {
          select: { users: true }
        }
      }
    })

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      })
    }

    if (department._count.users > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete department with assigned users'
      })
    }

    await db.department.delete({
      where: { id: departmentId }
    })

    res.json({
      success: true,
      message: 'Department deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting department:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete department'
    })
  }
}

/**
 * Get all positions
 */
export async function getAllPositions(req: Request, res: Response) {
  try {
    const positions = await db.position.findMany({
      select: {
        id: true,
        name: true,
        level: true,
        departmentId: true,
        permissions: true,
        department: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: [
        { department: { name: 'asc' } },
        { level: 'asc' }
      ]
    })

    res.json({
      success: true,
      data: { positions },
      message: 'Positions retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching positions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch positions'
    })
  }
}

/**
 * Create a new position
 */
export async function createPosition(req: Request, res: Response) {
  try {
    const { name, level, departmentId, permissions } = req.body

    if (!name || !departmentId || level === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, department, and level are required'
      })
    }

    const position = await db.position.create({
      data: {
        name,
        level,
        departmentId,
        permissions: permissions || {}
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: { position },
      message: 'Position created successfully'
    })
  } catch (error) {
    console.error('Error creating position:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create position'
    })
  }
}

/**
 * Update a position
 */
export async function updatePosition(req: Request, res: Response) {
  try {
    const { positionId } = req.params
    const { name, level, permissions } = req.body

    const position = await db.position.update({
      where: { id: positionId },
      data: {
        name,
        level,
        permissions
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: { position },
      message: 'Position updated successfully'
    })
  } catch (error) {
    console.error('Error updating position:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update position'
    })
  }
}

/**
 * Delete a position
 */
export async function deletePosition(req: Request, res: Response) {
  try {
    const { positionId } = req.params

    // Check if position has users
    const position = await db.position.findUnique({
      where: { id: positionId },
      include: {
        _count: {
          select: { users: true }
        }
      }
    })

    if (!position) {
      return res.status(404).json({
        success: false,
        error: 'Position not found'
      })
    }

    if (position._count.users > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete position with assigned users'
      })
    }

    await db.position.delete({
      where: { id: positionId }
    })

    res.json({
      success: true,
      message: 'Position deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting position:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete position'
    })
  }
}
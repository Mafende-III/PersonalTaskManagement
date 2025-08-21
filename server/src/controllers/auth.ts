import { Request, Response } from 'express'
import { db } from '../utils/db'
import { hashPassword, comparePassword, generateTokenPair, verifyRefreshToken } from '../utils/auth'
import { ApiResponse, UserAccountStatus } from 'task-management-shared'

interface RegisterRequest {
  email: string
  password: string
  name?: string
}

interface LoginRequest {
  email: string
  password: string
}

interface RefreshRequest {
  refreshToken: string
}

/**
 * Register a new user
 */
export async function register(req: Request, res: Response) {
  try {
    const { email, password, name }: RegisterRequest = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse)
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists with this email'
      } as ApiResponse)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with self-signup status
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        accountStatus: UserAccountStatus.UNASSIGNED, // Start as unassigned
        emailVerified: false, // Require email verification
        canCreatePersonalProjects: true,
        canCreatePersonalTasks: true,
        personalProjectLimit: 3 // Limited for new users
      },
      select: {
        id: true,
        email: true,
        name: true,
        verified: true,
        accountStatus: true,
        emailVerified: true,
        canCreatePersonalProjects: true,
        canCreatePersonalTasks: true,
        personalProjectLimit: true,
        createdAt: true
      }
    })

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email
    })

    res.status(201).json({
      success: true,
      data: {
        user,
        ...tokens
      },
      message: 'User registered successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse)
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password }: LoginRequest = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse)
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      include: {
        position: {
          select: {
            id: true,
            name: true,
            level: true,
            permissions: true
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

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      } as ApiResponse)
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      } as ApiResponse)
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email
    })

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          verified: user.verified,
          accountStatus: user.accountStatus,
          emailVerified: user.emailVerified,
          canCreatePersonalProjects: user.canCreatePersonalProjects,
          canCreatePersonalTasks: user.canCreatePersonalTasks,
          personalProjectLimit: user.personalProjectLimit,
          departmentId: user.departmentId,
          positionId: user.positionId,
          position: user.position,
          department: user.department,
          createdAt: user.createdAt
        },
        ...tokens
      },
      message: 'Login successful'
    } as ApiResponse)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse)
  }
}

/**
 * Refresh access token
 */
export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken }: RefreshRequest = req.body

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      } as ApiResponse)
    }

    // Check for invalid token values
    if (refreshToken === 'undefined' || refreshToken === 'null' || typeof refreshToken !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid refresh token format'
      } as ApiResponse)
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)

    // Find user
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      } as ApiResponse)
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email
    })

    res.json({
      success: true,
      data: tokens,
      message: 'Token refreshed successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Refresh error:', error)
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    } as ApiResponse)
  }
}

/**
 * Get current user profile
 */
export async function profile(req: Request, res: Response) {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      } as ApiResponse)
    }

    const user = await db.user.findUnique({
      where: { id: userId },
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
            level: true,
            permissions: true
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

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse)
    }

    res.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse)
  }
} 
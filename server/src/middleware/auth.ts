import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, JwtPayload } from '../utils/auth'
import { db } from '../utils/db'

/**
 * Middleware to authenticate requests using JWT tokens
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      })
    }

    // Verify token
    const payload: JwtPayload = verifyAccessToken(token)
    
    // Verify user still exists
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found'
      })
    }

    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    })
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return next()
    }

    const payload: JwtPayload = verifyAccessToken(token)
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true }
    })

    if (user) {
      req.user = user
    }

    next()
  } catch (error) {
    // Continue without authentication if token is invalid
    next()
  }
} 
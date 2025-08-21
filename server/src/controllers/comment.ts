import { Request, Response } from 'express'
import { z } from 'zod'
import { db as prisma } from '../utils/db'
import { CreateCommentRequest, UpdateCommentRequest } from 'task-management-shared'

// Validation schemas
const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
  taskId: z.string().min(1, 'Task ID is required')
})

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long')
})

export const commentController = {
  // Get all comments for a task
  async getTaskComments(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { taskId } = req.params

      // Verify task belongs to user
      const task = await prisma.task.findFirst({
        where: { id: taskId, userId }
      })

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        })
      }

      const comments = await prisma.comment.findMany({
        where: { taskId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      res.json({
        success: true,
        data: comments
      })
    } catch (error) {
      console.error('Error fetching comments:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  },

  // Create a new comment
  async createComment(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const validatedData = createCommentSchema.parse(req.body)

      // Verify task belongs to user
      const task = await prisma.task.findFirst({
        where: { id: validatedData.taskId, userId }
      })

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        })
      }

      const comment = await prisma.comment.create({
        data: {
          content: validatedData.content,
          taskId: validatedData.taskId,
          userId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment created successfully'
      })
    } catch (error) {
      console.error('Error creating comment:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  },

  // Update a comment
  async updateComment(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { commentId } = req.params
      const validatedData = updateCommentSchema.parse(req.body)

      // Verify comment belongs to user
      const existingComment = await prisma.comment.findFirst({
        where: { id: commentId, userId }
      })

      if (!existingComment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found'
        })
      }

      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          content: validatedData.content
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      res.json({
        success: true,
        data: comment,
        message: 'Comment updated successfully'
      })
    } catch (error) {
      console.error('Error updating comment:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  },

  // Delete a comment
  async deleteComment(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { commentId } = req.params

      // Verify comment belongs to user
      const existingComment = await prisma.comment.findFirst({
        where: { id: commentId, userId }
      })

      if (!existingComment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found'
        })
      }

      await prisma.comment.delete({
        where: { id: commentId }
      })

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}
import { Request, Response } from 'express'
import { z } from 'zod'
import { db as prisma } from '../utils/db'
import { CreateAttachmentRequest } from 'task-management-shared'

// Validation schemas
const createAttachmentSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  fileSize: z.number().min(1, 'File size must be greater than 0').max(10 * 1024 * 1024, 'File size too large (max 10MB)'),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileUrl: z.string().url('Invalid file URL'),
  taskId: z.string().min(1, 'Task ID is required')
})

export const attachmentController = {
  // Get all attachments for a task
  async getTaskAttachments(req: Request, res: Response) {
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

      const attachments = await prisma.attachment.findMany({
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
        data: attachments
      })
    } catch (error) {
      console.error('Error fetching attachments:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  },

  // Create a new attachment
  async createAttachment(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const validatedData = createAttachmentSchema.parse(req.body)

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

      const attachment = await prisma.attachment.create({
        data: {
          fileName: validatedData.fileName,
          fileSize: validatedData.fileSize,
          mimeType: validatedData.mimeType,
          fileUrl: validatedData.fileUrl,
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
        data: attachment,
        message: 'Attachment created successfully'
      })
    } catch (error) {
      console.error('Error creating attachment:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  },

  // Delete an attachment
  async deleteAttachment(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { attachmentId } = req.params

      // Verify attachment belongs to user
      const existingAttachment = await prisma.attachment.findFirst({
        where: { id: attachmentId, userId }
      })

      if (!existingAttachment) {
        return res.status(404).json({
          success: false,
          error: 'Attachment not found'
        })
      }

      await prisma.attachment.delete({
        where: { id: attachmentId }
      })

      res.json({
        success: true,
        message: 'Attachment deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting attachment:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  },

  // Get attachment by ID (for download)
  async getAttachment(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { attachmentId } = req.params

      // Verify attachment belongs to user
      const attachment = await prisma.attachment.findFirst({
        where: { id: attachmentId, userId },
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

      if (!attachment) {
        return res.status(404).json({
          success: false,
          error: 'Attachment not found'
        })
      }

      res.json({
        success: true,
        data: attachment
      })
    } catch (error) {
      console.error('Error fetching attachment:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}
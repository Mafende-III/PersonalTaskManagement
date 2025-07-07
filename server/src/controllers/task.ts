import { Request, Response } from 'express'
import { z } from 'zod'
import { db as prisma } from '../utils/db'
import { CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from 'task-management-shared'

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional(),
  projectId: z.string().optional().transform(val => val === '' ? undefined : val),
  tags: z.array(z.string()).optional(),
  parentTaskId: z.string().optional().transform(val => val === '' ? undefined : val)
})

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional(),
  projectId: z.string().optional().transform(val => val === '' ? undefined : val),
  tags: z.array(z.string()).optional(),
  parentTaskId: z.string().optional().transform(val => val === '' ? undefined : val),
  position: z.number().optional(),
  completedAt: z.string().datetime().optional()
})

export const taskController = {
  // Get all tasks for the authenticated user
  async getAllTasks(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { projectId, status, priority, search, includeSubTasks } = req.query

      const whereClause: any = { userId }
      
      // By default, exclude sub-tasks (only show top-level tasks)
      if (includeSubTasks !== 'true') {
        whereClause.parentTaskId = null
      }
      
      if (projectId === 'null') {
        whereClause.projectId = null
      } else if (projectId) {
        whereClause.projectId = projectId
      }
      if (status) whereClause.status = status
      if (priority) whereClause.priority = priority
      if (search) {
        whereClause.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ]
      }

      const tasks = await prisma.task.findMany({
        where: whereClause,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          subTasks: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  color: true
                }
              }
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          attachments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' }
        ]
      })

      res.json({
        success: true,
        data: tasks
      })
    } catch (error) {
      console.error('Error fetching tasks:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tasks'
      })
    }
  },

  // Get a single task by ID
  async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user!.id

      const task = await prisma.task.findFirst({
        where: { id, userId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          subTasks: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  color: true
                }
              }
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          attachments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        })
      }

      res.json({
        success: true,
        data: task
      })
    } catch (error) {
      console.error('Error fetching task:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch task'
      })
    }
  },

  // Create a new task
  async createTask(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const validatedData = createTaskSchema.parse(req.body)

      // Verify project belongs to user if projectId is provided
      if (validatedData.projectId) {
        const project = await prisma.project.findFirst({
          where: { id: validatedData.projectId, userId }
        })
        if (!project) {
          return res.status(404).json({
            success: false,
            error: 'Project not found'
          })
        }
      }

      // Verify parent task belongs to user if parentTaskId is provided
      if (validatedData.parentTaskId) {
        const parentTask = await prisma.task.findFirst({
          where: { id: validatedData.parentTaskId, userId }
        })
        if (!parentTask) {
          return res.status(404).json({
            success: false,
            error: 'Parent task not found'
          })
        }
      }

      // Get the highest position for ordering
      const lastTask = await prisma.task.findFirst({
        where: { userId },
        orderBy: { position: 'desc' }
      })

      const task = await prisma.task.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          status: validatedData.status || TaskStatus.TODO,
          priority: validatedData.priority || TaskPriority.MEDIUM,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
          projectId: validatedData.projectId || null,
          parentTaskId: validatedData.parentTaskId || null,
          tags: validatedData.tags || [],
          position: (lastTask?.position || 0) + 1,
          userId
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        }
      })

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        })
      }
      console.error('Error creating task:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create task'
      })
    }
  },

  // Update a task
  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const validatedData = updateTaskSchema.parse(req.body)

      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: { id, userId }
      })

      if (!existingTask) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        })
      }

      // Verify project belongs to user if projectId is provided
      if (validatedData.projectId) {
        const project = await prisma.project.findFirst({
          where: { id: validatedData.projectId, userId }
        })
        if (!project) {
          return res.status(404).json({
            success: false,
            error: 'Project not found'
          })
        }
      }

      const updateData: any = {}
      
      if (validatedData.title !== undefined) updateData.title = validatedData.title
      if (validatedData.description !== undefined) updateData.description = validatedData.description
      if (validatedData.status !== undefined) {
        updateData.status = validatedData.status
        // Auto-set completedAt when marking as completed
        if (validatedData.status === TaskStatus.COMPLETED && !existingTask.completedAt) {
          updateData.completedAt = new Date()
        } else if (validatedData.status !== TaskStatus.COMPLETED && existingTask.completedAt) {
          updateData.completedAt = null
        }
      }
      if (validatedData.priority !== undefined) updateData.priority = validatedData.priority
      if (validatedData.dueDate !== undefined) updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null
      if (validatedData.projectId !== undefined) updateData.projectId = validatedData.projectId
      if (validatedData.tags !== undefined) updateData.tags = validatedData.tags
      if (validatedData.position !== undefined) updateData.position = validatedData.position
      if (validatedData.completedAt !== undefined) updateData.completedAt = validatedData.completedAt ? new Date(validatedData.completedAt) : null

      const task = await prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        }
      })

      res.json({
        success: true,
        data: task,
        message: 'Task updated successfully'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        })
      }
      console.error('Error updating task:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update task'
      })
    }
  },

  // Delete a task
  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user!.id

      const task = await prisma.task.findFirst({
        where: { id, userId }
      })

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        })
      }

      await prisma.task.delete({
        where: { id }
      })

      res.json({
        success: true,
        message: 'Task deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete task'
      })
    }
  },

  // Bulk update task positions (for drag & drop)
  async updateTaskPositions(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { tasks } = req.body // Array of { id: string, position: number }

      if (!Array.isArray(tasks)) {
        return res.status(400).json({
          success: false,
          error: 'Tasks must be an array'
        })
      }

      // Verify all tasks belong to the user
      const taskIds = tasks.map(t => t.id)
      const userTasks = await prisma.task.findMany({
        where: { id: { in: taskIds }, userId },
        select: { id: true }
      })

      if (userTasks.length !== tasks.length) {
        return res.status(403).json({
          success: false,
          error: 'Some tasks do not belong to you'
        })
      }

      // Update positions in a transaction
      await prisma.$transaction(
        tasks.map(task => 
          prisma.task.update({
            where: { id: task.id },
            data: { position: task.position }
          })
        )
      )

      res.json({
        success: true,
        message: 'Task positions updated successfully'
      })
    } catch (error) {
      console.error('Error updating task positions:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update task positions'
      })
    }
  }
}
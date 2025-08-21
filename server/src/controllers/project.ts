import { Request, Response } from 'express'
import { z } from 'zod'
import { db as prisma } from '../utils/db'
import { CreateProjectRequest, UpdateProjectRequest, ProjectStatus, ProjectType, Visibility, UserAccountStatus } from 'task-management-shared'

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  type: z.nativeEnum(ProjectType).optional(),
  visibility: z.nativeEnum(Visibility).optional()
})

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  status: z.nativeEnum(ProjectStatus).optional()
})

export const projectController = {
  // Get all projects for the authenticated user
  async getAllProjects(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { status, includeTasks } = req.query

      const whereClause: any = { userId }
      if (status) whereClause.status = status

      // For unassigned users, only show personal projects
      const accountStatus = (req.user as any)?.accountStatus
      if (accountStatus === UserAccountStatus.UNASSIGNED) {
        whereClause.type = ProjectType.PERSONAL
      }

      const projects = await prisma.project.findMany({
        where: whereClause,
        include: {
          tasks: includeTasks === 'true' ? {
            where: { parentTaskId: null }, // Only include top-level tasks
            orderBy: [
              { position: 'asc' },
              { createdAt: 'desc' }
            ]
          } : false,
          _count: {
            select: { 
              tasks: {
                where: { parentTaskId: null } // Only count top-level tasks
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      res.json({
        success: true,
        data: projects
      })
    } catch (error) {
      console.error('Error fetching projects:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch projects'
      })
    }
  },

  // Get a single project by ID
  async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const { includeTasks } = req.query

      const project = await prisma.project.findFirst({
        where: { id, userId },
        include: {
          tasks: includeTasks === 'true' ? {
            orderBy: [
              { position: 'asc' },
              { createdAt: 'desc' }
            ]
          } : false,
          _count: {
            select: { tasks: true }
          }
        }
      })

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }

      res.json({
        success: true,
        data: project
      })
    } catch (error) {
      console.error('Error fetching project:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project'
      })
    }
  },

  // Create a new project
  async createProject(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const accountStatus = (req.user as any)?.accountStatus
      const validatedData = createProjectSchema.parse(req.body)

      // Determine project type based on user status and request
      let projectType = validatedData.type || ProjectType.PERSONAL
      
      // Unassigned users can only create personal projects
      if (accountStatus === UserAccountStatus.UNASSIGNED) {
        if (validatedData.type === ProjectType.TEAM) {
          return res.status(403).json({
            success: false,
            error: 'Unassigned users can only create personal projects. Request department access for team projects.'
          })
        }
        projectType = ProjectType.PERSONAL
      }

      const project = await prisma.project.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          color: validatedData.color || '#3B82F6',
          status: validatedData.status || ProjectStatus.ACTIVE,
          type: projectType,
          visibility: validatedData.visibility || Visibility.PRIVATE,
          userId,
          creatorId: userId
        },
        include: {
          _count: {
            select: { tasks: true }
          }
        }
      })

      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        })
      }
      console.error('Error creating project:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create project'
      })
    }
  },

  // Update a project
  async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const validatedData = updateProjectSchema.parse(req.body)

      // Check if project exists and belongs to user
      const existingProject = await prisma.project.findFirst({
        where: { id, userId }
      })

      if (!existingProject) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }

      const updateData: any = {}
      
      if (validatedData.name !== undefined) updateData.name = validatedData.name
      if (validatedData.description !== undefined) updateData.description = validatedData.description
      if (validatedData.color !== undefined) updateData.color = validatedData.color
      if (validatedData.status !== undefined) updateData.status = validatedData.status

      const project = await prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: { tasks: true }
          }
        }
      })

      res.json({
        success: true,
        data: project,
        message: 'Project updated successfully'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        })
      }
      console.error('Error updating project:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update project'
      })
    }
  },

  // Delete a project
  async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user!.id

      const project = await prisma.project.findFirst({
        where: { id, userId }
      })

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }

      // Check if project has tasks
      const taskCount = await prisma.task.count({
        where: { projectId: id, parentTaskId: null }
      })

      if (taskCount > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete project with existing tasks. Please move or delete all tasks first.'
        })
      }

      await prisma.project.delete({
        where: { id }
      })

      res.json({
        success: true,
        message: 'Project deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete project'
      })
    }
  },

  // Get project statistics
  async getProjectStats(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user!.id

      const project = await prisma.project.findFirst({
        where: { id, userId }
      })

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        })
      }

      const stats = await prisma.task.groupBy({
        by: ['status'],
        where: { projectId: id, parentTaskId: null },
        _count: {
          status: true
        }
      })

      const totalTasks = await prisma.task.count({
        where: { projectId: id, parentTaskId: null }
      })

      const completedTasks = stats.find(s => s.status === 'COMPLETED')?._count.status || 0
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      res.json({
        success: true,
        data: {
          projectId: id,
          totalTasks,
          completedTasks,
          progressPercentage,
          statusBreakdown: stats.reduce((acc: Record<string, number>, stat: any) => {
            acc[stat.status] = stat._count.status
            return acc
          }, {} as Record<string, number>)
        }
      })
    } catch (error) {
      console.error('Error fetching project stats:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project statistics'
      })
    }
  }
}
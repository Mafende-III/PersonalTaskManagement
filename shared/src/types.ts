// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// User types
export interface User {
  id: string
  email: string
  name?: string
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

// Basic enums
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

// Task types
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
  completedAt?: Date
  position: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
  userId: string
  projectId?: string
  project?: Project
  parentTaskId?: string
  parentTask?: Task
  subTasks?: Task[]
  comments?: Comment[]
  attachments?: Attachment[]
}

export interface CreateTaskRequest {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: Date
  projectId?: string
  tags?: string[]
  parentTaskId?: string
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string
  position?: number
  completedAt?: Date
}

// Project types
export interface Project {
  id: string
  name: string
  description?: string
  color?: string
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
  userId: string
  tasks?: Task[]
}

export interface CreateProjectRequest {
  name: string
  description?: string
  color?: string
  status?: ProjectStatus
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string
}

// Comment types
export interface Comment {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  userId: string
  user?: User
  taskId: string
  task?: Task
}

export interface CreateCommentRequest {
  content: string
  taskId: string
}

export interface UpdateCommentRequest {
  id: string
  content: string
}

// Attachment types
export interface Attachment {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  fileUrl: string
  createdAt: Date
  userId: string
  user?: User
  taskId: string
  task?: Task
}

export interface CreateAttachmentRequest {
  fileName: string
  fileSize: number
  mimeType: string
  fileUrl: string
  taskId: string
} 
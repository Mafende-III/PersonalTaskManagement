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
  
  // New RBAC fields
  accountStatus?: UserAccountStatus
  emailVerified?: boolean
  verifiedAt?: Date
  departmentId?: string
  positionId?: string
  canCreatePersonalProjects?: boolean
  canCreatePersonalTasks?: boolean
  personalProjectLimit?: number
  
  // Relations
  department?: Department
  position?: Position
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

// New RBAC Enums
export enum UserAccountStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  UNASSIGNED = 'UNASSIGNED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED'
}

export enum ProjectType {
  PERSONAL = 'PERSONAL',
  TEAM = 'TEAM'
}

export enum Visibility {
  PRIVATE = 'PRIVATE',
  INTERNAL = 'INTERNAL',
  PUBLIC = 'PUBLIC'
}

export enum ProjectRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export enum TaskRole {
  OWNER = 'OWNER',
  ASSIGNEE = 'ASSIGNEE',
  VIEWER = 'VIEWER'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  MORE_INFO_NEEDED = 'MORE_INFO_NEEDED'
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
  userId: string // Keep for backward compatibility
  tasks?: Task[]
  
  // New RBAC fields
  type?: ProjectType
  visibility?: Visibility
  creatorId?: string
  creator?: User
  teamMembers?: ProjectUser[]
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

// New RBAC Types
export interface Department {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  positions?: Position[]
  users?: User[]
  accessRequests?: AccessRequest[]
}

export interface Position {
  id: string
  name: string
  level: number
  permissions: PositionPermissions
  createdAt: Date
  updatedAt: Date
  departmentId: string
  department?: Department
  users?: User[]
}

export interface ProjectUser {
  id: string
  role: ProjectRole
  assignedAt: Date
  projectId: string
  project?: Project
  userId: string
  user?: User
}

export interface TaskUser {
  id: string
  role: TaskRole
  assignedAt: Date
  taskId: string
  task?: Task
  userId: string
  user?: User
}

export interface AccessRequest {
  id: string
  reason: string
  supervisorName?: string
  status: RequestStatus
  reviewNotes?: string
  createdAt: Date
  reviewedAt?: Date
  userId: string
  user?: User
  departmentId: string
  department?: Department
  reviewedBy?: string
  reviewer?: User
}

// Permission Structure
export interface PositionPermissions {
  project: {
    create: boolean
    delete: 'own' | 'department' | 'all' | false
    edit: 'own' | 'assigned' | 'department' | 'all' | false
    view: 'own' | 'assigned' | 'department' | 'all' | false
    assignUsers: boolean
  }
  task: {
    create: 'standalone' | 'assigned_project' | 'any_project' | false
    delete: 'own' | 'assigned' | 'department' | 'all' | false
    edit: 'own' | 'assigned' | 'department' | 'all' | false
    createSubtask: 'own' | 'assigned' | false
  }
  user: {
    invite: boolean
    edit: 'subordinate' | 'department' | 'all' | false
    viewDetails: 'subordinate' | 'department' | 'all' | false
  }
  department: {
    manage: boolean
    editHierarchy: boolean
  }
}

// Request/Response Types for RBAC
export interface CreateDepartmentRequest {
  name: string
  description?: string
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  id: string
}

export interface CreatePositionRequest {
  name: string
  level: number
  permissions: PositionPermissions
  departmentId: string
}

export interface UpdatePositionRequest extends Partial<CreatePositionRequest> {
  id: string
}

export interface CreateAccessRequestRequest {
  reason: string
  supervisorName?: string
  departmentId: string
}

export interface UpdateAccessRequestRequest {
  id: string
  status: RequestStatus
  reviewNotes?: string
}

export interface AssignUserRequest {
  userId: string
  departmentId: string
  positionId: string
}

export interface ProjectTeamAssignmentRequest {
  projectId: string
  userId: string
  role: ProjectRole
}

export interface TaskAssignmentRequest {
  taskId: string
  userId: string
  role: TaskRole
} 
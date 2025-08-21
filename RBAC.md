# Role-Based Access Control & Hierarchy System Specification

## Overview
Implement a flexible hierarchical permission system that allows organizations to define custom department structures, assign roles, and control access to projects and tasks based on organizational hierarchy.

## Core Concepts

### 1. User Management Enhancement
```typescript
// Database Schema Updates
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  verified      Boolean   @default(false)
  
  // New fields for organizational structure
  departmentId  String?
  department    Department? @relation(fields: [departmentId], references: [id])
  positionId    String?
  position      Position?   @relation(fields: [positionId], references: [id])
  
  // Relationships
  createdProjects    Project[]    @relation("ProjectCreator")
  assignedProjects   ProjectUser[]
  createdTasks       Task[]       @relation("TaskCreator")
  assignedTasks      TaskUser[]
  comments           Comment[]
  activities         Activity[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 2. Department & Position Models
```typescript
model Department {
  id            String    @id @default(cuid())
  name          String
  description   String?
  
  // Relationships
  positions     Position[]
  users         User[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Position {
  id            String    @id @default(cuid())
  name          String
  level         Int       // Hierarchy level (1 = highest)
  departmentId  String
  department    Department @relation(fields: [departmentId], references: [id])
  
  // Permissions configuration
  permissions   Json      // Flexible permission structure
  
  // Relationships
  users         User[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 3. Project & Task Access Control
```typescript
model Project {
  id            String    @id @default(cuid())
  name          String
  description   String?
  status        ProjectStatus @default(ACTIVE)
  
  // Access control
  creatorId     String
  creator       User      @relation("ProjectCreator", fields: [creatorId], references: [id])
  teamMembers   ProjectUser[]
  
  // Other fields...
}

model ProjectUser {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  role          ProjectRole @default(MEMBER) // OWNER, ADMIN, MEMBER, VIEWER
  
  assignedAt    DateTime  @default(now())
  
  @@unique([projectId, userId])
}

model Task {
  id            String    @id @default(cuid())
  title         String
  description   String?
  
  // Access control
  creatorId     String
  creator       User      @relation("TaskCreator", fields: [creatorId], references: [id])
  assignees     TaskUser[]
  
  // Task hierarchy
  parentTaskId  String?
  parentTask    Task?     @relation("SubTasks", fields: [parentTaskId], references: [id])
  subTasks      Task[]    @relation("SubTasks")
  
  // Other fields...
}

model TaskUser {
  id            String    @id @default(cuid())
  taskId        String
  task          Task      @relation(fields: [taskId], references: [id])
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  role          TaskRole  @default(ASSIGNEE) // OWNER, ASSIGNEE, VIEWER
  
  assignedAt    DateTime  @default(now())
  
  @@unique([taskId, userId])
}
```

### 4. Comments & Collaboration
```typescript
model Comment {
  id            String    @id @default(cuid())
  content       String
  
  // Polymorphic relationship
  entityType    EntityType // PROJECT, TASK
  entityId      String
  
  authorId      String
  author        User      @relation(fields: [authorId], references: [id])
  
  attachments   Attachment[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Attachment {
  id            String    @id @default(cuid())
  filename      String
  url           String
  mimeType      String
  size          Int
  
  commentId     String?
  comment       Comment?  @relation(fields: [commentId], references: [id])
  
  uploaderId    String
  uploader      User      @relation(fields: [uploaderId], references: [id])
  
  createdAt     DateTime  @default(now())
}
```

## Permission System

### 1. Permission Structure
```typescript
interface PositionPermissions {
  project: {
    create: boolean;
    delete: 'own' | 'department' | 'all' | false;
    edit: 'own' | 'assigned' | 'department' | 'all' | false;
    view: 'own' | 'assigned' | 'department' | 'all' | false;
    assignUsers: boolean;
  };
  task: {
    create: 'standalone' | 'assigned_project' | 'any_project' | false;
    delete: 'own' | 'assigned' | 'department' | 'all' | false;
    edit: 'own' | 'assigned' | 'department' | 'all' | false;
    createSubtask: 'own' | 'assigned' | false;
  };
  user: {
    invite: boolean;
    edit: 'subordinate' | 'department' | 'all' | false;
    viewDetails: 'subordinate' | 'department' | 'all' | false;
  };
  department: {
    manage: boolean;
    editHierarchy: boolean;
  };
}
```

### 2. Hierarchy Rules
```typescript
class HierarchyService {
  // Check if user A can manage user B
  canManageUser(managerPosition: Position, userPosition: Position): boolean {
    // Same department check
    if (managerPosition.departmentId !== userPosition.departmentId) {
      return false;
    }
    
    // Hierarchy level check (lower number = higher position)
    return managerPosition.level < userPosition.level;
  }
  
  // Get all subordinates
  async getSubordinates(userId: string): Promise<User[]> {
    const user = await getUserWithPosition(userId);
    if (!user.position) return [];
    
    return await db.user.findMany({
      where: {
        departmentId: user.departmentId,
        position: {
          level: { gt: user.position.level }
        }
      }
    });
  }
}
```

## User Interface Components

### 1. User Management Panel
```tsx
// Admin panel for user management
const UserManagementPanel = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User List */}
      <div className="lg:col-span-2">
        <UserList 
          showDepartment 
          showPosition 
          onEdit={handleEditUser}
        />
      </div>
      
      {/* User Form */}
      <div>
        <UserForm 
          departments={departments}
          positions={filteredPositions}
          onSubmit={handleSaveUser}
        />
      </div>
    </div>
  );
};

// User form with department/position assignment
const UserForm = ({ user, departments, onSubmit }) => {
  const [selectedDepartment, setSelectedDepartment] = useState(user?.departmentId);
  const positions = usePositionsByDepartment(selectedDepartment);
  
  return (
    <form onSubmit={handleSubmit}>
      <Input name="name" label="Full Name" required />
      <Input name="email" label="Email" type="email" required />
      
      <Select 
        label="Department"
        value={selectedDepartment}
        onChange={setSelectedDepartment}
        options={departments}
      />
      
      <Select 
        label="Position"
        value={user?.positionId}
        options={positions}
        disabled={!selectedDepartment}
      />
      
      <Button type="submit">Save User</Button>
    </form>
  );
};
```

### 2. Department Hierarchy Builder
```tsx
// Visual hierarchy builder
const HierarchyBuilder = ({ department }) => {
  const [positions, setPositions] = useState([]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{department.name} Hierarchy</h3>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="positions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {positions.map((position, index) => (
                <Draggable key={position.id} draggableId={position.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex items-center gap-4 p-4 bg-white rounded-lg shadow mb-2"
                    >
                      <span className="text-2xl font-bold text-gray-400">
                        {position.level}
                      </span>
                      <div className="flex-1">
                        <input
                          value={position.name}
                          onChange={(e) => updatePosition(position.id, e.target.value)}
                          className="font-medium"
                        />
                      </div>
                      <PermissionConfig position={position} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <Button onClick={addNewPosition}>Add Position</Button>
    </div>
  );
};
```

### 3. Project Team Management
```tsx
// Project team assignment interface
const ProjectTeamManager = ({ project, currentUser }) => {
  const canAssignUsers = usePermission('project.assignUsers');
  const availableUsers = useAvailableUsers(currentUser);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Project Team</h3>
        {canAssignUsers && (
          <Button onClick={() => setShowAddMember(true)}>
            Add Team Member
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {project.teamMembers.map(member => (
          <TeamMemberRow 
            key={member.id}
            member={member}
            canEdit={canAssignUsers}
            onRoleChange={handleRoleChange}
            onRemove={handleRemoveMember}
          />
        ))}
      </div>
      
      {showAddMember && (
        <AddTeamMemberModal
          availableUsers={availableUsers}
          onAdd={handleAddMember}
          onClose={() => setShowAddMember(false)}
        />
      )}
    </div>
  );
};
```

### 4. Task Assignment with Permissions
```tsx
// Task creation with permission checks
const TaskForm = ({ project, parentTask }) => {
  const user = useCurrentUser();
  const canCreateTask = useCanCreateTask(project, parentTask);
  
  if (!canCreateTask) {
    return <Alert>You don't have permission to create tasks here.</Alert>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input name="title" label="Task Title" required />
      <Textarea name="description" label="Description" />
      
      {/* Only show assignee selector if user has permission */}
      {project && (
        <UserSelector
          label="Assign To"
          users={project.teamMembers}
          multiple
        />
      )}
      
      <Button type="submit">Create Task</Button>
    </form>
  );
};
```

### 5. Comments & Discussion Panel
```tsx
// Universal comment component
const CommentSection = ({ entityType, entityId }) => {
  const comments = useComments(entityType, entityId);
  const canComment = usePermission('comment.create');
  
  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Discussion</h4>
      
      <div className="space-y-3">
        {comments.map(comment => (
          <CommentCard 
            key={comment.id}
            comment={comment}
            onEdit={canEditComment(comment) ? handleEdit : undefined}
            onDelete={canDeleteComment(comment) ? handleDelete : undefined}
          />
        ))}
      </div>
      
      {canComment && (
        <CommentForm 
          onSubmit={handleAddComment}
          allowAttachments
        />
      )}
    </div>
  );
};
```

## API Endpoints

### 1. User & Department Management
```typescript
// Department & hierarchy endpoints
POST   /api/departments                    // Create department
GET    /api/departments                    // List departments
PUT    /api/departments/:id               // Update department
DELETE /api/departments/:id               // Delete department

POST   /api/departments/:id/positions     // Add position
PUT    /api/positions/:id                 // Update position
DELETE /api/positions/:id                 // Remove position
PUT    /api/positions/reorder             // Reorder hierarchy

// User management
GET    /api/users                         // List users (filtered by permissions)
PUT    /api/users/:id                     // Update user (with permission check)
POST   /api/users/:id/assign-position     // Assign position
GET    /api/users/subordinates            // Get user's subordinates
```

### 2. Project & Task Access Control
```typescript
// Project team management
POST   /api/projects/:id/team             // Add team member
PUT    /api/projects/:id/team/:userId     // Update member role
DELETE /api/projects/:id/team/:userId     // Remove team member
GET    /api/projects/accessible           // Get projects user can access

// Task assignment
POST   /api/tasks/:id/assignees           // Assign users to task
DELETE /api/tasks/:id/assignees/:userId   // Unassign user
GET    /api/tasks/assigned                // Get user's assigned tasks
```

### 3. Permission Checking
```typescript
// Permission check endpoints
GET    /api/permissions/check             // Check specific permission
GET    /api/permissions/my-permissions    // Get all user permissions
POST   /api/permissions/can-access        // Check resource access
```

## Security Implementation

### 1. Middleware for Access Control
```typescript
// Permission checking middleware
const requirePermission = (resource: string, action: string) => {
  return async (req, res, next) => {
    const user = req.user;
    const hasPermission = await permissionService.check(user, resource, action);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Resource ownership middleware
const requireOwnership = (resourceType: string) => {
  return async (req, res, next) => {
    const user = req.user;
    const resourceId = req.params.id;
    
    const isOwner = await ownershipService.check(user.id, resourceType, resourceId);
    
    if (!isOwner) {
      return res.status(403).json({ error: 'You must be the owner to perform this action' });
    }
    
    next();
  };
};
```

### 2. Row-Level Security
```typescript
// Prisma middleware for automatic filtering
prisma.$use(async (params, next) => {
  if (params.model === 'Project' && params.action === 'findMany') {
    const user = getCurrentUser();
    const permission = await getProjectViewPermission(user);
    
    if (permission === 'assigned') {
      params.args.where = {
        ...params.args.where,
        OR: [
          { creatorId: user.id },
          { teamMembers: { some: { userId: user.id } } }
        ]
      };
    } else if (permission === 'department') {
      params.args.where = {
        ...params.args.where,
        creator: { departmentId: user.departmentId }
      };
    }
  }
  
  return next(params);
});
```

## Implementation Priority

### Phase 1: Core Infrastructure (Week 1)
- Database schema updates
- Basic user/department/position models
- Permission system foundation

### Phase 2: User Management (Week 2)
- User CRUD with department/position
- Department hierarchy builder
- Basic permission checks

### Phase 3: Access Control (Week 3)
- Project team management
- Task assignment system
- Ownership validation

### Phase 4: Collaboration Features (Week 4)
- Comments system
- File attachments
- Activity tracking
- UI polish and testing

This system provides flexible, hierarchical access control while maintaining security and usability!
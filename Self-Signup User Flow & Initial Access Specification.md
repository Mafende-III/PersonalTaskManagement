# Self-Signup User Flow & Initial Access Specification

## Overview
Define how self-registered users can interact with the system before being assigned to a department or receiving formal permissions.

## User States

### 1. User Account States
```typescript
enum UserAccountStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',  // Email not verified
  UNASSIGNED = 'UNASSIGNED',                     // Verified but no department/position
  ACTIVE = 'ACTIVE',                              // Assigned to department with position
  SUSPENDED = 'SUSPENDED',                        // Account suspended
  ARCHIVED = 'ARCHIVED'                           // No longer with organization
}

model User {
  // ... existing fields
  
  accountStatus  UserAccountStatus @default(PENDING_VERIFICATION)
  emailVerified  Boolean          @default(false)
  verifiedAt     DateTime?
  
  // Default permissions for unassigned users
  canCreatePersonalProjects  Boolean @default(true)
  canCreatePersonalTasks     Boolean @default(true)
  personalProjectLimit       Int     @default(3)  // Limit personal projects
}
```

## Self-Signup Flow

### 1. Registration Process
```tsx
// Registration flow with clear messaging
const RegistrationForm = () => {
  return (
    <form onSubmit={handleRegister}>
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Welcome!</strong> After registration, you'll have access to:
          • Create personal projects and tasks
          • View public company resources
          • Update your profile
          
          To collaborate on team projects, an administrator will need to assign you to a department.
        </p>
      </div>
      
      <Input name="name" label="Full Name" required />
      <Input name="email" label="Work Email" type="email" required />
      <Input name="password" label="Password" type="password" required />
      
      <Button type="submit">Create Account</Button>
    </form>
  );
};
```

### 2. Post-Registration Dashboard
```tsx
// Dashboard for unassigned users
const UnassignedUserDashboard = () => {
  const user = useCurrentUser();
  
  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Alert variant="info" className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">Account Status: Awaiting Department Assignment</h4>
          <p className="text-sm mt-1">
            You can create personal projects while waiting for department assignment.
            Contact your administrator for team access.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={requestAccess}>
          Request Department Access
        </Button>
      </Alert>
      
      {/* Limited Feature Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Personal Projects"
          value={`${personalProjects.length}/${user.personalProjectLimit}`}
          icon={FiFolder}
          action={() => navigate('/personal-projects')}
        />
        
        <StatCard
          title="Personal Tasks"
          value={personalTasks.length}
          icon={FiCheckSquare}
          action={() => navigate('/personal-tasks')}
        />
        
        <StatCard
          title="Profile Completion"
          value={`${profileCompletion}%`}
          icon={FiUser}
          action={() => navigate('/profile')}
        />
      </div>
      
      {/* Getting Started Guide */}
      <GettingStartedGuide />
    </div>
  );
};
```

## Permission Model for Unassigned Users

### 1. Default Permissions
```typescript
// Default permissions for unassigned users
const UNASSIGNED_USER_PERMISSIONS = {
  project: {
    create: 'personal',        // Can only create personal projects
    delete: 'own',            // Can delete own projects
    edit: 'own',              // Can edit own projects
    view: 'own',              // Can only view own projects
    assignUsers: false        // Cannot assign other users
  },
  task: {
    create: 'personal',       // Can create personal tasks
    delete: 'own',           // Can delete own tasks
    edit: 'own',             // Can edit own tasks
    createSubtask: 'own',    // Can create subtasks on own tasks
    view: 'own'              // Can only view own tasks
  },
  user: {
    invite: false,           // Cannot invite users
    edit: false,             // Cannot edit other users
    viewDetails: false       // Cannot view other user details
  },
  system: {
    viewPublicResources: true,     // Can view company wiki/resources
    accessHelpCenter: true,        // Can access help documentation
    submitSupportTickets: true,    // Can request help
    viewOrganizationChart: true    // Can see company structure
  }
};
```

### 2. Personal vs Team Resources
```typescript
model Project {
  // ... existing fields
  
  type          ProjectType  @default(TEAM)
  visibility    Visibility   @default(PRIVATE)
}

enum ProjectType {
  PERSONAL  // Created by unassigned users
  TEAM      // Department/team projects
}

enum Visibility {
  PRIVATE   // Only creator/team can see
  INTERNAL  // All authenticated users can see
  PUBLIC    // Anyone can see
}
```

## Admin Notification System

### 1. New User Notifications
```tsx
// Admin dashboard component
const PendingUsersWidget = () => {
  const pendingUsers = usePendingUsers();
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Pending User Assignments</h3>
        <Badge variant="warning">{pendingUsers.length} new</Badge>
      </div>
      
      <div className="space-y-3">
        {pendingUsers.map(user => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500">Registered {formatDate(user.createdAt)}</p>
            </div>
            <Button size="sm" onClick={() => assignUser(user.id)}>
              Assign to Department
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
```

### 2. User Assignment Workflow
```tsx
// Quick assignment modal
const QuickAssignModal = ({ user, onClose }) => {
  const departments = useDepartments();
  const [selectedDept, setSelectedDept] = useState('');
  const positions = usePositionsByDepartment(selectedDept);
  
  return (
    <Modal title={`Assign ${user.name} to Department`} onClose={onClose}>
      <form onSubmit={handleAssign}>
        <Select
          label="Department"
          options={departments}
          value={selectedDept}
          onChange={setSelectedDept}
          required
        />
        
        <Select
          label="Position"
          options={positions}
          disabled={!selectedDept}
          required
        />
        
        <div className="mt-4 p-3 bg-yellow-50 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> User will gain access to department projects and can be assigned tasks after this action.
          </p>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button type="submit">Assign & Notify User</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
};
```

## Access Request System

### 1. User Request Flow
```tsx
// Access request form
const AccessRequestForm = () => {
  return (
    <form onSubmit={handleSubmitRequest}>
      <h3 className="text-lg font-semibold mb-4">Request Department Access</h3>
      
      <Select
        label="Preferred Department"
        options={publicDepartments}
        helpText="Select the department you wish to join"
      />
      
      <Textarea
        label="Reason for Request"
        placeholder="Explain why you need access to this department..."
        rows={4}
      />
      
      <Input
        label="Manager/Supervisor Name"
        placeholder="Who should we contact for approval?"
      />
      
      <Button type="submit" className="mt-4">
        Submit Request
      </Button>
    </form>
  );
};
```

### 2. Request Management
```typescript
model AccessRequest {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  departmentId    String
  department      Department @relation(fields: [departmentId], references: [id])
  reason          String
  supervisorName  String?
  status          RequestStatus @default(PENDING)
  reviewedBy      String?
  reviewer        User?     @relation("ReviewedRequests", fields: [reviewedBy], references: [id])
  reviewNotes     String?
  
  createdAt       DateTime  @default(now())
  reviewedAt      DateTime?
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
  MORE_INFO_NEEDED
}
```

## Email Notifications

### 1. Welcome Email for Self-Registered Users
```typescript
// Email template
const sendWelcomeEmail = async (user: User) => {
  await emailService.send({
    to: user.email,
    subject: 'Welcome to ProjectHub - Account Created',
    template: 'welcome-unassigned',
    data: {
      userName: user.name,
      personalProjectLimit: user.personalProjectLimit,
      helpCenterUrl: `${BASE_URL}/help`,
      requestAccessUrl: `${BASE_URL}/request-access`
    }
  });
};
```

### 2. Assignment Notification
```typescript
// Notify user when assigned to department
const sendAssignmentEmail = async (user: User, department: Department, position: Position) => {
  await emailService.send({
    to: user.email,
    subject: 'You\'ve been assigned to a department!',
    template: 'department-assigned',
    data: {
      userName: user.name,
      departmentName: department.name,
      positionName: position.name,
      accessibleFeatures: getPositionPermissions(position),
      loginUrl: `${BASE_URL}/dashboard`
    }
  });
};
```

## Migration Strategy for Existing Users

### 1. Bulk Assignment Tool
```tsx
// Admin tool for migrating existing users
const BulkUserAssignment = () => {
  const unassignedUsers = useUnassignedUsers();
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Bulk User Assignment</h2>
      
      <Alert variant="info">
        <p>{unassignedUsers.length} users are currently without department assignment</p>
      </Alert>
      
      <UserSelectionTable
        users={unassignedUsers}
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
      />
      
      <div className="flex gap-4">
        <Select
          label="Assign to Department"
          options={departments}
          value={bulkDepartment}
          onChange={setBulkDepartment}
        />
        
        <Select
          label="Default Position"
          options={positions}
          value={bulkPosition}
          onChange={setBulkPosition}
        />
        
        <Button
          onClick={handleBulkAssign}
          disabled={!selectedUsers.length || !bulkDepartment || !bulkPosition}
        >
          Assign {selectedUsers.length} Users
        </Button>
      </div>
    </div>
  );
};
```

## Feature Comparison Table

| Feature | Unassigned User | Assigned User |
|---------|----------------|---------------|
| Create Personal Projects | ✅ (Limited) | ✅ (Unlimited) |
| Create Team Projects | ❌ | ✅ (Based on role) |
| View Team Projects | ❌ | ✅ |
| Create Personal Tasks | ✅ | ✅ |
| Assigned to Tasks | ❌ | ✅ |
| Comment on Projects/Tasks | ❌ | ✅ |
| View Organization Chart | ✅ | ✅ |
| Access Help Center | ✅ | ✅ |
| Calendar Integration | ✅ (Personal) | ✅ (Full) |
| Generate Reports | ✅ (Personal) | ✅ (Based on role) |

This system ensures self-registered users can immediately use the platform for personal productivity while waiting for official department assignment!
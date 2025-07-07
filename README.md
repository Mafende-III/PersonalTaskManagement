# Personal Task Management Tool

A streamlined project and task management web application designed for personal and organizational use, featuring secure user authentication, calendar integration, reporting capabilities, and an intuitive professional interface.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PersonalTaskManagement
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:all
   ```

3. **Complete Setup (Automated)**
   ```bash
   # This will set up everything automatically
   npm run setup:complete
   ```
   
   **OR Manual Setup:**
   ```bash
   # Generate environment file with secure secrets
   npm run setup:env
   
   # Set up database
   npm run setup:db
   
   # Apply database schema
   cd server && npm run db:push && npm run db:generate
   ```

> **📖 Need Help with Credentials?** See [LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md) for detailed explanations of:
> - What DATABASE_URL credentials you actually need
> - How to find your PostgreSQL username/password
> - What JWT secrets are and how to generate them
> - Troubleshooting common setup issues

6. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5001
   - Health check: http://localhost:5001/health
   - Auth API: http://localhost:5001/api/auth

## 📁 Project Structure

```
PersonalTaskManagement/
├── client/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Feature-based modules
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   └── utils/         # Helper functions
│   └── package.json
├── server/                 # Node.js Express backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, validation, etc
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   └── package.json
├── shared/                 # Shared types/constants
│   └── src/
│       ├── types.ts       # TypeScript interfaces
│       └── constants.ts   # Shared constants
└── package.json           # Root package.json
```

## 🛠️ Development Commands

```bash
# Setup (NEW!)
npm run setup:complete  # Complete automated setup
npm run setup:env       # Generate .env file with secure secrets
npm run setup:db        # Set up database

# Development
npm run dev              # Start both client and server
npm run dev:client       # Start frontend only
npm run dev:server       # Start backend only

# Building
npm run build           # Build both client and server
npm run build:client    # Build frontend only
npm run build:server    # Build backend only

# Installation
npm run install:all     # Install all dependencies
npm run install:client  # Install frontend dependencies
npm run install:server  # Install backend dependencies
```

## 🔐 About the Credentials (Local Development)

**DATABASE_URL**: Connection to your local PostgreSQL database
- **Username**: Usually your system username (like `mafendemario`)
- **Password**: Often empty for local development
- **Example**: `postgresql://mafendemario@localhost:5432/task_management`

**JWT Secrets**: Used to secure authentication tokens
- **Generated automatically** by `npm run setup:env`
- **64-character random strings** for maximum security
- **Never commit these to version control**

**All data stays on your computer** - no external servers or cloud services required!

## 🔧 Current Status

### ✅ Completed Features
- [x] **Core Infrastructure**
  - [x] Monorepo structure with shared types
  - [x] React TypeScript frontend with Vite
  - [x] Node.js Express backend with TypeScript
  - [x] PostgreSQL database with Prisma ORM
  - [x] JWT authentication with refresh tokens
  - [x] Development server setup

- [x] **Task Management System**
  - [x] Complete CRUD operations for tasks
  - [x] Task priorities (Low, Medium, High, Urgent)
  - [x] Task status tracking (Todo, In Progress, Completed, Cancelled)
  - [x] Due dates and scheduling
  - [x] Tags system for categorization
  - [x] Task descriptions and detailed information

- [x] **Project Management**
  - [x] Project creation and management
  - [x] Project color coding
  - [x] Task-project relationships
  - [x] Project statistics and analytics
  - [x] Standalone tasks (tasks without projects)

- [x] **Advanced Collaborative Features**
  - [x] **Sub-tasks** - Hierarchical task breakdown
  - [x] **Comments** - Full discussion threads with CRUD operations
  - [x] **Attachments** - File upload/download with drag-and-drop
  - [x] **Task Detail View** - Comprehensive modal interface

- [x] **User Interface**
  - [x] Professional dashboard with analytics
  - [x] Task list and kanban views
  - [x] Advanced filtering and search
  - [x] Responsive design with Tailwind CSS
  - [x] Smooth animations with Framer Motion
  - [x] Floating navigation menu

- [x] **Data Architecture**
  - [x] Smart sub-task filtering (main lists show only top-level tasks)
  - [x] Proper task hierarchy management
  - [x] Real-time UI updates
  - [x] Consistent API response format

### 🎯 Key Features Highlights
- **Sub-task System**: Tasks can have nested sub-tasks, but main views show only top-level tasks for clarity
- **Comments & Discussions**: Full-featured commenting system with user avatars and timestamps
- **File Attachments**: Drag-and-drop file uploads with image previews
- **Project Analytics**: Dashboard shows completion rates and task statistics
- **Advanced Filtering**: Search, filter by project, status, priority
- **Task Detail Modal**: Comprehensive view with tabs for sub-tasks, comments, and attachments

### 📋 Recent Major Updates
- ✅ Implemented complete sub-task, comment, and attachment system
- ✅ Created TaskDetailView with tabbed interface
- ✅ Added smart filtering to separate main tasks from sub-tasks
- ✅ Enhanced dashboard with real-time statistics
- ✅ Built comprehensive project management interface

### 🔄 Next Potential Enhancements
- Calendar integration for timeline view
- Advanced reporting and analytics
- Team collaboration features
- Mobile app development
- Cloud storage for attachments

## 🧪 Testing

### Basic Setup Testing
1. **Test Frontend**: Visit http://localhost:5173 - should show "Personal Task Management Tool"
2. **Test Backend**: Visit http://localhost:5001/health - should show health status
3. **Test API**: Visit http://localhost:5001/api/test - should show API message

### Authentication Testing
Test the authentication endpoints using curl or Postman:

1. **Register User**:
   ```bash
   curl -X POST http://localhost:5001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

2. **Login User**:
   ```bash
   curl -X POST http://localhost:5001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Get Profile** (using token from login):
   ```bash
   curl -X GET http://localhost:5001/api/auth/profile \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

4. **Refresh Token**:
   ```bash
   curl -X POST http://localhost:5001/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
   ```

## 📝 Development Notes

- Each task is completed one at a time
- Testing required after each feature
- Commit to GitHub after successful testing
- Minimal code approach - no sweeping changes
- Focus on current task only

## 🐛 Error Tracking

See `ERROR_LOG.md` for detailed error tracking and solutions.

## 📊 Task Tracking

See `DEVELOPMENT_TASKS.md` for detailed task progress and status. 
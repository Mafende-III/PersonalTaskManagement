import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  FiHome, FiPlus, FiFolder, FiCalendar, FiBarChart, 
  FiSettings, FiLogOut, FiMenu, FiX, FiCheck, FiClock, FiTrendingUp 
} from 'react-icons/fi'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import Container from '../components/layout/Container'
import { TaskList } from '../components/TaskList'
import { ProjectList } from '../components/ProjectList'
import { TaskForm } from '../components/TaskForm'
import { ProjectForm } from '../components/ProjectForm'
import { authService } from '../services/auth'
import { taskService } from '../services/task'
import { projectService } from '../services/project'
import { Task, Project, TaskStatus } from '../../../shared/src/types'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState<'overview' | 'tasks' | 'projects' | 'project-tasks'>('overview')
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [fetchedTasks, fetchedProjects] = await Promise.all([
        taskService.getAllTasks(),
        projectService.getAllProjects()
      ])
      setTasks(fetchedTasks)
      setProjects(fetchedProjects)
      
      // Generate recent activities based on tasks
      const activities = generateRecentActivities(fetchedTasks, fetchedProjects)
      setRecentActivities(activities)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecentActivities = (tasks: Task[], projects: Project[]) => {
    const activities: any[] = []
    
    // Get recently completed tasks (last 7 days)
    const recentlyCompleted = tasks
      .filter(task => task.status === TaskStatus.COMPLETED && task.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 5)
    
    recentlyCompleted.forEach(task => {
      activities.push({
        id: `completed-${task.id}`,
        type: 'task_completed',
        title: `Task completed: ${task.title}`,
        timestamp: task.completedAt,
        icon: 'check',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      })
    })
    
    // Get recently created tasks (last 7 days)
    const recentlyCreated = tasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
    
    recentlyCreated.forEach(task => {
      if (!activities.find(a => a.id === `completed-${task.id}`)) {
        activities.push({
          id: `created-${task.id}`,
          type: 'task_created',
          title: `New task: ${task.title}`,
          timestamp: task.createdAt,
          icon: 'plus',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        })
      }
    })
    
    // Get recently created projects
    const recentProjects = projects
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
    
    recentProjects.forEach(project => {
      activities.push({
        id: `project-${project.id}`,
        type: 'project_created',
        title: `New project: ${project.name}`,
        timestamp: project.createdAt,
        icon: 'folder',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      })
    })
    
    // Sort by timestamp and take latest 5
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }

  useEffect(() => {
    fetchData()
  }, [refreshKey])

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const user = await authService.getCurrentUser()
      setIsAdmin(user?.position?.name === 'System Administrator')
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/')
  }

  const handleSettingsClick = () => {
    if (isAdmin) {
      navigate('/admin')
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setIsTaskFormOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskFormOpen(true)
  }

  const handleTaskFormClose = () => {
    setIsTaskFormOpen(false)
    setEditingTask(null)
  }

  const handleTaskFormSave = () => {
    // Force TaskList to refresh
    setRefreshKey(prev => prev + 1)
    // Switch to tasks view after creating a task so user can see it
    setCurrentView('tasks')
  }

  const handleCreateProject = () => {
    setEditingProject(null)
    setIsProjectFormOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsProjectFormOpen(true)
  }

  const handleViewProjectTasks = (project: Project) => {
    setSelectedProject(project)
    setCurrentView('project-tasks')
  }

  const handleProjectFormClose = () => {
    setIsProjectFormOpen(false)
    setEditingProject(null)
  }

  const handleProjectFormSave = () => {
    // Force refresh of components that use projects
    setRefreshKey(prev => prev + 1)
  }

  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length
  const inProgressTasks = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length
  const totalTasks = tasks.length
  const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const handleStatsClick = (statLabel: string) => {
    if (statLabel === 'Projects') {
      setCurrentView('projects')
    } else {
      setCurrentView('tasks')
    }
  }

  const stats = [
    { 
      label: 'Total Tasks', 
      value: totalTasks.toString(), 
      change: '-', 
      color: 'bg-primary-500', 
      icon: FiFolder,
      onClick: () => handleStatsClick('Total Tasks')
    },
    { 
      label: 'Completed', 
      value: completedTasks.toString(), 
      change: '-', 
      color: 'bg-green-500', 
      icon: FiCheck,
      onClick: () => handleStatsClick('Completed')
    },
    { 
      label: 'In Progress', 
      value: inProgressTasks.toString(), 
      change: '-', 
      color: 'bg-yellow-500', 
      icon: FiClock,
      onClick: () => handleStatsClick('In Progress')
    },
    { 
      label: 'Projects', 
      value: projects.length.toString(), 
      change: '-', 
      color: 'bg-purple-500', 
      icon: FiTrendingUp,
      onClick: () => handleStatsClick('Projects')
    }
  ]

  const quickActions = [
    { label: 'New Task', icon: FiPlus, color: 'bg-primary-500', onClick: handleCreateTask },
    { label: 'New Project', icon: FiFolder, color: 'bg-green-500', onClick: handleCreateProject },
    { label: 'Calendar', icon: FiCalendar, color: 'bg-blue-500', onClick: () => {} },
    { label: 'Reports', icon: FiBarChart, color: 'bg-purple-500', onClick: () => {} }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <Container>
          <div className="flex justify-between items-center h-16">
            {/* Logo & Mobile Menu */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden mr-2"
                icon={isSidebarOpen ? <FiX /> : <FiMenu />}
              >
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiCheck className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 font-display">TaskFlow</h1>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                icon={<FiSettings />}
                onClick={handleSettingsClick}
                title={isAdmin ? "Admin Panel" : "Settings"}
              >
                {isAdmin ? "Admin" : ""}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                icon={<FiLogOut />}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: isSidebarOpen ? 0 : -300 }}
          className="fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200/50 shadow-lg lg:shadow-none z-50 lg:z-0 lg:translate-x-0"
        >
          <nav className="p-6 space-y-2 mt-16 lg:mt-0">
            <SidebarItem 
              icon={FiHome} 
              label="Overview" 
              active={currentView === 'overview'}
              onClick={() => setCurrentView('overview')}
            />
            <SidebarItem 
              icon={FiCheck} 
              label="Tasks" 
              active={currentView === 'tasks'}
              onClick={() => setCurrentView('tasks')}
            />
            <SidebarItem icon={FiFolder} label="Projects" />
            <SidebarItem icon={FiCalendar} label="Calendar" />
            <SidebarItem icon={FiBarChart} label="Reports" />
            <SidebarItem icon={FiSettings} label="Settings" />
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <Container className="py-8">
            {currentView === 'overview' ? (
              <>
                {/* Welcome Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h2 className="responsive-subheading font-bold text-gray-900 mb-2">
                    Welcome back! 👋
                  </h2>
                  <p className="responsive-body text-gray-600">
                    Here's what's happening with your projects today.
                  </p>
                </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {stats.map((stat, index) => (
                <StatCard key={stat.label} stat={stat} index={index} />
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Card padding="lg" className="border-gray-200/50">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FiPlus className="w-5 h-5" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <QuickActionCard key={action.label} action={action} index={index} />
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Recent Activity & Welcome Message */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card padding="lg" className="border-gray-200/50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivities.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No recent activity yet. Start by creating your first task!
                      </p>
                    ) : (
                      recentActivities.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card padding="lg" className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <FiCheck className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3">You're all set!</h3>
                    <p className="text-primary-100 mb-6 leading-relaxed">
                      Welcome to TaskFlow! Start by creating your first project or adding some tasks to get organized.
                    </p>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="bg-white text-primary-600 hover:bg-primary-50"
                      icon={<FiPlus />}
                    >
                      Get Started
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
              </>
            ) : currentView === 'tasks' ? (
              <TaskList 
                key={refreshKey}
                onCreateTask={handleCreateTask}
                onEditTask={handleEditTask}
              />
            ) : currentView === 'project-tasks' && selectedProject ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <button
                      onClick={() => setCurrentView('projects')}
                      className="mr-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      ← Back to Projects
                    </button>
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: selectedProject.color }}
                      />
                      <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name} Tasks</h2>
                    </div>
                  </div>
                </div>
                <TaskList 
                  key={`${refreshKey}-${selectedProject.id}`}
                  projectId={selectedProject.id}
                  onCreateTask={handleCreateTask}
                  onEditTask={handleEditTask}
                />
              </div>
            ) : (
              <ProjectList 
                key={refreshKey}
                onCreateProject={handleCreateProject}
                onEditProject={handleEditProject}
                onViewProject={handleViewProjectTasks}
              />
            )}
          </Container>
        </main>
      </div>

      {/* Floating Navigation Menu */}
      <FloatingNavMenu currentView={currentView} setCurrentView={setCurrentView} />

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleTaskFormClose}
        onSave={handleTaskFormSave}
        task={editingTask}
      />

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={isProjectFormOpen}
        onClose={handleProjectFormClose}
        onSave={handleProjectFormSave}
        project={editingProject}
      />
    </div>
  )
}

// Sidebar Item Component
const SidebarItem: React.FC<{ 
  icon: React.ComponentType<{ className?: string }>, 
  label: string, 
  active?: boolean,
  onClick?: () => void
}> = ({ icon: Icon, label, active = false, onClick }) => (
  <motion.button
    whileHover={{ x: 4 }}
    onClick={onClick}
    className={`
      w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
      ${active 
        ? 'bg-primary-50 text-primary-600 border border-primary-200' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }
    `}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </motion.button>
)

// Stat Card Component
const StatCard: React.FC<{ stat: any, index: number }> = ({ stat, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={stat.onClick}
    className="cursor-pointer"
  >
    <Card variant="interactive" padding="lg" className="border-gray-200/50 hover:border-primary-200 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-500 font-medium">{stat.change === '-' ? 'Click to view' : `${stat.change} from last week`}</p>
        </div>
        <div className={`p-3 rounded-xl ${stat.color}`}>
          <stat.icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  </motion.div>
)

// Quick Action Card Component
const QuickActionCard: React.FC<{ action: any, index: number }> = ({ action, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={action.onClick}
    className={`
      ${action.color} p-4 rounded-xl text-white cursor-pointer
      transition-all duration-200 hover:shadow-lg
    `}
  >
    <action.icon className="w-6 h-6 mb-2" />
    <p className="font-medium text-sm">{action.label}</p>
  </motion.div>
)

// Activity Item Component
const ActivityItem: React.FC<{ activity: any }> = ({ activity }) => {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'check': return FiCheck
      case 'plus': return FiPlus
      case 'folder': return FiFolder
      default: return FiCheck
    }
  }

  const Icon = getIcon(activity.icon)
  
  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago` : 'Just now'
    }
  }

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-8 h-8 ${activity.bgColor} rounded-full flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${activity.color}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</p>
      </div>
    </div>
  )
}

// Floating Navigation Menu Component
const FloatingNavMenu: React.FC<{
  currentView: 'overview' | 'tasks' | 'projects' | 'project-tasks'
  setCurrentView: (view: 'overview' | 'tasks' | 'projects') => void
}> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { view: 'overview' as const, icon: FiHome, label: 'Overview' },
    { view: 'tasks' as const, icon: FiCheck, label: 'Tasks' },
    { view: 'projects' as const, icon: FiFolder, label: 'Projects' }
  ]

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50"
    >
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-2">
        <div className="flex flex-col space-y-1">
          {navItems.map((item) => (
            <motion.button
              key={item.view}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView(item.view)}
              className={`
                p-3 rounded-xl transition-all duration-200 flex flex-col items-center space-y-1 min-w-[60px]
                ${currentView === item.view || (currentView === 'project-tasks' && item.view === 'projects')
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-xs">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default Dashboard
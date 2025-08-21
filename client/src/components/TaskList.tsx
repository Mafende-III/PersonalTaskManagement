import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Task, TaskStatus, TaskPriority, Project } from '../../../shared/src/types'
import { taskService } from '../services/task'
import { projectService } from '../services/project'
import { TaskCard } from './TaskCard'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { FiPlus, FiSearch } from 'react-icons/fi'

interface TaskListProps {
  projectId?: string
  onCreateTask: () => void
  onEditTask: (task: Task) => void
}

export const TaskList: React.FC<TaskListProps> = ({ projectId, onCreateTask, onEditTask }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [projectFilter, setProjectFilter] = useState<string>('')
  const [projects, setProjects] = useState<Project[]>([])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (projectId) params.projectId = projectId
      else if (projectFilter === 'standalone') params.projectId = 'null'
      else if (projectFilter && projectFilter !== '') params.projectId = projectFilter
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      if (searchQuery) params.search = searchQuery

      const fetchedTasks = await taskService.getAllTasks(params)
      setTasks(fetchedTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const fetchedProjects = await projectService.getAllProjects()
      setProjects(fetchedProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [projectId, statusFilter, priorityFilter, searchQuery, projectFilter])

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await taskService.updateTask(taskId, { status })
      fetchTasks()
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId)
        fetchTasks()
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
  }

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = []
    }
    acc[task.status].push(task)
    return acc
  }, {} as Record<TaskStatus, Task[]>)

  const taskColumns = [
    { status: TaskStatus.TODO, title: 'To Do', color: 'bg-gray-100' },
    { status: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-100' },
    { status: TaskStatus.COMPLETED, title: 'Completed', color: 'bg-green-100' },
    { status: TaskStatus.CANCELLED, title: 'Cancelled', color: 'bg-red-100' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <Button onClick={onCreateTask} icon={<FiPlus />}>
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            icon={<FiSearch />}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value={TaskStatus.TODO}>To Do</option>
          <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
          <option value={TaskStatus.COMPLETED}>Completed</option>
          <option value={TaskStatus.CANCELLED}>Cancelled</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Priorities</option>
          <option value={TaskPriority.LOW}>Low</option>
          <option value={TaskPriority.MEDIUM}>Medium</option>
          <option value={TaskPriority.HIGH}>High</option>
          <option value={TaskPriority.URGENT}>Urgent</option>
        </select>

        {!projectId && (
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            <option value="standalone">Standalone Tasks</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {taskColumns.map((column) => (
          <div key={column.status} className="space-y-4">
            <div className={`p-3 rounded-lg ${column.color}`}>
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="text-sm text-gray-600">
                {groupedTasks[column.status]?.length || 0} tasks
              </span>
            </div>
            
            <div className="space-y-3 min-h-64">
              <AnimatePresence>
                {groupedTasks[column.status]?.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                    onTaskUpdate={fetchTasks}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter || priorityFilter
              ? 'Try adjusting your filters or search query.'
              : 'Create your first task to get started!'}
          </p>
          <Button onClick={onCreateTask}>Create Task</Button>
        </div>
      )}
    </div>
  )
}
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Task, TaskStatus } from '../../../shared/src/types'
import { FiCalendar, FiEdit2, FiTrash2, FiClock, FiList, FiEye } from 'react-icons/fi'
import { SubTaskList } from './SubTaskList'
import { TaskDetailView } from './TaskDetailView'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onTaskUpdate?: () => void
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
}

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange, onTaskUpdate }) => {
  const [showSubTasks, setShowSubTasks] = useState(false)
  const [showDetailView, setShowDetailView] = useState(false)
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED
  const isCompleted = task.status === TaskStatus.COMPLETED
  const subTasksCount = task.subTasks?.length || 0
  const completedSubTasks = task.subTasks?.filter(st => st.status === TaskStatus.COMPLETED).length || 0

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
        isCompleted ? 'border-green-500' : 
        isOverdue ? 'border-red-500' : 
        'border-blue-500'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className={`font-semibold text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetailView(true)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <FiEye size={16} />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit Task"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete Task"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
            {task.status.replace('_', ' ')}
          </span>
          {subTasksCount > 0 && (
            <button
              onClick={() => setShowSubTasks(!showSubTasks)}
              className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
            >
              <FiList size={12} />
              {completedSubTasks}/{subTasksCount}
            </button>
          )}
        </div>
        
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue ? 'text-red-600' : 'text-gray-500'
          }`}>
            <FiCalendar size={12} />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {task.project && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: task.project.color }}
          />
          {task.project.name}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <FiClock size={12} />
            {new Date(task.updatedAt).toLocaleDateString()}
          </div>
          
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
            <option value={TaskStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Sub-tasks Section */}
      {(showSubTasks || subTasksCount === 0) && (
        <SubTaskList 
          parentTask={task} 
          onSubTaskUpdate={onTaskUpdate || (() => {})} 
        />
      )}

      {/* Task Detail View Modal */}
      <TaskDetailView
        taskId={task.id}
        isOpen={showDetailView}
        onClose={() => setShowDetailView(false)}
        onTaskUpdate={onTaskUpdate || (() => {})}
      />
    </motion.div>
  )
}
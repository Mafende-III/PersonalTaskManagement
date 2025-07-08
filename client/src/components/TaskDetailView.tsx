import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, TaskStatus, TaskPriority } from '../../../shared/src/types'
import { taskService } from '../services/task'
import { SubTaskList } from './SubTaskList'
import { CommentList } from './CommentList'
import { AttachmentList } from './AttachmentList'
import { SubTaskForm } from './SubTaskForm'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { 
  FiX, 
  FiEdit2, 
  FiSave, 
  FiCalendar, 
  FiClock, 
  FiUser,
  FiTag,
  FiFolder,
  FiList,
  FiMessageCircle,
  FiPaperclip,
  FiPlus
} from 'react-icons/fi'

interface TaskDetailViewProps {
  taskId: string
  isOpen: boolean
  onClose: () => void
  onTaskUpdate: () => void
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({ 
  taskId, 
  isOpen, 
  onClose, 
  onTaskUpdate 
}) => {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')
  const [activeTab, setActiveTab] = useState<'subtasks' | 'comments' | 'attachments'>('subtasks')
  const [isSubTaskFormOpen, setIsSubTaskFormOpen] = useState(false)

  const fetchTask = async () => {
    try {
      setLoading(true)
      const foundTask = await taskService.getTaskById(taskId)
      setTask(foundTask)
      setEditData({
        title: foundTask.title,
        description: foundTask.description || '',
        status: foundTask.status,
        priority: foundTask.priority,
        dueDate: foundTask.dueDate ? new Date(foundTask.dueDate).toISOString().split('T')[0] : '',
        tags: foundTask.tags || []
      })
    } catch (error) {
      console.error('Error fetching task:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTask()
    }
  }, [isOpen, taskId])

  const handleSave = async () => {
    if (!task) return

    try {
      await taskService.updateTask(task.id, {
        ...editData,
        dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString() : undefined
      })
      
      setIsEditing(false)
      fetchTask()
      onTaskUpdate()
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task. Please try again.')
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !editData.tags.includes(newTag.trim())) {
      setEditData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag.trim()] 
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }))
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200'
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case TaskStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'bg-red-100 text-red-800 border-red-200'
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : task ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <Input
                        value={editData.title}
                        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                        className="text-2xl font-bold mb-2"
                        placeholder="Task title"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {task.project && (
                        <div className="flex items-center space-x-1">
                          <FiFolder size={14} />
                          <span style={{ color: task.project.color }}>{task.project.name}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <FiUser size={14} />
                        <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center space-x-1">
                          <FiCalendar size={14} />
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSave}
                          icon={<FiSave />}
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                        icon={<FiEdit2 />}
                      >
                        Edit
                      </Button>
                    )}
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="flex items-center space-x-3 mt-4">
                  {isEditing ? (
                    <>
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                        className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={TaskStatus.TODO}>To Do</option>
                        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                        <option value={TaskStatus.COMPLETED}>Completed</option>
                        <option value={TaskStatus.CANCELLED}>Cancelled</option>
                      </select>
                      <select
                        value={editData.priority}
                        onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                        className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={TaskPriority.LOW}>Low</option>
                        <option value={TaskPriority.MEDIUM}>Medium</option>
                        <option value={TaskPriority.HIGH}>High</option>
                        <option value={TaskPriority.URGENT}>Urgent</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="mt-4">
                  {isEditing ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Task description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : task.description ? (
                    <p className="text-gray-700">{task.description}</p>
                  ) : (
                    <p className="text-gray-400 italic">No description</p>
                  )}
                </div>

                {/* Tags */}
                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiTag size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Tags</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {editData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <FiX size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add tag"
                          size="sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <Button onClick={handleAddTag} size="sm" disabled={!newTag.trim()}>
                          Add
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {task.tags && task.tags.length > 0 ? (
                        task.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">No tags</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('subtasks')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'subtasks'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <FiList size={16} />
                      <span>Sub-tasks ({task.subTasks?.length || 0})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'comments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <FiMessageCircle size={16} />
                      <span>Comments ({task.comments?.length || 0})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('attachments')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'attachments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <FiPaperclip size={16} />
                      <span>Attachments ({task.attachments?.length || 0})</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'subtasks' && (
                  <SubTaskList
                    parentTask={task}
                    onSubTaskUpdate={fetchTask}
                  />
                )}
                
                {activeTab === 'comments' && (
                  <CommentList
                    taskId={task.id}
                    onCommentUpdate={fetchTask}
                  />
                )}
                
                {activeTab === 'attachments' && (
                  <AttachmentList
                    taskId={task.id}
                    onAttachmentUpdate={fetchTask}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500">Task not found</p>
                <Button onClick={onClose} className="mt-4">
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Sub-task Form Modal */}
          <SubTaskForm
            isOpen={isSubTaskFormOpen}
            onClose={() => setIsSubTaskFormOpen(false)}
            onSave={() => {
              fetchTask()
              onTaskUpdate()
            }}
            parentTask={task!}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
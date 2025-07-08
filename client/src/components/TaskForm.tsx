import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, TaskStatus, TaskPriority, UpdateTaskRequest, Project } from '../../../shared/src/types'

interface TaskFormData {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  projectId?: string
  tags?: string[]
}
import { taskService } from '../services/task'
import { projectService } from '../services/project'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { FiX, FiSave, FiPlus } from 'react-icons/fi'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  task?: Task | null
  defaultProjectId?: string
}

export const TaskForm: React.FC<TaskFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  task, 
  defaultProjectId 
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    projectId: defaultProjectId || '',
    tags: []
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchProjects()
      if (task) {
        setFormData({
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          projectId: task.projectId || '',
          tags: task.tags || []
        })
      } else {
        setFormData({
          title: '',
          description: '',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          dueDate: '',
          projectId: defaultProjectId || '',
          tags: []
        })
      }
    }
  }, [isOpen, task, defaultProjectId])

  const fetchProjects = async () => {
    try {
      const fetchedProjects = await projectService.getAllProjects()
      setProjects(fetchedProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
      }
      
      if (task) {
        await taskService.updateTask(task.id, submitData as UpdateTaskRequest)
      } else {
        await taskService.createTask(submitData)
      }
      onSave()
      onClose()
    } catch (error: any) {
      console.error('Error saving task:', error)
      if (error.response) {
        // Server responded with error
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        alert(`Error: ${error.response.data.error || 'Failed to save task'}`);
      } else if (error.request) {
        // Request made but no response
        console.error('No response from server')
        alert('No response from server. Please check if the server is running.');
      } else {
        // Something else happened
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {task ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={TaskStatus.TODO}>To Do</option>
                      <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                      <option value={TaskStatus.COMPLETED}>Completed</option>
                      <option value={TaskStatus.CANCELLED}>Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={TaskPriority.LOW}>Low</option>
                      <option value={TaskPriority.MEDIUM}>Medium</option>
                      <option value={TaskPriority.HIGH}>High</option>
                      <option value={TaskPriority.URGENT}>Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Due Date and Project */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={formData.dueDate || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, dueDate: e.target.value || undefined }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project
                    </label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value || undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag"
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      <FiPlus size={16} />
                    </Button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={loading} icon={<FiSave />}>
                    {task ? 'Update Task' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
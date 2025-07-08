import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, TaskStatus, TaskPriority } from '../../../shared/src/types'
import { taskService } from '../services/task'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { FiX, FiSave } from 'react-icons/fi'

interface SubTaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  parentTask: Task
  subTask?: Task | null
}

export const SubTaskForm: React.FC<SubTaskFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  parentTask, 
  subTask 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    status: TaskStatus.TODO
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (subTask) {
      setFormData({
        title: subTask.title,
        description: subTask.description || '',
        priority: subTask.priority,
        dueDate: subTask.dueDate ? new Date(subTask.dueDate).toISOString().split('T')[0] : '',
        status: subTask.status
      })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: TaskPriority.MEDIUM,
        dueDate: '',
        status: TaskStatus.TODO
      })
    }
  }, [subTask, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        parentTaskId: parentTask.id,
        projectId: parentTask.projectId,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
      }
      
      if (subTask) {
        await taskService.updateTask(subTask.id, submitData)
      } else {
        await taskService.createTask(submitData)
      }
      
      onSave()
      onClose()
    } catch (error: any) {
      console.error('Error saving sub-task:', error)
      if (error.response) {
        alert(`Error: ${error.response.data.error || 'Failed to save sub-task'}`);
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false)
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
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {subTask ? 'Edit Sub-task' : 'Add Sub-task'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Parent Task:</span> {parentTask.title}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter sub-task title"
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
                    placeholder="Enter sub-task description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Priority and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                        setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={TaskPriority.LOW}>Low</option>
                      <option value={TaskPriority.MEDIUM}>Medium</option>
                      <option value={TaskPriority.HIGH}>High</option>
                      <option value={TaskPriority.URGENT}>Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                        setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={TaskStatus.TODO}>To Do</option>
                      <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                      <option value={TaskStatus.COMPLETED}>Completed</option>
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData(prev => ({ ...prev, dueDate: e.target.value }))
                    }
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || !formData.title.trim()}
                    icon={<FiSave />}
                    className="flex-1"
                  >
                    {loading ? 'Saving...' : (subTask ? 'Update Sub-task' : 'Add Sub-task')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
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
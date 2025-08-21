import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, TaskStatus } from '../../../shared/src/types'
import { taskService } from '../services/task'
import { Button } from './ui/Button'
import { FiPlus, FiCheck, FiClock, FiCircle, FiChevronDown, FiChevronRight } from 'react-icons/fi'

interface SubTaskListProps {
  parentTask: Task
  onSubTaskUpdate: () => void
}

export const SubTaskList: React.FC<SubTaskListProps> = ({ parentTask, onSubTaskUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAddingSubTask, setIsAddingSubTask] = useState(false)
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('')
  const [loading, setLoading] = useState(false)
  
  const subTasks = parentTask.subTasks || []
  const completedCount = subTasks.filter(task => task.status === TaskStatus.COMPLETED).length
  const totalCount = subTasks.length

  const handleAddSubTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubTaskTitle.trim()) return

    setLoading(true)
    try {
      await taskService.createTask({
        title: newSubTaskTitle.trim(),
        parentTaskId: parentTask.id,
        projectId: parentTask.projectId
      })
      
      setNewSubTaskTitle('')
      setIsAddingSubTask(false)
      onSubTaskUpdate()
    } catch (error) {
      console.error('Error creating sub-task:', error)
      alert('Failed to create sub-task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubTaskStatusChange = async (subTaskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.updateTask(subTaskId, { status: newStatus })
      onSubTaskUpdate()
    } catch (error) {
      console.error('Error updating sub-task status:', error)
      alert('Failed to update sub-task status. Please try again.')
    }
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <FiCheck className="w-4 h-4 text-green-600" />
      case TaskStatus.IN_PROGRESS:
        return <FiClock className="w-4 h-4 text-blue-600" />
      default:
        return <FiCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'text-green-600 bg-green-50 border-green-200'
      case TaskStatus.IN_PROGRESS:
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (totalCount === 0 && !isAddingSubTask) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingSubTask(true)}
          icon={<FiPlus />}
          className="text-gray-600 border-gray-200 hover:bg-gray-50"
        >
          Add Sub-task
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {/* Sub-tasks Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          {isExpanded ? (
            <FiChevronDown className="w-4 h-4" />
          ) : (
            <FiChevronRight className="w-4 h-4" />
          )}
          <span>
            Sub-tasks ({completedCount}/{totalCount})
          </span>
        </button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAddingSubTask(true)}
          icon={<FiPlus />}
          className="text-gray-500 hover:text-gray-700"
        >
        </Button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round((completedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}

      {/* Add Sub-task Form */}
      <AnimatePresence>
        {isAddingSubTask && (
          <motion.form
            onSubmit={handleAddSubTask}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSubTaskTitle}
                onChange={(e) => setNewSubTaskTitle(e.target.value)}
                placeholder="Add a sub-task..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <Button
                type="submit"
                size="sm"
                disabled={loading || !newSubTaskTitle.trim()}
                className="px-3"
              >
                {loading ? 'Adding...' : 'Add'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingSubTask(false)
                  setNewSubTaskTitle('')
                }}
                className="px-3"
              >
                Cancel
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Sub-tasks List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {subTasks.map((subTask, index) => (
              <motion.div
                key={subTask.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border transition-all duration-200 ${getStatusColor(subTask.status)}`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      const newStatus = subTask.status === TaskStatus.COMPLETED 
                        ? TaskStatus.TODO 
                        : TaskStatus.COMPLETED
                      handleSubTaskStatusChange(subTask.id, newStatus)
                    }}
                    className="flex-shrink-0 hover:scale-110 transition-transform"
                  >
                    {getStatusIcon(subTask.status)}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      subTask.status === TaskStatus.COMPLETED 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-900'
                    }`}>
                      {subTask.title}
                    </p>
                    {subTask.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {subTask.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {subTask.status !== TaskStatus.COMPLETED && subTask.status !== TaskStatus.IN_PROGRESS && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSubTaskStatusChange(subTask.id, TaskStatus.IN_PROGRESS)}
                        className="text-blue-600 hover:bg-blue-50 text-xs px-2 py-1"
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
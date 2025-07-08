import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Comment } from '../../../shared/src/types'
import { commentService } from '../services/comment'
import { Button } from './ui/Button'
import { FiMessageCircle, FiEdit2, FiTrash2, FiSend } from 'react-icons/fi'

interface CommentListProps {
  taskId: string
  onCommentUpdate?: () => void
}

export const CommentList: React.FC<CommentListProps> = ({ taskId, onCommentUpdate }) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const fetchComments = async () => {
    try {
      setLoading(true)
      const fetchedComments = await commentService.getTaskComments(taskId)
      setComments(fetchedComments)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [taskId])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await commentService.createComment({
        content: newComment.trim(),
        taskId
      })
      
      setNewComment('')
      setIsAddingComment(false)
      fetchComments()
      onCommentUpdate?.()
    } catch (error) {
      console.error('Error creating comment:', error)
      alert('Failed to add comment. Please try again.')
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      await commentService.updateComment(commentId, {
        id: commentId,
        content: editContent.trim()
      })
      
      setEditingComment(null)
      setEditContent('')
      fetchComments()
      onCommentUpdate?.()
    } catch (error) {
      console.error('Error updating comment:', error)
      alert('Failed to update comment. Please try again.')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      await commentService.deleteComment(commentId)
      fetchComments()
      onCommentUpdate?.()
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment. Please try again.')
    }
  }

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const cancelEditing = () => {
    setEditingComment(null)
    setEditContent('')
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FiMessageCircle className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({comments.length})
          </h3>
        </div>
        
        {!isAddingComment && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingComment(true)}
            icon={<FiMessageCircle />}
          >
            Add Comment
          </Button>
        )}
      </div>

      {/* Add Comment Form */}
      <AnimatePresence>
        {isAddingComment && (
          <motion.form
            onSubmit={handleAddComment}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingComment(false)
                  setNewComment('')
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim()}
                icon={<FiSend />}
              >
                Add Comment
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <FiMessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet</p>
            <p className="text-sm text-gray-400">Be the first to add a comment</p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.user?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startEditing(comment)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {editingComment === comment.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={cancelEditing}
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleEditComment(comment.id)}
                            disabled={!editContent.trim()}
                            className="text-xs"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
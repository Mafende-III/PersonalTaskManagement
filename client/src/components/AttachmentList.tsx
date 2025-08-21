import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Attachment } from '../../../shared/src/types'
import { attachmentService } from '../services/attachment'
import { Button } from './ui/Button'
import { 
  FiPaperclip, 
  FiUpload, 
  FiDownload, 
  FiTrash2, 
  FiFile, 
  FiImage, 
  FiFileText,
  FiX
} from 'react-icons/fi'

interface AttachmentListProps {
  taskId: string
  onAttachmentUpdate?: () => void
}

export const AttachmentList: React.FC<AttachmentListProps> = ({ taskId, onAttachmentUpdate }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchAttachments = async () => {
    try {
      setLoading(true)
      const fetchedAttachments = await attachmentService.getTaskAttachments(taskId)
      setAttachments(fetchedAttachments)
    } catch (error) {
      console.error('Error fetching attachments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttachments()
  }, [taskId])

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(file => handleFileUpload(file))
  }

  const handleFileUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size too large. Please select a file smaller than 10MB.')
      return
    }

    setUploading(true)
    try {
      // In a real app, you would upload to a file storage service (AWS S3, etc.)
      // For now, we'll simulate with a data URL
      const fileUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      await attachmentService.createAttachment({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        fileUrl,
        taskId
      })

      fetchAttachments()
      onAttachmentUpdate?.()
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return

    try {
      await attachmentService.deleteAttachment(attachmentId)
      fetchAttachments()
      onAttachmentUpdate?.()
    } catch (error) {
      console.error('Error deleting attachment:', error)
      alert('Failed to delete attachment. Please try again.')
    }
  }

  const handleDownload = (attachment: Attachment) => {
    // In a real app, this would download from the actual file URL
    const link = document.createElement('a')
    link.href = attachment.fileUrl
    link.download = attachment.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FiImage className="w-5 h-5 text-blue-500" />
    } else if (mimeType.includes('text') || mimeType.includes('document')) {
      return <FiFileText className="w-5 h-5 text-green-500" />
    } else {
      return <FiFile className="w-5 h-5 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
          <FiPaperclip className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Attachments ({attachments.length})
          </h3>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFileSelect(e.dataTransfer.files)
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 mb-2">
          Drop files here or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium"
            disabled={uploading}
          >
            browse
          </button>
        </p>
        <p className="text-sm text-gray-500">
          Maximum file size: 10MB
        </p>
        
        {uploading && (
          <div className="mt-3">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-600">Uploading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Attachments List */}
      <div className="space-y-3">
        {attachments.length === 0 ? (
          <div className="text-center py-8">
            <FiPaperclip className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No attachments yet</p>
            <p className="text-sm text-gray-400">Upload files to get started</p>
          </div>
        ) : (
          <AnimatePresence>
            {attachments.map((attachment, index) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(attachment.mimeType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {attachment.fileName}
                      </h4>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => handleDownload(attachment)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Download"
                        >
                          <FiDownload size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatFileSize(attachment.fileSize)}</span>
                        <span>•</span>
                        <span>Uploaded {getTimeAgo(attachment.createdAt)}</span>
                      </div>
                      
                      {attachment.user && (
                        <span className="text-xs text-gray-500">
                          by {attachment.user.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Image Preview */}
                {attachment.mimeType.startsWith('image/') && (
                  <div className="mt-3">
                    <img
                      src={attachment.fileUrl}
                      alt={attachment.fileName}
                      className="max-w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
import React from 'react'
import { motion } from 'framer-motion'

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'error'
  text?: string
  pulse?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  text, 
  pulse = false,
  size = 'md'
}) => {
  const statusConfig = {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      dot: 'bg-green-500'
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500'
    },
    completed: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      dot: 'bg-blue-500'
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      dot: 'bg-red-500'
    }
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }

  const config = statusConfig[status]

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bg} ${config.text} ${sizeClasses[size]}
      `}
    >
      <span className="relative mr-2">
        <span className={`block rounded-full ${config.dot} ${dotSizes[size]}`} />
        {pulse && (
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 rounded-full ${config.dot}`}
          />
        )}
      </span>
      {text || status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.span>
  )
}

export default StatusBadge
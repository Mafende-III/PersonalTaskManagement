import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  onClick?: () => void
  isActive?: boolean
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'glass' | 'interactive'
}

const Card: React.FC<CardProps> = ({
  children,
  onClick,
  isActive = false,
  className = '',
  padding = 'md',
  variant = 'default',
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  const variants = {
    default: 'bg-white border border-gray-200',
    glass: 'glass-card',
    interactive: 'bg-white border border-gray-200 hover:border-gray-300 cursor-pointer'
  }

  const baseClasses = cn(
    'rounded-xl transition-all duration-300',
    paddings[padding],
    variants[variant],
    isActive ? 'ring-2 ring-blue-500 border-blue-500' : '',
    className
  )

  if (onClick || variant === 'interactive') {
    return (
      <motion.div
        whileHover={{ 
          y: -4, 
          boxShadow: isActive 
            ? '0 20px 25px -5px rgba(59, 130, 246, 0.2)' 
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={baseClasses}
        style={{
          boxShadow: isActive 
            ? '0 10px 15px -3px rgba(59, 130, 246, 0.2)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div 
      className={baseClasses}
      style={{
        boxShadow: isActive 
          ? '0 10px 15px -3px rgba(59, 130, 246, 0.2)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card }
export default Card
# Comprehensive UI Development Guide for Responsive & Interactive Design

## Design System Overview

### Color Palette
```css
:root {
  /* Primary Colors */
  --primary-light-blue: #3B82F6;
  --primary-hover: #2563EB;
  --primary-active: #1D4ED8;
  
  /* Background Colors */
  --bg-white: #FFFFFF;
  --bg-light-grey: #F9FAFB;
  --bg-grey: #F3F4F6;
  --bg-dark-grey: #E5E7EB;
  
  /* Text Colors */
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-light: #9CA3AF;
  
  /* State Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

## Landing Page Structure

### Professional Landing Page with Auth
```tsx
// pages/Landing.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Manage Projects
              <span className="text-blue-500"> Effortlessly</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8">
              Streamline your workflow with our intuitive project management tool. 
              Track tasks, sync calendars, and generate reports - all in one place.
            </p>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <FeatureItem icon="📊" text="Real-time Analytics" />
              <FeatureItem icon="📅" text="Calendar Sync" />
              <FeatureItem icon="👥" text="Team Collaboration" />
              <FeatureItem icon="📱" text="Mobile Responsive" />
            </div>
          </motion.div>

          {/* Right: Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            <AuthCard isLogin={isLogin} setIsLogin={setIsLogin} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Feature Item Component
const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex items-center space-x-3 p-3 rounded-lg bg-white shadow-sm"
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-gray-700">{text}</span>
  </motion.div>
);
```

## Responsive Icon System

### Dynamic Icon Component
```tsx
// components/icons/ResponsiveIcon.tsx
import { IconType } from 'react-icons';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ResponsiveIconProps {
  icon: IconType;
  className?: string;
  sizes?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

const ResponsiveIcon: React.FC<ResponsiveIconProps> = ({ 
  icon: Icon, 
  className = '',
  sizes = { sm: 16, md: 20, lg: 24, xl: 28 }
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(max-width: 1024px)');

  const getSize = () => {
    if (isMobile) return sizes.sm;
    if (isTablet) return sizes.md;
    if (isDesktop) return sizes.lg;
    return sizes.xl;
  };

  return <Icon size={getSize()} className={className} />;
};

// Usage in components
<ResponsiveIcon 
  icon={FiHome} 
  className="text-blue-500 hover:text-blue-600 transition-colors"
  sizes={{ sm: 18, md: 22, lg: 26, xl: 30 }}
/>
```

### Icon Button with States
```tsx
// components/buttons/IconButton.tsx
import { motion } from 'framer-motion';
import { ResponsiveIcon } from '../icons/ResponsiveIcon';

interface IconButtonProps {
  icon: IconType;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  badge?: number;
  tooltip?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  isActive = false,
  badge,
  tooltip
}) => {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const variantClasses = {
    primary: `bg-blue-500 text-white hover:bg-blue-600 ${isActive ? 'ring-2 ring-blue-300' : ''}`,
    secondary: `bg-gray-200 text-gray-700 hover:bg-gray-300 ${isActive ? 'ring-2 ring-gray-400' : ''}`,
    ghost: `text-gray-600 hover:bg-gray-100 ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative rounded-lg transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
      `}
      title={tooltip}
    >
      <ResponsiveIcon icon={icon} />
      
      {badge && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
        >
          {badge > 99 ? '99+' : badge}
        </motion.span>
      )}
    </motion.button>
  );
};
```

## Interactive Components

### Animated Button Component
```tsx
// components/buttons/Button.tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  icon
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100',
    ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
        />
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};
```

### Interactive Card Component
```tsx
// components/cards/InteractiveCard.tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface InteractiveCardProps {
  children: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  onClick,
  isActive = false,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative bg-white rounded-xl p-6 cursor-pointer
        transition-all duration-300 ease-out
        ${isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:ring-2 hover:ring-gray-200'}
        ${className}
      `}
      style={{
        boxShadow: isActive 
          ? '0 10px 15px -3px rgba(59, 130, 246, 0.2)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      {children}
    </motion.div>
  );
};
```

## Layout Components

### Responsive Container
```tsx
// components/layout/Container.tsx
interface ContainerProps {
  children: ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`
      w-full mx-auto px-4 sm:px-6 lg:px-8
      max-w-7xl
      ${className}
    `}>
      {children}
    </div>
  );
};
```

### Main Layout with Header
```tsx
// components/layout/MainLayout.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';

const MainLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <IconButton
                icon={FiMenu}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
              />
              <h1 className="ml-4 text-xl font-semibold text-gray-900">
                ProjectHub
              </h1>
            </div>

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="pt-16 lg:pl-64">
        <Container className="py-8">
          {children}
        </Container>
      </main>
    </div>
  );
};
```

## Responsive Grid System

### Responsive Grid Component
```tsx
// components/layout/ResponsiveGrid.tsx
interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className = ''
}) => {
  const gridClasses = `
    grid
    grid-cols-${cols.sm || 1}
    sm:grid-cols-${cols.sm || 1}
    md:grid-cols-${cols.md || 2}
    lg:grid-cols-${cols.lg || 3}
    xl:grid-cols-${cols.xl || 4}
    gap-${gap}
  `;

  return (
    <div className={`${gridClasses} ${className}`}>
      {children}
    </div>
  );
};
```

## Form Components

### Interactive Input Component
```tsx
// components/forms/Input.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      {label && (
        <motion.label
          animate={{
            y: isFocused || props.value ? -20 : 0,
            scale: isFocused || props.value ? 0.85 : 1,
            color: isFocused ? '#3B82F6' : '#6B7280'
          }}
          className="absolute left-3 top-3 text-gray-500 pointer-events-none origin-left"
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-3 py-3 rounded-lg border
            ${icon ? 'pl-10' : ''}
            ${label ? 'pt-6' : ''}
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${isFocused ? 'border-blue-500 ring-2 ring-blue-200' : ''}
            focus:outline-none transition-all duration-200
            ${className}
          `}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
```

## Status Indicators

### Dynamic Status Badge
```tsx
// components/badges/StatusBadge.tsx
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'error';
  text?: string;
  pulse?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  text, 
  pulse = false 
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
  };

  const config = statusConfig[status];

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        ${config.bg} ${config.text}
      `}
    >
      <span className="relative mr-2">
        <span className={`block w-2 h-2 rounded-full ${config.dot}`} />
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
  );
};
```

## Media Query Hook

```tsx
// hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};
```

## Responsive Typography

```css
/* styles/typography.css */
.responsive-text {
  @apply text-base sm:text-lg md:text-xl lg:text-2xl;
}

.responsive-heading {
  @apply text-2xl sm:text-3xl md:text-4xl lg:text-5xl;
}

.responsive-subheading {
  @apply text-xl sm:text-2xl md:text-3xl lg:text-4xl;
}

.responsive-body {
  @apply text-sm sm:text-base md:text-lg;
}

.responsive-caption {
  @apply text-xs sm:text-sm md:text-base;
}
```

## Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

## Best Practices Summary

### 1. Responsive Design Rules
- Always use Tailwind's responsive prefixes (sm:, md:, lg:, xl:)
- Test on multiple screen sizes (320px, 768px, 1024px, 1440px)
- Use relative units (rem, em, %) instead of fixed pixels
- Implement mobile-first design approach

### 2. Interactive Elements
- Add hover, focus, and active states to all clickable elements
- Use motion/framer-motion for smooth animations
- Provide visual feedback for user actions
- Implement loading states for async operations

### 3. Accessibility
- Ensure color contrast ratio of at least 4.5:1
- Add focus indicators for keyboard navigation
- Include ARIA labels for icon-only buttons
- Test with screen readers

### 4. Performance
- Lazy load heavy components
- Use React.memo for components that re-render frequently
- Optimize images and use WebP format
- Implement code splitting for route-based chunks

### 5. Component Structure
```
src/
├── components/
│   ├── common/        # Shared components
│   ├── layout/        # Layout components
│   ├── forms/         # Form elements
│   ├── buttons/       # Button variants
│   ├── cards/         # Card components
│   └── feedback/      # Alerts, toasts, modals
├── hooks/             # Custom hooks
├── utils/             # Helper functions
└── styles/            # Global styles
```

This guide provides everything needed for Claude CLI to create a professional, responsive, and interactive UI with proper theming and component structure.
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiCheck, FiCalendar, FiUsers, FiSmartphone, FiBarChart } from 'react-icons/fi'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { authService } from '../services/auth'

const Landing: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Check for success message from registration
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      setIsLogin(true) // Switch to login mode
      // Clear the location state
      navigate(location.pathname, { replace: true })
    }
  }, [location, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 gradient-mesh opacity-40"></div>
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left: Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-6">
                <FiCheck className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <h1 className="responsive-heading font-bold text-gray-900 mb-6 font-display">
              Manage Projects
              <span className="text-primary-500"> Effortlessly</span>
            </h1>
            
            <p className="responsive-body text-gray-600 mb-8 max-w-xl lg:max-w-none">
              Streamline your workflow with our intuitive project management tool. 
              Track tasks, sync calendars, and generate reports - all in one place.
            </p>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <FeatureItem icon={<FiBarChart />} text="Real-time Analytics" />
              <FeatureItem icon={<FiCalendar />} text="Calendar Sync" />
              <FeatureItem icon={<FiUsers />} text="Team Collaboration" />
              <FeatureItem icon={<FiSmartphone />} text="Mobile Responsive" />
            </div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500"
            >
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full border-2 border-white"></div>
                  ))}
                </div>
                <span className="ml-3">Trusted by teams worldwide</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md mx-auto lg:max-w-lg"
          >
            <AuthCard 
              isLogin={isLogin} 
              setIsLogin={setIsLogin}
              successMessage={successMessage}
              setSuccessMessage={setSuccessMessage}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Feature Item Component
const FeatureItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex items-center space-x-3 p-4 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200/50 hover-lift"
  >
    <div className="flex-shrink-0 w-8 h-8 text-primary-500">
      {icon}
    </div>
    <span className="text-gray-700 font-medium">{text}</span>
  </motion.div>
)

// Auth Card Component
interface AuthCardProps {
  isLogin: boolean
  setIsLogin: (value: boolean) => void
  successMessage?: string
  setSuccessMessage?: (value: string) => void
}

const AuthCard: React.FC<AuthCardProps> = ({ 
  isLogin, 
  setIsLogin, 
  successMessage = '',
  setSuccessMessage 
}) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!isLogin && !formData.name) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setApiError('')
    
    try {
      if (isLogin) {
        await authService.login({ email: formData.email, password: formData.password })
        navigate('/dashboard')
      } else {
        await authService.register({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password 
        })
        setSuccessMessage?.('Account created successfully! Please sign in with your credentials.')
        setIsLogin(true)
        setFormData(prev => ({ ...prev, name: '', password: '', confirmPassword: '' }))
      }
    } catch (error: any) {
      setApiError(error.response?.data?.message || `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card variant="glass" padding="lg" className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to continue' : 'Start your productivity journey'}
          </p>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
            >
              <div className="flex items-center gap-2">
                <FiCheck className="w-4 h-4" />
                {successMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {apiError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Input
                  type="text"
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  icon={<FiUsers className="w-4 h-4" />}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Input
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            type="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />

          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Input
                  type="password"
                  name="confirmPassword"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="mt-6"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {/* Switch Mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setSuccessMessage?.('')
                setApiError('')
                setErrors({})
              }}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              {isLogin ? 'Create one now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </motion.div>
    </Card>
  )
}

export default Landing
import axios from 'axios'
import { API_URL } from '../config/api'

const AUTH_API_URL: string = `${API_URL}/auth`

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Token management
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

// Clean up any invalid tokens on load
const cleanupInvalidTokens = () => {
  const accessToken = localStorage.getItem(TOKEN_KEY)
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  
  if (accessToken === 'undefined' || accessToken === 'null' || !accessToken) {
    localStorage.removeItem(TOKEN_KEY)
  }
  
  if (refreshToken === 'undefined' || refreshToken === 'null' || !refreshToken) {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

// Run cleanup on module load
cleanupInvalidTokens()

export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  return (token && token !== 'undefined' && token !== 'null') ? token : null
}

export const getRefreshToken = () => {
  const token = localStorage.getItem(REFRESH_TOKEN_KEY)
  return (token && token !== 'undefined' && token !== 'null') ? token : null
}
export const setTokens = (accessToken: string, refreshToken: string) => {
  if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
    localStorage.setItem(TOKEN_KEY, accessToken)
  }
  if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// Queue for handling multiple requests during token refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (reason: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// Add auth header to requests
axios.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Skip refresh for refresh endpoint itself to prevent infinite loops
    if (error.config?.url?.includes('/refresh')) {
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axios(originalRequest)
          }
          return Promise.reject(new Error('Token refresh failed'))
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true
      
      try {
        const refreshToken = getRefreshToken()
        
        // Check if refresh token exists and is valid
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }
        
        // Create a new axios instance for refresh to avoid interceptor conflicts
        const refreshResponse = await axios.create().post(`${AUTH_API_URL}/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data || refreshResponse.data
        
        if (!accessToken || !newRefreshToken) {
          throw new Error('Invalid token response from server')
        }
        
        setTokens(accessToken, newRefreshToken)
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axios(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        processQueue(refreshError, null)
        clearTokens()
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
)

interface RegisterData {
  name: string
  email: string
  password: string
}

interface LoginData {
  email: string
  password: string
}

interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
  }
  accessToken: string
  refreshToken: string
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${AUTH_API_URL}/register`, data)
    // Handle nested data structure from API response
    const responseData = response.data.data || response.data
    const { accessToken, refreshToken } = responseData
    
    if (!accessToken || !refreshToken) {
      throw new Error('Invalid token response from server')
    }
    
    setTokens(accessToken, refreshToken)
    return responseData
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await axios.post(`${AUTH_API_URL}/login`, data)
    // Handle nested data structure from API response
    const responseData = response.data.data || response.data
    const { accessToken, refreshToken } = responseData
    
    if (!accessToken || !refreshToken) {
      throw new Error('Invalid token response from server')
    }
    
    setTokens(accessToken, refreshToken)
    return responseData
  },

  async logout(): Promise<void> {
    clearTokens()
  },

  async getProfile() {
    const response = await axios.get(`${AUTH_API_URL}/profile`)
    return response.data
  },

  async getCurrentUser() {
    try {
      const response = await axios.get(`${AUTH_API_URL}/profile`)
      return response.data?.data || response.data
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  },

  isAuthenticated(): boolean {
    const token = getToken()
    return token !== null && token !== undefined && token.length > 0
  }
}
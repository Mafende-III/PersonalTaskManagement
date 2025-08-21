// API Configuration
const getApiUrl = () => {
  // In production, use relative URLs (same origin)
  if (import.meta.env.PROD) {
    return ''
  }
  
  // In development, use environment variable or default
  return import.meta.env.VITE_API_URL || 'http://localhost:5002'
}

export const API_BASE_URL = getApiUrl()
export const API_URL = `${API_BASE_URL}/api`
// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  PROJECTS: '/api/projects',
  TASKS: '/api/tasks',
  USERS: '/api/users'
} as const

// Application constants
export const APP_CONFIG = {
  NAME: 'Personal Task Management',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
} as const 
import axios from 'axios'
import { Task, CreateTaskRequest, UpdateTaskRequest, ApiResponse } from '../../../shared/src/types'
import { API_URL } from '../config/api'

const TASK_API_URL = `${TASK_API_URL}/tasks`

export const taskService = {
  async getAllTasks(params?: {
    projectId?: string
    status?: string
    priority?: string
    search?: string
    includeSubTasks?: boolean
  }): Promise<Task[]> {
    const response = await axios.get<ApiResponse<Task[]>>(TASK_API_URL, { params })
    return response.data.data || []
  },

  async getTaskById(id: string): Promise<Task> {
    const response = await axios.get<ApiResponse<Task>>(`${TASK_API_URL}/${id}`)
    return response.data.data!
  },

  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await axios.post<ApiResponse<Task>>(TASK_API_URL, data)
    return response.data.data!
  },

  async updateTask(id: string, data: Partial<UpdateTaskRequest>): Promise<Task> {
    const response = await axios.put<ApiResponse<Task>>(`${TASK_API_URL}/${id}`, data)
    return response.data.data!
  },

  async deleteTask(id: string): Promise<void> {
    await axios.delete(`${TASK_API_URL}/${id}`)
  },

  async updateTaskPositions(tasks: Array<{ id: string; position: number }>): Promise<void> {
    await axios.patch(`${TASK_API_URL}/positions`, { tasks })
  }
}
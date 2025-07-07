import axios from 'axios'
import { Task, CreateTaskRequest, UpdateTaskRequest, ApiResponse } from '../../../shared/src/types'

const API_URL = 'http://localhost:5001/api/tasks'

export const taskService = {
  async getAllTasks(params?: {
    projectId?: string
    status?: string
    priority?: string
    search?: string
    includeSubTasks?: boolean
  }): Promise<Task[]> {
    const response = await axios.get<ApiResponse<Task[]>>(API_URL, { params })
    return response.data.data || []
  },

  async getTaskById(id: string): Promise<Task> {
    const response = await axios.get<ApiResponse<Task>>(`${API_URL}/${id}`)
    return response.data.data!
  },

  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await axios.post<ApiResponse<Task>>(API_URL, data)
    return response.data.data!
  },

  async updateTask(id: string, data: Partial<UpdateTaskRequest>): Promise<Task> {
    const response = await axios.put<ApiResponse<Task>>(`${API_URL}/${id}`, data)
    return response.data.data!
  },

  async deleteTask(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`)
  },

  async updateTaskPositions(tasks: Array<{ id: string; position: number }>): Promise<void> {
    await axios.patch(`${API_URL}/positions`, { tasks })
  }
}
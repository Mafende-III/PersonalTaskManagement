import axios from 'axios'
import { Project, CreateProjectRequest, UpdateProjectRequest, ApiResponse } from '../../../shared/src/types'
import { API_URL } from '../config/api'

const PROJECT_API_URL: string = `${API_URL}/projects`

export const projectService = {
  async getAllProjects(params?: {
    status?: string
    includeTasks?: boolean
  }): Promise<Project[]> {
    const response = await axios.get<ApiResponse<Project[]>>(PROJECT_API_URL, { 
      params: {
        ...params,
        includeTasks: params?.includeTasks ? 'true' : 'false'
      }
    })
    return response.data.data || []
  },

  async getProjectById(id: string, includeTasks?: boolean): Promise<Project> {
    const response = await axios.get<ApiResponse<Project>>(`${PROJECT_API_URL}/${id}`, {
      params: { includeTasks: includeTasks ? 'true' : 'false' }
    })
    return response.data.data!
  },

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await axios.post<ApiResponse<Project>>(PROJECT_API_URL, data)
    return response.data.data!
  },

  async updateProject(id: string, data: Partial<UpdateProjectRequest>): Promise<Project> {
    const response = await axios.put<ApiResponse<Project>>(`${PROJECT_API_URL}/${id}`, data)
    return response.data.data!
  },

  async deleteProject(id: string): Promise<void> {
    await axios.delete(`${PROJECT_API_URL}/${id}`)
  },

  async getProjectStats(id: string): Promise<{
    projectId: string
    totalTasks: number
    completedTasks: number
    progressPercentage: number
    statusBreakdown: Record<string, number>
  }> {
    const response = await axios.get<ApiResponse<any>>(`${PROJECT_API_URL}/${id}/stats`)
    return response.data.data!
  }
}
import axios from 'axios'
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../../../shared/src/types'

const API_URL = 'http://localhost:5001/api/comments'

export const commentService = {
  async getTaskComments(taskId: string): Promise<Comment[]> {
    const response = await axios.get(`${API_URL}/task/${taskId}`)
    return response.data.data
  },

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const response = await axios.post(API_URL, data)
    return response.data.data
  },

  async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    const response = await axios.put(`${API_URL}/${commentId}`, data)
    return response.data.data
  },

  async deleteComment(commentId: string): Promise<void> {
    await axios.delete(`${API_URL}/${commentId}`)
  }
}
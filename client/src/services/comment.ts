import axios from 'axios'
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../../../shared/src/types'
import { API_URL } from '../config/api'

const COMMENT_API_URL: string = `${API_URL}/comments`

export const commentService = {
  async getTaskComments(taskId: string): Promise<Comment[]> {
    const response = await axios.get(`${COMMENT_API_URL}/task/${taskId}`)
    return response.data.data
  },

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const response = await axios.post(COMMENT_API_URL, data)
    return response.data.data
  },

  async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    const response = await axios.put(`${COMMENT_API_URL}/${commentId}`, data)
    return response.data.data
  },

  async deleteComment(commentId: string): Promise<void> {
    await axios.delete(`${COMMENT_API_URL}/${commentId}`)
  }
}
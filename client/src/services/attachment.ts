import axios from 'axios'
import { Attachment, CreateAttachmentRequest } from '../../../shared/src/types'

const API_URL = 'http://localhost:5001/api/attachments'

export const attachmentService = {
  async getTaskAttachments(taskId: string): Promise<Attachment[]> {
    const response = await axios.get(`${API_URL}/task/${taskId}`)
    return response.data.data
  },

  async getAttachment(attachmentId: string): Promise<Attachment> {
    const response = await axios.get(`${API_URL}/${attachmentId}`)
    return response.data.data
  },

  async createAttachment(data: CreateAttachmentRequest): Promise<Attachment> {
    const response = await axios.post(API_URL, data)
    return response.data.data
  },

  async deleteAttachment(attachmentId: string): Promise<void> {
    await axios.delete(`${API_URL}/${attachmentId}`)
  }
}
import axios from 'axios'
import { Attachment, CreateAttachmentRequest } from '../../../shared/src/types'
import { API_URL } from '../config/api'

const ATTACHMENT_API_URL: string = `${API_URL}/attachments`

export const attachmentService = {
  async getTaskAttachments(taskId: string): Promise<Attachment[]> {
    const response = await axios.get(`${ATTACHMENT_API_URL}/task/${taskId}`)
    return response.data.data
  },

  async getAttachment(attachmentId: string): Promise<Attachment> {
    const response = await axios.get(`${ATTACHMENT_API_URL}/${attachmentId}`)
    return response.data.data
  },

  async createAttachment(data: CreateAttachmentRequest): Promise<Attachment> {
    const response = await axios.post(ATTACHMENT_API_URL, data)
    return response.data.data
  },

  async deleteAttachment(attachmentId: string): Promise<void> {
    await axios.delete(`${ATTACHMENT_API_URL}/${attachmentId}`)
  }
}
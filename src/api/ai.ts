import axios from 'axios'

// 使用相对路径，这样会自动使用当前域名
const API_BASE_URL = '/api'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  response: string
  products?: {
    id: number
    name: string
    price: number
    image: string
  }[]
}

export const sendMessage = async (message: string, history: ChatMessage[]): Promise<ChatResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      message,
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    })

    return {
      response: response.data.response,
      products: response.data.products || []
    }
  } catch (error) {
    console.error('AI API调用错误:', error)
    throw error
  }
}

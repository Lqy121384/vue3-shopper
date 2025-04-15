export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: number
  userId: number
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface AIAssistantResponse {
  message: string
  recommendations?: {
    id: number
    name: string
    price: number
    image: string
    description: string
  }[]
}

export interface AIAssistantRequest {
  message: string
  userId?: number
  sessionId?: number
  context?: {
    recentViews?: number[]
    recentSearches?: string[]
    location?: string
    preferences?: Record<string, any>
  }
}
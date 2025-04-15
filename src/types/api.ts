// API响应状态码
export enum ApiCode {
  SUCCESS = 0,
  SUCCESS_200 = 200,
  ERROR = 1,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500
}

// API响应消息
export interface ApiMessage {
  code: ApiCode
  message: string
  data?: any
}

// API分页响应
export interface ApiPage<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// API响应包装器
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 成功响应包装器
export interface SuccessResponse<T = any> {
  success: boolean
  message?: string
  data: T
}

// API错误响应
export interface ApiError {
  code: number
  message: string
}

// API请求配置
export interface ApiRequestConfig {
  url: string
  method: 'get' | 'post' | 'put' | 'delete'
  data?: any
  params?: any
  headers?: Record<string, string>
  responseType?: 'json' | 'blob' | 'text'
  timeout?: number
}

// API请求拦截器
export interface ApiRequestInterceptor {
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>
  onRequestError?: (error: any) => any
}

// API响应拦截器
export interface ApiResponseInterceptor {
  onResponse?: (response: ApiResponse) => any
  onResponseError?: (error: ApiError) => any
}

// API实例配置
export interface ApiInstanceConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  requestInterceptors?: ApiRequestInterceptor[]
  responseInterceptors?: ApiResponseInterceptor[]
}

export interface LoginResponse {
  code: number
  message: string
  data: {
    token: string
    userInfo: {
      id: string
      username: string
      nickname: string
      avatar: string
      email: string
      phone: string
      gender: 'male' | 'female' | 'other'
      birthday: string
      address: string
      points: number
      level: number
      role: 'user' | 'admin'
      createdAt: string
      updatedAt: string
    }
  }
}

export interface RegisterResponse {
  code: number
  message: string
  data: {
    token: string
    userInfo: {
      id: string
      username: string
      nickname: string
      avatar: string
      email: string
      phone: string
      gender: 'male' | 'female' | 'other'
      birthday: string
      address: string
      points: number
      level: number
      role: 'user' | 'admin'
      createdAt: string
      updatedAt: string
    }
  }
}

export interface ErrorResponse {
  success: boolean
  message: string
  data?: any
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ListResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderStatsResponse {
  code: number
  message: string
  data: {
    total: number
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
    refunded: number
  }
}

export interface UserInfoResponse {
  code: number
  message: string
  data: {
    userInfo: {
      id: string
      username: string
      nickname: string
      avatar: string
      email: string
      phone: string
      gender: 'male' | 'female' | 'other'
      birthday: string
      address: string
      points: number
      level: number
      role: 'user' | 'admin'
      createdAt: string
      updatedAt: string
    }
  }
}

export interface UpdateProfileRequest {
  username?: string
  email?: string
  phone?: string
  nickname?: string
  avatar?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  address?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
} 
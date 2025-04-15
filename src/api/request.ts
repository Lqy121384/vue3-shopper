import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // 使用环境变量中的API地址
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    console.log('Request interceptor - token from localStorage:', token)
    
    if (token) {
      // 添加Bearer前缀，确保token格式正确
      const authHeader = `Bearer ${token}`
      console.log('Request interceptor - setting Authorization header:', authHeader)
      config.headers.Authorization = authHeader
    } else {
      console.log('Request interceptor - no token found in localStorage')
    }
    
    console.log('Request interceptor - final headers:', config.headers)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    console.log('Response interceptor - raw response:', response)
    console.log('Response interceptor - data:', data)
    
    // 如果响应成功
    if (data.code === 0) {
      console.log('Response interceptor - returning data:', data)
      return data
    }
    
    // 处理错误
    ElMessage.error(data.message || '请求失败')
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    console.error('Response error:', error)
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default service 
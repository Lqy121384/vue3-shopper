import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/api'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    })
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    console.log('Response data:', res)

    // 如果code不为0，说明请求出错
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    // 直接返回后端数据
    return res
  },
  (error) => {
    console.error('Response error:', error.response || error)
    // 处理401未授权的情况
    if (error.response?.status === 401) {
      // 清除token
      localStorage.removeItem('token')
      // 跳转到登录页
      window.location.href = '/auth/login'
      return
    }

    // 显示错误信息
    ElMessage.error(error.response?.data?.message || error.message || '请求失败')
    return Promise.reject(error)
  }
)

// 扩展 axios 实例的类型
declare module 'axios' {
  interface AxiosInstance {
    get<T = any, R = ApiResponse<T>>(url: string, config?: Omit<InternalAxiosRequestConfig, 'url' | 'method' | 'headers'>): Promise<R>
    post<T = any, R = ApiResponse<T>>(url: string, data?: any, config?: Omit<InternalAxiosRequestConfig, 'url' | 'method' | 'data' | 'headers'>): Promise<R>
    put<T = any, R = ApiResponse<T>>(url: string, data?: any, config?: Omit<InternalAxiosRequestConfig, 'url' | 'method' | 'data' | 'headers'>): Promise<R>
    delete<T = any, R = ApiResponse<T>>(url: string, config?: Omit<InternalAxiosRequestConfig, 'url' | 'method' | 'headers'>): Promise<R>
  }
}

export default request 
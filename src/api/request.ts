import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://8.137.121.139:3002',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // 如果响应成功
    if (res.code === 0) {
      return res
    }
    
    // 处理错误
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    console.error('Response error:', error)
    
    // 处理 401 错误
    if (error.response?.status === 401) {
      // 清除 token
      localStorage.removeItem('token')
      // 跳转到登录页
      window.location.href = '/auth/login'
      return Promise.reject(error)
    }
    
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

// 导出请求函数
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return instance(config)
}

export default request 
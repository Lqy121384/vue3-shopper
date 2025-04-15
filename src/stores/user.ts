import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserRole } from '@/types/user'
import type { UserInfo, UserStatus, SendVerificationCodeRequest, UpdateProfileRequest } from '@/types/user'
import { login, register, logout, getUserInfo, updateUserInfo } from '@/api/auth'
import { getOrderStats } from '@/api/order'
import { ElMessage } from 'element-plus'
import type { ApiResponse, LoginResponse, RegisterResponse, UserInfoResponse, OrderStatsResponse } from '@/types/api'
import { ApiCode } from '@/types/api'

export interface OrderStats {
  total: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  refunded: number
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const orderStats = ref<OrderStats | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === UserRole.ADMIN)

  // 重置状态
  const resetState = () => {
    token.value = null
    userInfo.value = null
    loading.value = false
    error.value = null
  }

  // 设置错误信息
  const setError = (message: string) => {
    error.value = message
    ElMessage.error(message)
  }

  // 清除错误信息
  const clearError = () => {
    error.value = null
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!token.value) {
      console.log('No token available, skipping user info fetch')
      return
    }
    
    try {
      loading.value = true
      clearError()
      console.log('Fetching user info with token:', token.value)
      console.log('Token from localStorage:', localStorage.getItem('token'))
      const response = await getUserInfo()
      console.log('User info response:', response)
      
      if (response.code === 0 && response.data) {
        userInfo.value = response.data.userInfo
        console.log('User info updated:', userInfo.value)
        // 确保用户信息获取成功后再获取订单统计
        await fetchOrderStats()
      } else {
        console.error('Invalid user info response:', response)
        throw new Error(response.message || '获取用户信息失败')
      }
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      // 如果是认证错误，不抛出异常，而是静默失败
      if (error.response?.status === 401) {
        console.log('Authentication error, silently failing')
        return
      }
      setError(error.message || '获取用户信息失败')
    } finally {
      loading.value = false
    }
  }

  // 登录
  const handleLogin = async (username: string, password: string) => {
    try {
      loading.value = true
      clearError()
      console.log('Login attempt - username:', username)
      const response = await login({ username, password })
      console.log('Login response:', response)
      
      if (response.code === 0 && response.data) {
        // 设置 token
        const tokenValue = response.data.token
        console.log('Login success - token from response:', tokenValue)
        token.value = tokenValue
        localStorage.setItem('token', tokenValue)
        
        // 设置用户信息
        if (response.data.userInfo) {
          userInfo.value = response.data.userInfo
          console.log('User info set:', userInfo.value)
        }
        
        // 立即获取用户信息
        await fetchUserInfo()
        
        ElMessage.success('登录成功')
        return true
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      setError(error.message || '登录失败，请检查用户名和密码')
      return false
    } finally {
      loading.value = false
    }
  }

  // 注册
  const handleRegister = async (data: { username: string; password: string; email?: string; phone?: string; code?: string }) => {
    try {
      loading.value = true
      clearError()
      console.log('Registering with data:', data)
      const response = await register(data)
      console.log('Register response:', response)
      
      if (response.code === 0 && response.data) {
        // 设置 token
        const tokenValue = response.data.token
        token.value = tokenValue
        localStorage.setItem('token', tokenValue)
        userInfo.value = response.data.userInfo
        await fetchUserInfo()
        ElMessage.success('注册成功')
        return true
      } else {
        throw new Error('注册失败：未收到有效的令牌')
      }
    } catch (error: any) {
      console.error('注册失败:', error)
      if (error.response?.status === 400) {
        const message = error.response.data?.message || '注册失败，请检查输入信息'
        ElMessage.error(message)
      } else {
        ElMessage.error('注册失败，请稍后重试')
      }
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  const handleLogout = async () => {
    try {
      if (token.value) {
        await logout()
      }
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      resetState()
      localStorage.removeItem('token')
      ElMessage.success('已登出')
    }
  }

  // 获取订单统计
  const fetchOrderStats = async () => {
    if (!token.value) {
      console.log('No token available, skipping order stats fetch')
      return
    }
    
    try {
      console.log('Fetching order stats with token:', token.value)
      const response = await getOrderStats()
      console.log('Order stats response:', response)
      
      if (response.code === 0 && response.data) {
        orderStats.value = {
          total: response.data.total,
          pending: response.data.pending,
          processing: response.data.processing,
          shipped: response.data.shipped,
          delivered: response.data.delivered,
          cancelled: response.data.cancelled,
          refunded: response.data.refunded
        }
      } else {
        console.error('Invalid order stats response:', response)
        throw new Error(response.message || '获取订单统计失败')
      }
    } catch (error: any) {
      console.error('获取订单统计失败:', error)
      // 如果是认证错误，不抛出异常，而是静默失败
      if (error.response?.status === 401) {
        console.log('Authentication error, silently failing')
        return
      }
      ElMessage.error(error.message || '获取订单统计失败')
    }
  }

  // 更新用户信息
  const updateUserProfile = async (data: UpdateProfileRequest) => {
    try {
      loading.value = true
      clearError()
      const response = await updateUserInfo(data)
      
      if (response.code === 0 || response.code === 200) {
        // 更新本地用户信息
        if (response.data && response.data.userInfo) {
          userInfo.value = response.data.userInfo
        }
        ElMessage.success('更新成功')
        return true
      } else {
        throw new Error(response.message || '更新失败')
      }
    } catch (error: any) {
      console.error('更新用户信息失败:', error)
      setError(error.message || '更新失败，请稍后重试')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    token,
    userInfo,
    error,
    loading,
    orderStats,
    isLoggedIn,
    isAdmin,
    resetState,
    setError,
    clearError,
    fetchUserInfo,
    handleLogin,
    handleRegister,
    handleLogout,
    fetchOrderStats,
    updateUserProfile
  }
}) 
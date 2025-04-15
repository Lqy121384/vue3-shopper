import request from '@/utils/request'
import type { ApiResponse, LoginResponse, RegisterResponse, UserInfoResponse, UpdateProfileRequest, ChangePasswordRequest } from '@/types/api'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
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

export interface RegisterParams {
  username: string
  password: string
  email?: string
  phone?: string
  code?: string
}

export interface ForgotPasswordParams {
  phone: string
  code: string
  newPassword: string
}

export const login = (data: LoginParams) => {
  return request.post<any, ApiResponse<LoginResponse>>('/api/auth/login', data)
}

export const register = (data: RegisterParams) => {
  return request.post<any, ApiResponse<RegisterResponse>>('/api/auth/register', data)
}

export const sendSmsCode = (phone: string) => {
  return request.post<any, ApiResponse<null>>('/api/auth/sms-code', { phone })
}

export const forgotPassword = (data: ForgotPasswordParams) => {
  return request.post<any, ApiResponse<null>>('/api/auth/forgot-password', data)
}

export const logout = () => {
  return request.post<any, ApiResponse<null>>('/api/auth/logout')
}

export const getUserInfo = () => {
  return request.get<any, ApiResponse<UserInfoResponse>>('/api/auth/user')
}

export const updateUserInfo = (data: UpdateProfileRequest) => {
  return request.put<any, ApiResponse<UserInfoResponse>>('/api/auth/user-info', data)
}

export const updatePassword = (data: ChangePasswordRequest) => {
  return request.put<any, ApiResponse<null>>('/api/auth/password', data)
} 
import request from './request'
import type { LoginRequest, RegisterRequest, UpdateProfileRequest } from '@/types/user'
import type { ApiResponse, LoginResponse, RegisterResponse, UserInfoResponse } from '@/types/api'

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

export const login = (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

export const register = (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data
  })
}

export const sendSmsCode = (phone: string) => {
  return request.post<any, ApiResponse<null>>('/api/auth/sms-code', { phone })
}

export const forgotPassword = (data: ForgotPasswordParams) => {
  return request.post<any, ApiResponse<null>>('/api/auth/forgot-password', data)
}

export const logout = (): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}

export const getUserInfo = (): Promise<ApiResponse<UserInfoResponse>> => {
  return request({
    url: '/api/auth/user',
    method: 'get'
  })
}

export const updateUserInfo = (data: UpdateProfileRequest): Promise<ApiResponse<UserInfoResponse>> => {
  return request({
    url: '/api/user/info',
    method: 'put',
    data
  })
}

export const updatePassword = (data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/user/password',
    method: 'put',
    data
  })
} 
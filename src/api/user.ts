import request from '@/utils/request'
import type {
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  SendVerificationCodeRequest,
  ResetPasswordRequest,
  LoginResponse,
  User,
  OrderStats,
  RegisterResponse
} from '@/types/user'
import type { ApiResponse } from '@/types/api'

// 登录
export const login = (data: LoginRequest) => {
  return request.post<LoginResponse>('/auth/login', data).then(response => {
    if (response.code === 0 && response.data) {
      // 保存 token 到 localStorage
      localStorage.setItem('token', response.data.token)
      return response
    }
    throw new Error(response.message || '登录失败')
  })
}

// 注册
export const register = (data: RegisterRequest) => {
  return request.post<RegisterResponse>('/auth/register', data).then(response => {
    if (response.code === 0 && response.data) {
      return response;
    }
    throw new Error(response.message || '注册失败');
  });
}

// 登出
export const logout = () => {
  return request.post('/auth/logout')
}

// 获取用户信息
export const getUserInfo = () => {
  return request.get<User>('/users/info')
}

// 更新用户信息
export const updateProfile = (data: Partial<User>) => {
  return request.put<User>('/users/profile', data)
}

// 修改密码
export const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  return request.put('/users/password', data)
}

// 发送验证码
export const sendVerificationCode = (data: SendVerificationCodeRequest) => {
  return request.post('/auth/send-code', data)
}

// 重置密码
export const resetPassword = (data: { phone: string; code: string; password: string }) => {
  return request.post('/auth/reset-password', data)
}

// 获取地址列表
export function getAddressList() {
  return request({
    url: '/user/address',
    method: 'get'
  })
}

// 添加地址
export function addAddress(data: {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault?: boolean
}) {
  return request({
    url: '/user/address',
    method: 'post',
    data
  })
}

// 更新地址
export function updateAddress(id: number, data: {
  name?: string
  phone?: string
  province?: string
  city?: string
  district?: string
  detail?: string
  isDefault?: boolean
}) {
  return request({
    url: `/user/address/${id}`,
    method: 'put',
    data
  })
}

// 删除地址
export function deleteAddress(id: number) {
  return request({
    url: `/user/address/${id}`,
    method: 'delete'
  })
}

// 设置默认地址
export function setDefaultAddress(id: number) {
  return request({
    url: `/user/address/${id}/default`,
    method: 'put'
  })
}

// 获取优惠券列表
export function getCouponList(params: {
  status: 'available' | 'used' | 'expired'
  page: number
  pageSize: number
}) {
  return request({
    url: '/user/coupon',
    method: 'get',
    params
  })
}

// 获取积分历史
export function getPointsHistory(params: {
  page: number
  pageSize: number
}) {
  return request({
    url: '/user/points/history',
    method: 'get',
    params
  })
}

// 获取收藏列表
export function getFavoriteList(params: {
  page: number
  pageSize: number
}) {
  return request({
    url: '/user/favorite',
    method: 'get',
    params
  })
}

// 添加收藏
export function addFavorite(productId: number) {
  return request({
    url: '/user/favorite',
    method: 'post',
    data: { productId }
  })
}

// 取消收藏
export function removeFavorite(productId: number) {
  return request({
    url: `/user/favorite/${productId}`,
    method: 'delete'
  })
}

// 获取订单列表
export function getOrderList(params: {
  status?: string
  page: number
  pageSize: number
}) {
  return request({
    url: '/user/order',
    method: 'get',
    params
  })
}

// 获取订单详情
export function getOrderDetail(orderId: string) {
  return request({
    url: `/user/order/${orderId}`,
    method: 'get'
  })
}

// 取消订单
export function cancelOrder(orderId: string) {
  return request({
    url: `/user/order/${orderId}/cancel`,
    method: 'post'
  })
}

// 确认收货
export function confirmOrder(orderId: string) {
  return request({
    url: `/user/order/${orderId}/confirm`,
    method: 'post'
  })
}

// 删除订单
export function deleteOrder(orderId: string) {
  return request({
    url: `/user/order/${orderId}`,
    method: 'delete'
  })
}

// 评价订单
export function reviewOrder(orderId: string, data: {
  rating: number
  content: string
  images?: string[]
}) {
  return request({
    url: `/user/order/${orderId}/review`,
    method: 'post',
    data
  })
}

// 获取订单统计
export function getOrderStats() {
  return request({
    url: '/user/order/stats',
    method: 'get'
  })
} 
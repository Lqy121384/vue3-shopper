export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface User {
  id: string
  username: string
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface UserInfo {
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

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  nickname?: string
  email?: string
  phone?: string
}

export interface RegisterResponse {
  code: number
  data: {
    id: string
    username: string
    email: string
    phone: string
  }
  message: string
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

export interface SendVerificationCodeRequest {
  phone: string
}

export interface ResetPasswordRequest {
  phone: string
  code: string
  password: string
}

export interface LoginResponse {
  code: number
  data: {
    token: string
    userInfo: UserInfo
  }
  message: string
}

export interface OrderStats {
  total: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
}

export interface Address {
  id: number
  userId: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Coupon {
  id: number
  userId: string
  name: string
  type: 'discount' | 'amount'
  value: number
  minAmount: number
  startTime: Date
  endTime: Date
  status: 'available' | 'used' | 'expired'
  createdAt: Date
  updatedAt: Date
}

export interface PointsRecord {
  id: number
  userId: string
  points: number
  type: 'earn' | 'use'
  description: string
  createdAt: Date
}

export interface Favorite {
  id: number
  userId: string
  productId: number
  productName: string
  productImage: string
  productPrice: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  orderNo: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  totalAmount: number
  discountAmount: number
  pointsAmount: number
  shippingAmount: number
  finalAmount: number
  address: Address
  items: OrderItem[]
  paymentMethod: string
  paymentTime?: Date
  shippingTime?: Date
  completionTime?: Date
  cancelTime?: Date
  remark?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: number
  orderId: string
  productId: number
  productName: string
  productImage: string
  productPrice: number
  quantity: number
  specs?: Record<string, string>
  subtotal: number
  createdAt: Date
  updatedAt: Date
}

export interface OrderReview {
  id: number
  orderId: string
  userId: string
  productId: number
  rating: number
  content: string
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderLogistics {
  id: number
  orderId: string
  company: string
  trackingNo: string
  status: string
  traces: Array<{
    time: Date
    content: string
  }>
  createdAt: Date
  updatedAt: Date
}

export interface OrderInvoice {
  id: number
  orderId: string
  type: string
  title: string
  taxNumber?: string
  email?: string
  phone?: string
  address?: string
  status: 'pending' | 'issued' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface OrderRefund {
  id: number
  orderId: string
  userId: string
  reason: string
  description?: string
  images?: string[]
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface UpdateUserRequest {
  username?: string
  phone?: string
  email?: string
  avatar?: string
  gender?: string
  birthday?: string
}

export interface UserInfoResponse {
  code: number
  data: UserInfo
  message: string
}

export interface ChangePasswordResponse {
  code: number
  message: string
}

export interface LogoutResponse {
  code: number
  message: string
} 
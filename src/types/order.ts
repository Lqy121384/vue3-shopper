import type { Product } from './product'
import type { Address } from './address'

export interface Order {
  id: number
  orderNo: string
  userId: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentNo?: string
  paymentTime?: string
  shippingCompany?: string
  shippingNo?: string
  shippingTime?: string
  receiveTime?: string
  totalAmount: number
  shippingAmount: number
  discountAmount: number
  finalAmount: number
  remark?: string
  createdAt: string
  updatedAt: string
  address: OrderAddress
  items: OrderItem[]
  logs: OrderLog[]
}

export interface OrderItem {
  id: number
  productId: number
  name: string
  image: string
  price: number
  quantity: number
  specs: Record<string, string>
}

export interface OrderAddress {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  isDefault: boolean
}

export interface OrderPayment {
  id: string
  orderId: string
  paymentNo: string
  method: 'alipay' | 'wechat'
  amount: number
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded'
  qrcode?: string
  paymentTime?: Date
  expireTime?: Date
  createdAt: Date
  updatedAt: Date
}

export interface OrderLog {
  id: number
  orderId: number
  type: 'CREATE' | 'PAY' | 'SHIP' | 'RECEIVE' | 'CANCEL'
  content: string
  createdAt: string
}

export interface OrderRefund {
  id: string
  orderId: string
  refundNo: string
  amount: number
  reason: string
  description?: string
  images?: string[]
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  rejectReason?: string
  refundTime?: Date
  createdAt: Date
  updatedAt: Date
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  ALIPAY = 'ALIPAY',
  WECHAT = 'WECHAT'
}

export enum ShippingMethod {
  EXPRESS = 'express',
  STANDARD = 'standard',
  SAME_DAY = 'same_day'
}

export interface OrderFilter {
  status?: OrderStatus
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}
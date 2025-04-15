import request from '@/utils/request'
import type { Order, OrderStatus, PaymentMethod } from '@/types/order'
import type { ApiResponse, OrderStatsResponse } from '@/types/api'

// 获取订单统计
export function getOrderStats(): Promise<ApiResponse<OrderStatsResponse>> {
  return request.get<any, ApiResponse<OrderStatsResponse>>('/api/user/order-stats')
}

// 获取订单列表
export function getOrderList(params: {
  page: number
  pageSize: number
  status?: OrderStatus | ''
  paymentMethod?: PaymentMethod | ''
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<{
  orders: Order[]
  total: number
  currentPage: number
  pageSize: number
}>> {
  return request.get<any, ApiResponse<{
    orders: Order[]
    total: number
    currentPage: number
    pageSize: number
  }>>('/api/user/orders', { params })
}

// 获取订单详情
export function getOrderDetail(orderId: number): Promise<ApiResponse<Order>> {
  return request.get<any, ApiResponse<Order>>(`/api/user/orders/${orderId}`)
}

// 取消订单
export function cancelOrder(orderId: number): Promise<ApiResponse<null>> {
  return request.post<any, ApiResponse<null>>(`/api/user/orders/${orderId}/cancel`)
}

// 确认收货
export function confirmReceipt(orderId: number): Promise<ApiResponse<null>> {
  return request.post<any, ApiResponse<null>>(`/api/user/orders/${orderId}/confirm`)
}

// 删除订单
export function deleteOrder(orderId: number): Promise<ApiResponse<null>> {
  return request.delete<any, ApiResponse<null>>(`/api/user/orders/${orderId}`)
}

// 获取订单日志
export function getOrderLogs(orderId: number): Promise<ApiResponse<any[]>> {
  return request.get(`/api/user/orders/${orderId}/logs`)
}

// 申请退款
export function applyRefund(orderId: number, data: {
  reason: string
  amount: number
  images?: string[]
}): Promise<ApiResponse<void>> {
  return request.post(`/api/user/orders/${orderId}/refund`, data)
}

// 取消退款
export function cancelRefund(orderId: number): Promise<ApiResponse<void>> {
  return request.post(`/api/user/orders/${orderId}/refund/cancel`)
}

// 获取订单商品列表
export function getOrderItems(id: string): Promise<ApiResponse<any[]>> {
  return request.get(`/api/user/orders/${id}/items`)
}

// 获取订单地址
export function getOrderAddress(id: string): Promise<ApiResponse<any>> {
  return request.get(`/api/user/orders/${id}/address`)
}

// 获取订单支付信息
export function getOrderPayment(id: string): Promise<ApiResponse<any>> {
  return request.get(`/api/user/orders/${id}/payment`)
}

// 获取订单金额统计
export function getOrderAmountStats(): Promise<ApiResponse<{
  total: number
  pending: number
  paid: number
  shipped: number
  completed: number
  cancelled: number
  refunded: number
}>> {
  return request.get('/api/user/order-amount-stats')
}

// 获取订单商品统计
export function getOrderProductStats(): Promise<ApiResponse<{
  total: number
  pending: number
  paid: number
  shipped: number
  completed: number
  cancelled: number
  refunded: number
}>> {
  return request.get('/api/user/order-product-stats')
}

// 获取订单评价统计
export function getOrderReviewStats(): Promise<ApiResponse<{
  total: number
  rating: number
  good: number
  medium: number
  bad: number
}>> {
  return request.get('/api/user/order-review-stats')
}

// 获取订单退款统计
export function getOrderRefundStats(): Promise<ApiResponse<{
  total: number
  pending: number
  approved: number
  rejected: number
  completed: number
  cancelled: number
}>> {
  return request.get('/api/user/order-refund-stats')
}

// 获取订单退款原因统计
export function getOrderRefundReasonStats(): Promise<ApiResponse<{
  reasons: {
    reason: string
    count: number
  }[]
}>> {
  return request.get('/api/user/order-refund-reason-stats')
}

// 获取订单退款金额统计
export function getOrderRefundAmountStats(): Promise<ApiResponse<{
  reasons: {
    reason: string
    amount: number
  }[]
}>> {
  return request.get('/api/user/order-refund-amount-stats')
}

// 获取订单退款商品统计
export function getOrderRefundProductStats(): Promise<ApiResponse<{
  reasons: {
    reason: string
    count: number
  }[]
}>> {
  return request.get('/api/user/order-refund-product-stats')
}

// 获取订单退款金额时间统计
export function getOrderRefundAmountTimeStats(): Promise<ApiResponse<{
  times: Array<{
    time: string
    amount: number
  }>
}>> {
  return request.get('/api/user/order-refund-amount-time-stats')
}

// 获取订单退款商品时间统计
export function getOrderRefundProductTimeStats(): Promise<ApiResponse<{
  times: Array<{
    time: string
    count: number
  }>
}>> {
  return request.get('/api/user/order-refund-product-time-stats')
}

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  specs: Record<string, string>
  price: number
  total: number
}

export interface CreateOrderParams {
  items: Array<{
    productId: string | number;
    quantity: number;
    specs?: Record<string, string>;
  }>;
  address: {
    name: string;
    phone: string;
    address: string;
  };
  paymentMethod: string;
}

// 创建订单
export function createOrder(params: CreateOrderParams) {
  return request.post<ApiResponse<Order>>('/api/user/orders', params)
}

// 支付订单
export function payOrder(orderId: string) {
  return request.post<ApiResponse<void>>(`/orders/${orderId}/pay`)
} 
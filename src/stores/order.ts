import { defineStore } from 'pinia'
import type { Order, OrderStatus, PaymentMethod } from '@/types/order'
import {
  getOrderList,
  getOrderDetail,
  getOrderStats,
  getOrderAmountStats,
  getOrderProductStats,
  getOrderReviewStats,
  getOrderRefundStats
} from '@/api/order'

export const useOrderStore = defineStore('order', {
  state: () => ({
    // 订单列表
    orders: [] as Order[],
    total: 0,
    loading: false,
    currentPage: 1,
    pageSize: 10,
    
    // 订单详情缓存
    orderCache: new Map<number, Order>(),
    
    // 筛选条件
    filter: {
      status: '' as OrderStatus | '',
      paymentMethod: '' as PaymentMethod | '',
      dateRange: [] as string[]
    },
    
    // 统计数据
    stats: {
      total: 0,
      pending: 0,
      paid: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    },
    
    amountStats: {
      total: 0,
      pending: 0,
      paid: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    },
    
    productStats: {
      total: 0,
      pending: 0,
      paid: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    },
    
    reviewStats: {
      total: 0,
      rating: 0,
      good: 0,
      medium: 0,
      bad: 0
    },
    
    refundStats: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0
    }
  }),

  getters: {
    // 获取订单详情（优先从缓存获取）
    getOrderById: (state) => (id: number) => {
      return state.orderCache.get(id)
    },
    
    // 获取订单状态统计
    getStatusStats: (state) => {
      return {
        total: state.stats.total,
        pending: state.stats.pending,
        paid: state.stats.paid,
        shipped: state.stats.shipped,
        completed: state.stats.completed,
        cancelled: state.stats.cancelled,
        refunded: state.stats.refunded
      }
    }
  },

  actions: {
    // 获取订单列表
    async fetchOrders() {
      try {
        this.loading = true
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          status: this.filter.status || undefined,
          paymentMethod: this.filter.paymentMethod || undefined,
          startDate: this.filter.dateRange[0],
          endDate: this.filter.dateRange[1]
        }
        const response = await getOrderList(params)
        this.orders = response.data.orders
        this.total = response.data.total
        
        // 更新缓存
        this.orders.forEach(order => {
          this.orderCache.set(order.id, order)
        })
      } catch (error) {
        console.error('获取订单列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取订单详情
    async fetchOrderDetail(id: number) {
      // 先检查缓存
      const cachedOrder = this.orderCache.get(id)
      if (cachedOrder) {
        return cachedOrder
      }
      
      try {
        const response = await getOrderDetail(id)
        const order = response.data
        this.orderCache.set(id, order)
        return order
      } catch (error) {
        console.error('获取订单详情失败:', error)
        throw error
      }
    },
    
    // 获取统计数据
    async fetchStats() {
      try {
        const response = await getOrderStats()
        this.stats = response.data
      } catch (error) {
        console.error('获取订单统计失败:', error)
        throw error
      }
    },
    
    // 获取金额统计
    async fetchAmountStats() {
      try {
        const response = await getOrderAmountStats()
        this.amountStats = response.data
      } catch (error) {
        console.error('获取订单金额统计失败:', error)
        throw error
      }
    },
    
    // 获取商品统计
    async fetchProductStats() {
      try {
        const response = await getOrderProductStats()
        this.productStats = response.data
      } catch (error) {
        console.error('获取订单商品统计失败:', error)
        throw error
      }
    },
    
    // 获取评价统计
    async fetchReviewStats() {
      try {
        const stats = await getOrderReviewStats()
        this.reviewStats = stats
      } catch (error) {
        console.error('获取订单评价统计失败:', error)
        throw error
      }
    },
    
    // 获取退款统计
    async fetchRefundStats() {
      try {
        const stats = await getOrderRefundStats()
        this.refundStats = stats
      } catch (error) {
        console.error('获取订单退款统计失败:', error)
        throw error
      }
    },
    
    // 更新筛选条件
    updateFilter(filter: Partial<typeof this.filter>) {
      this.filter = { ...this.filter, ...filter }
    },
    
    // 更新分页
    updatePagination(page: number, pageSize: number) {
      this.currentPage = page
      this.pageSize = pageSize
    },
    
    // 清除缓存
    clearCache() {
      this.orderCache.clear()
    }
  }
}) 
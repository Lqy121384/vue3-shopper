import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrderStore } from '../order'
import type { Order, OrderStatus, PaymentMethod } from '@/types/order'
import * as orderApi from '@/api/order'

// Mock API calls
vi.mock('@/api/order', () => ({
  getOrderList: vi.fn(),
  getOrderDetail: vi.fn(),
  getOrderStats: vi.fn(),
  getOrderAmountStats: vi.fn(),
  getOrderProductStats: vi.fn(),
  getOrderReviewStats: vi.fn(),
  getOrderRefundStats: vi.fn()
}))

describe('Order Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockOrder: Order = {
    id: 1,
    orderNo: 'ORDER001',
    userId: 1,
    status: 'PENDING' as OrderStatus,
    paymentMethod: 'ALIPAY' as PaymentMethod,
    totalAmount: 100,
    shippingAmount: 10,
    discountAmount: 0,
    finalAmount: 110,
    createdAt: '2024-01-01T00:00:00Z',
    items: [
      {
        id: 1,
        productId: 1,
        name: 'Test Product',
        image: 'test.jpg',
        price: 100,
        quantity: 1,
        specs: { color: 'red' }
      }
    ],
    address: {
      id: 1,
      name: 'Test User',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      address: '测试地址',
      isDefault: true
    },
    logs: [
      {
        id: 1,
        orderId: 1,
        type: 'CREATE',
        content: '订单创建',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]
  }

  describe('fetchOrders', () => {
    it('should fetch orders successfully', async () => {
      const mockResponse = {
        data: {
          list: [mockOrder],
          total: 1
        }
      }
      vi.mocked(orderApi.getOrderList).mockResolvedValue(mockResponse)

      const store = useOrderStore()
      await store.fetchOrders()

      expect(store.orders).toEqual([mockOrder])
      expect(store.total).toBe(1)
      expect(store.orderCache.get(1)).toEqual(mockOrder)
    })

    it('should handle error when fetching orders', async () => {
      const error = new Error('Failed to fetch orders')
      vi.mocked(orderApi.getOrderList).mockRejectedValue(error)

      const store = useOrderStore()
      await expect(store.fetchOrders()).rejects.toThrow(error)
    })
  })

  describe('fetchOrderDetail', () => {
    it('should fetch order detail from cache if available', async () => {
      const store = useOrderStore()
      store.orderCache.set(1, mockOrder)

      const result = await store.fetchOrderDetail(1)

      expect(result).toEqual(mockOrder)
      expect(orderApi.getOrderDetail).not.toHaveBeenCalled()
    })

    it('should fetch order detail from API if not in cache', async () => {
      const mockResponse = { data: mockOrder }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)

      const store = useOrderStore()
      const result = await store.fetchOrderDetail(1)

      expect(result).toEqual(mockOrder)
      expect(store.orderCache.get(1)).toEqual(mockOrder)
    })

    it('should handle error when fetching order detail', async () => {
      const error = new Error('Failed to fetch order detail')
      vi.mocked(orderApi.getOrderDetail).mockRejectedValue(error)

      const store = useOrderStore()
      await expect(store.fetchOrderDetail(1)).rejects.toThrow(error)
    })
  })

  describe('fetchStats', () => {
    it('should fetch all stats successfully', async () => {
      const mockStats = {
        data: {
          total: 10,
          pending: 2,
          paid: 3,
          shipped: 2,
          completed: 2,
          cancelled: 1,
          refunded: 0
        }
      }

      vi.mocked(orderApi.getOrderStats).mockResolvedValue(mockStats)
      vi.mocked(orderApi.getOrderAmountStats).mockResolvedValue(mockStats)
      vi.mocked(orderApi.getOrderProductStats).mockResolvedValue(mockStats)
      vi.mocked(orderApi.getOrderReviewStats).mockResolvedValue({
        data: {
          total: 5,
          rating: 4.5,
          good: 4,
          medium: 1,
          bad: 0
        }
      })
      vi.mocked(orderApi.getOrderRefundStats).mockResolvedValue({
        data: {
          total: 2,
          pending: 1,
          approved: 1,
          rejected: 0,
          completed: 0,
          cancelled: 0
        }
      })

      const store = useOrderStore()
      await store.fetchStats()

      expect(store.stats).toEqual(mockStats.data)
      expect(store.amountStats).toEqual(mockStats.data)
      expect(store.productStats).toEqual(mockStats.data)
      expect(store.reviewStats).toEqual({
        total: 5,
        rating: 4.5,
        good: 4,
        medium: 1,
        bad: 0
      })
      expect(store.refundStats).toEqual({
        total: 2,
        pending: 1,
        approved: 1,
        rejected: 0,
        completed: 0,
        cancelled: 0
      })
    })

    it('should handle error when fetching stats', async () => {
      const error = new Error('Failed to fetch stats')
      vi.mocked(orderApi.getOrderStats).mockRejectedValue(error)

      const store = useOrderStore()
      await expect(store.fetchStats()).rejects.toThrow(error)
    })
  })

  describe('updateFilter', () => {
    it('should update filter correctly', () => {
      const store = useOrderStore()
      const newFilter = {
        status: 'PENDING' as OrderStatus,
        paymentMethod: 'ALIPAY' as PaymentMethod,
        dateRange: ['2024-01-01', '2024-01-31']
      }

      store.updateFilter(newFilter)

      expect(store.filter).toEqual(newFilter)
    })
  })

  describe('updatePagination', () => {
    it('should update pagination correctly', () => {
      const store = useOrderStore()
      store.updatePagination(2, 20)

      expect(store.currentPage).toBe(2)
      expect(store.pageSize).toBe(20)
    })
  })

  describe('clearCache', () => {
    it('should clear order cache', () => {
      const store = useOrderStore()
      store.orderCache.set(1, mockOrder)

      store.clearCache()

      expect(store.orderCache.size).toBe(0)
    })
  })
}) 
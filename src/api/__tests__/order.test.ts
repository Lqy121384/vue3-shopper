import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Order, OrderStatus, PaymentMethod } from '@/types/order'
import * as orderApi from '../order'
import request from '../config'

// Mock request
vi.mock('../config', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Order API', () => {
  beforeEach(() => {
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

  describe('getOrderList', () => {
    it('should fetch order list successfully', async () => {
      const mockResponse = {
        data: {
          list: [mockOrder],
          total: 1
        }
      }
      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const params = {
        page: 1,
        pageSize: 10,
        status: 'PENDING' as OrderStatus,
        paymentMethod: 'ALIPAY' as PaymentMethod,
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }

      const result = await orderApi.getOrderList(params)

      expect(request.get).toHaveBeenCalledWith('/orders', { params })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getOrderDetail', () => {
    it('should fetch order detail successfully', async () => {
      const mockResponse = { data: mockOrder }
      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await orderApi.getOrderDetail(1)

      expect(request.get).toHaveBeenCalledWith('/orders/1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const mockResponse = { data: mockOrder }
      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const data = {
        addressId: 1,
        items: [
          {
            productId: 1,
            quantity: 1,
            specs: { color: 'red' }
          }
        ],
        paymentMethod: 'ALIPAY' as PaymentMethod,
        remark: 'Test order'
      }

      const result = await orderApi.createOrder(data)

      expect(request.post).toHaveBeenCalledWith('/orders', data)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const mockResponse = { data: null }
      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await orderApi.cancelOrder(1)

      expect(request.post).toHaveBeenCalledWith('/orders/1/cancel')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('confirmReceive', () => {
    it('should confirm receive successfully', async () => {
      const mockResponse = { data: null }
      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await orderApi.confirmReceive(1)

      expect(request.post).toHaveBeenCalledWith('/orders/1/receive')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      const mockResponse = { data: null }
      vi.mocked(request.delete).mockResolvedValue(mockResponse)

      const result = await orderApi.deleteOrder(1)

      expect(request.delete).toHaveBeenCalledWith('/orders/1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getOrderLogs', () => {
    it('should fetch order logs successfully', async () => {
      const mockResponse = { data: mockOrder.logs }
      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await orderApi.getOrderLogs(1)

      expect(request.get).toHaveBeenCalledWith('/orders/1/logs')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('applyRefund', () => {
    it('should apply refund successfully', async () => {
      const mockResponse = { data: null }
      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const data = {
        reason: '商品质量问题',
        amount: 100,
        images: ['image1.jpg']
      }

      const result = await orderApi.applyRefund(1, data)

      expect(request.post).toHaveBeenCalledWith('/orders/1/refund', data)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('cancelRefund', () => {
    it('should cancel refund successfully', async () => {
      const mockResponse = { data: null }
      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await orderApi.cancelRefund(1)

      expect(request.post).toHaveBeenCalledWith('/orders/1/refund/cancel')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getOrderStats', () => {
    it('should fetch order stats successfully', async () => {
      const mockResponse = {
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
      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await orderApi.getOrderStats()

      expect(request.get).toHaveBeenCalledWith('/orders/stats')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getOrderAmountStats', () => {
    it('should fetch order amount stats successfully', async () => {
      const mockResponse = {
        data: {
          total: 1000,
          pending: 200,
          paid: 300,
          shipped: 200,
          completed: 200,
          cancelled: 100,
          refunded: 0
        }
      }
      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await orderApi.getOrderAmountStats()

      expect(request.get).toHaveBeenCalledWith('/orders/amount-stats')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getOrderProductStats', () => {
    it('should fetch order product stats successfully', async () => {
      const mockResponse = {
        data: {
          total: 50,
          pending: 10,
          paid: 15,
          shipped: 10,
          completed: 10,
          cancelled: 5,
          refunded: 0
        }
      }
      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await orderApi.getOrderProductStats()

      expect(request.get).toHaveBeenCalledWith('/orders/product-stats')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getOrderReviewStats', () => {
    it('should fetch order review stats successfully', async () => {
      const mockResponse = {
        data: {
          total: 5,
          rating: 4.5,
          good: 4,
          medium: 1,
          bad: 0
        }
      }
      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await orderApi.getOrderReviewStats()

      expect(request.get).toHaveBeenCalledWith('/orders/review-stats')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getOrderRefundStats', () => {
    it('should fetch order refund stats successfully', async () => {
      const mockResponse = {
        data: {
          total: 2,
          pending: 1,
          approved: 1,
          rejected: 0,
          completed: 0,
          cancelled: 0
        }
      }
      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await orderApi.getOrderRefundStats()

      expect(request.get).toHaveBeenCalledWith('/orders/refund-stats')
      expect(result).toEqual(mockResponse)
    })
  })
}) 
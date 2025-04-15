import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import OrderListPage from '../OrderListPage.vue'
import type { Order, OrderStatus, PaymentMethod } from '@/types/order'
import * as orderApi from '@/api/order'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// Mock API calls
vi.mock('@/api/order', () => ({
  getOrderList: vi.fn(),
  cancelOrder: vi.fn(),
  confirmReceive: vi.fn(),
  deleteOrder: vi.fn()
}))

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('OrderListPage', () => {
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

  describe('Initial State', () => {
    it('should render empty state when no orders', () => {
      const wrapper = mount(OrderListPage)
      expect(wrapper.find('.el-empty').exists()).toBe(true)
    })

    it('should render loading state', async () => {
      const wrapper = mount(OrderListPage)
      expect(wrapper.find('.el-loading').exists()).toBe(true)
    })
  })

  describe('Order List', () => {
    it('should render order list correctly', async () => {
      const mockResponse = {
        data: {
          list: [mockOrder],
          total: 1
        }
      }
      vi.mocked(orderApi.getOrderList).mockResolvedValue(mockResponse)

      const wrapper = mount(OrderListPage)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.order-card').exists()).toBe(true)
      expect(wrapper.find('.order-no').text()).toBe('订单号：ORDER001')
      expect(wrapper.find('.order-status').text()).toBe('待付款')
    })
  })

  describe('Filtering', () => {
    it('should filter orders by status', async () => {
      const wrapper = mount(OrderListPage)
      await wrapper.find('select[name="status"]').setValue('PENDING')
      await wrapper.find('button[type="submit"]').trigger('click')

      expect(orderApi.getOrderList).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PENDING'
        })
      )
    })

    it('should filter orders by payment method', async () => {
      const wrapper = mount(OrderListPage)
      await wrapper.find('select[name="paymentMethod"]').setValue('ALIPAY')
      await wrapper.find('button[type="submit"]').trigger('click')

      expect(orderApi.getOrderList).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: 'ALIPAY'
        })
      )
    })

    it('should reset filters', async () => {
      const wrapper = mount(OrderListPage)
      await wrapper.find('button[type="reset"]').trigger('click')

      expect(wrapper.find('select[name="status"]').element.value).toBe('')
      expect(wrapper.find('select[name="paymentMethod"]').element.value).toBe('')
    })
  })

  describe('Pagination', () => {
    it('should change page size', async () => {
      const wrapper = mount(OrderListPage)
      await wrapper.find('select[name="pageSize"]').setValue('20')
      await wrapper.vm.$nextTick()

      expect(orderApi.getOrderList).toHaveBeenCalledWith(
        expect.objectContaining({
          pageSize: 20
        })
      )
    })

    it('should change current page', async () => {
      const wrapper = mount(OrderListPage)
      await wrapper.find('button[aria-label="Go to page 2"]').trigger('click')
      await wrapper.vm.$nextTick()

      expect(orderApi.getOrderList).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2
        })
      )
    })
  })

  describe('Order Actions', () => {
    it('should handle pay action', async () => {
      const mockResponse = {
        data: {
          list: [mockOrder],
          total: 1
        }
      }
      vi.mocked(orderApi.getOrderList).mockResolvedValue(mockResponse)

      const wrapper = mount(OrderListPage)
      await wrapper.vm.$nextTick()
      await wrapper.find('button:contains("立即支付")').trigger('click')

      expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/payment/1')
    })

    it('should handle cancel action', async () => {
      const mockResponse = {
        data: {
          list: [mockOrder],
          total: 1
        }
      }
      vi.mocked(orderApi.getOrderList).mockResolvedValue(mockResponse)
      vi.mocked(ElMessageBox.confirm).mockResolvedValue()
      vi.mocked(orderApi.cancelOrder).mockResolvedValue({ data: null })

      const wrapper = mount(OrderListPage)
      await wrapper.vm.$nextTick()
      await wrapper.find('button:contains("取消订单")').trigger('click')

      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(orderApi.cancelOrder).toHaveBeenCalledWith(1)
      expect(ElMessage.success).toHaveBeenCalledWith('订单已取消')
    })

    it('should handle confirm receive action', async () => {
      const shippedOrder = { ...mockOrder, status: 'SHIPPED' as OrderStatus }
      const mockResponse = {
        data: {
          list: [shippedOrder],
          total: 1
        }
      }
      vi.mocked(orderApi.getOrderList).mockResolvedValue(mockResponse)
      vi.mocked(ElMessageBox.confirm).mockResolvedValue()
      vi.mocked(orderApi.confirmReceive).mockResolvedValue({ data: null })

      const wrapper = mount(OrderListPage)
      await wrapper.vm.$nextTick()
      await wrapper.find('button:contains("确认收货")').trigger('click')

      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(orderApi.confirmReceive).toHaveBeenCalledWith(1)
      expect(ElMessage.success).toHaveBeenCalledWith('确认收货成功')
    })

    it('should handle delete action', async () => {
      const mockResponse = {
        data: {
          list: [mockOrder],
          total: 1
        }
      }
      vi.mocked(orderApi.getOrderList).mockResolvedValue(mockResponse)
      vi.mocked(ElMessageBox.confirm).mockResolvedValue()
      vi.mocked(orderApi.deleteOrder).mockResolvedValue({ data: null })

      const wrapper = mount(OrderListPage)
      await wrapper.vm.$nextTick()
      await wrapper.find('button:contains("删除")').trigger('click')

      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(orderApi.deleteOrder).toHaveBeenCalledWith(1)
      expect(ElMessage.success).toHaveBeenCalledWith('订单已删除')
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch orders')
      vi.mocked(orderApi.getOrderList).mockRejectedValue(error)

      const wrapper = mount(OrderListPage)
      await wrapper.vm.$nextTick()

      expect(ElMessage.error).toHaveBeenCalledWith('获取订单列表失败')
    })

    it('should handle action errors', async () => {
      const mockResponse = {
        data: {
          list: [mockOrder],
          total: 1
        }
      }
      vi.mocked(orderApi.getOrderList).mockResolvedValue(mockResponse)
      vi.mocked(ElMessageBox.confirm).mockResolvedValue()
      vi.mocked(orderApi.cancelOrder).mockRejectedValue(new Error('Failed to cancel order'))

      const wrapper = mount(OrderListPage)
      await wrapper.vm.$nextTick()
      await wrapper.find('button:contains("取消订单")').trigger('click')

      expect(ElMessage.error).toHaveBeenCalledWith('取消订单失败')
    })
  })
}) 
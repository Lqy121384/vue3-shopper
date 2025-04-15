import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import OrderDetailPage from '../OrderDetailPage.vue'
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
  getOrderDetail: vi.fn(),
  cancelOrder: vi.fn(),
  confirmReceive: vi.fn()
}))

// Mock router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      id: '1'
    }
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('OrderDetailPage', () => {
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
    it('should render loading state', () => {
      const wrapper = mount(OrderDetailPage)
      expect(wrapper.find('.el-loading').exists()).toBe(true)
    })
  })

  describe('Order Detail', () => {
    it('should render order detail correctly', async () => {
      const mockResponse = { data: mockOrder }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.order-card').exists()).toBe(true)
      expect(wrapper.find('.order-no').text()).toBe('订单号：ORDER001')
      expect(wrapper.find('.order-status').text()).toBe('待付款')
      expect(wrapper.find('.address-name').text()).toBe('收货人：Test User')
      expect(wrapper.find('.address-phone').text()).toBe('联系电话：13800138000')
      expect(wrapper.find('.product-name').text()).toBe('Test Product')
      expect(wrapper.find('.product-price').text()).toBe('¥100.00')
      expect(wrapper.find('.product-quantity').text()).toBe('x1')
      expect(wrapper.find('.product-subtotal').text()).toBe('¥100.00')
    })
  })

  describe('Order Status', () => {
    it('should show correct status for pending order', async () => {
      const mockResponse = { data: mockOrder }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.order-status').text()).toBe('待付款')
      expect(wrapper.find('button:contains("立即支付")').exists()).toBe(true)
      expect(wrapper.find('button:contains("取消订单")').exists()).toBe(true)
    })

    it('should show correct status for shipped order', async () => {
      const shippedOrder = { ...mockOrder, status: 'SHIPPED' as OrderStatus }
      const mockResponse = { data: shippedOrder }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.order-status').text()).toBe('待收货')
      expect(wrapper.find('button:contains("确认收货")').exists()).toBe(true)
    })

    it('should show correct status for completed order', async () => {
      const completedOrder = { ...mockOrder, status: 'COMPLETED' as OrderStatus }
      const mockResponse = { data: completedOrder }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.order-status').text()).toBe('已完成')
      expect(wrapper.find('button:contains("评价商品")').exists()).toBe(true)
    })
  })

  describe('Order Actions', () => {
    it('should handle pay action', async () => {
      const mockResponse = { data: mockOrder }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()
      await wrapper.find('button:contains("立即支付")').trigger('click')

      expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/payment/1')
    })

    it('should handle cancel action', async () => {
      const mockResponse = { data: mockOrder }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)
      vi.mocked(ElMessageBox.confirm).mockResolvedValue()
      vi.mocked(orderApi.cancelOrder).mockResolvedValue({ data: null })

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()
      await wrapper.find('button:contains("取消订单")').trigger('click')

      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(orderApi.cancelOrder).toHaveBeenCalledWith(1)
      expect(ElMessage.success).toHaveBeenCalledWith('订单已取消')
    })

    it('should handle confirm receive action', async () => {
      const shippedOrder = { ...mockOrder, status: 'SHIPPED' as OrderStatus }
      const mockResponse = { data: shippedOrder }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)
      vi.mocked(ElMessageBox.confirm).mockResolvedValue()
      vi.mocked(orderApi.confirmReceive).mockResolvedValue({ data: null })

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()
      await wrapper.find('button:contains("确认收货")').trigger('click')

      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(orderApi.confirmReceive).toHaveBeenCalledWith(1)
      expect(ElMessage.success).toHaveBeenCalledWith('确认收货成功')
    })

    it('should handle review action', async () => {
      const completedOrder = { ...mockOrder, status: 'COMPLETED' as OrderStatus }
      const mockResponse = { data: completedOrder }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()
      await wrapper.find('button:contains("评价商品")').trigger('click')

      expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/review/1')
    })
  })

  describe('Order Amount', () => {
    it('should calculate order amount correctly', async () => {
      const mockResponse = { data: mockOrder }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.total-amount').text()).toBe('¥100.00')
      expect(wrapper.find('.shipping-amount').text()).toBe('¥10.00')
      expect(wrapper.find('.final-amount').text()).toBe('¥110.00')
    })

    it('should show discount amount when available', async () => {
      const orderWithDiscount = {
        ...mockOrder,
        discountAmount: 20
      }
      const mockResponse = { data: orderWithDiscount }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.discount-amount').text()).toBe('-¥20.00')
    })
  })

  describe('Order Logs', () => {
    it('should render order logs correctly', async () => {
      const mockResponse = { data: mockOrder }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()

      const logItems = wrapper.findAll('.el-timeline-item')
      expect(logItems.length).toBe(1)
      expect(logItems[0].text()).toContain('订单创建')
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch order detail')
      vi.mocked(orderApi.getOrderDetail).mockRejectedValue(error)

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()

      expect(ElMessage.error).toHaveBeenCalledWith('获取订单详情失败')
    })

    it('should handle action errors', async () => {
      const mockResponse = { data: mockOrder }
      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockResponse)
      vi.mocked(ElMessageBox.confirm).mockResolvedValue()
      vi.mocked(orderApi.cancelOrder).mockRejectedValue(new Error('Failed to cancel order'))

      const wrapper = mount(OrderDetailPage)
      await wrapper.vm.$nextTick()
      await wrapper.find('button:contains("取消订单")').trigger('click')

      expect(ElMessage.error).toHaveBeenCalledWith('取消订单失败')
    })
  })
}) 
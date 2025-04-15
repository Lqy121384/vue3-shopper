import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PaymentError,
  PaymentErrorCode,
  PaymentLimit,
  PaymentFee,
  PaymentStats,
  PaymentRefund,
  PaymentInvoice,
  PaymentMethodConfig,
  PaymentNotification
} from '@/types/payment'
import {
  createPayment,
  getPaymentQrcode,
  queryPaymentStatus,
  cancelPayment,
  getPaymentLimits,
  getPaymentFee,
  getPaymentStats,
  getPaymentRefund,
  applyPaymentRefund,
  cancelPaymentRefund,
  getPaymentInvoice,
  applyPaymentInvoice,
  pollPaymentStatus
} from '@/api/payment'
import { ElMessage } from 'element-plus'

export const usePaymentStore = defineStore('payment', () => {
  // 状态
  const currentPayment = ref<Payment | null>(null)
  const paymentLimits = ref<PaymentLimit[]>([])
  const paymentStats = ref<PaymentStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isPaymentPending = computed(() => currentPayment.value?.status === PaymentStatus.PENDING)
  const isPaymentSuccess = computed(() => currentPayment.value?.status === PaymentStatus.SUCCESS)
  const isPaymentFailed = computed(() => currentPayment.value?.status === PaymentStatus.FAILED)
  const isPaymentCancelled = computed(() => currentPayment.value?.status === PaymentStatus.CANCELLED)
  const isPaymentRefunded = computed(() => currentPayment.value?.status === PaymentStatus.REFUNDED)

  // 设置错误信息
  const setError = (message: string) => {
    error.value = message
    ElMessage.error(message)
  }

  // 清除错误信息
  const clearError = () => {
    error.value = null
  }

  // 创建支付订单
  const handleCreatePayment = async (data: {
    orderId: string
    paymentMethod: PaymentMethod
    amount: number
    currency?: string
    description?: string
  }) => {
    try {
      loading.value = true
      clearError()
      
      // 获取支付限额
      const limits = await getPaymentLimits()
      paymentLimits.value = limits
      
      // 创建支付订单
      const response = await createPayment(data)
      
      // 转换响应数据为 Payment 类型
      const payment: Payment = {
        id: response.data.paymentId,
        orderId: data.orderId,
        paymentNo: response.data.paymentNo,
        method: data.paymentMethod,
        amount: data.amount,
        status: PaymentStatus.PENDING,
        qrcode: response.data.qrcode,
        expireTime: response.data.expireTime,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      currentPayment.value = payment
      
      // 开始轮询支付状态
      startPaymentPolling(payment.id)
      
      return payment
    } catch (error) {
      if (error instanceof PaymentError) {
        setError(error.message)
      } else {
        setError('创建支付订单失败')
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取支付二维码
  const handleGetPaymentQrcode = async (paymentId: string): Promise<string> => {
    try {
      loading.value = true
      clearError()
      return await getPaymentQrcode(paymentId)
    } catch (error) {
      if (error instanceof PaymentError) {
        setError(error.message)
      } else {
        setError('获取支付二维码失败')
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  // 开始支付状态轮询
  const startPaymentPolling = async (paymentId: string) => {
    try {
      const status = await pollPaymentStatus(
        paymentId,
        (status: PaymentStatus) => {
          if (currentPayment.value) {
            currentPayment.value.status = status
            currentPayment.value.updatedAt = new Date()
          }
        },
        (error: Error) => {
          if (error instanceof PaymentError) {
            setError(error.message)
          } else {
            setError('查询支付状态失败')
          }
        }
      )
      return status
    } catch (error) {
      if (error instanceof PaymentError) {
        setError(error.message)
      } else {
        setError('查询支付状态失败')
      }
      throw error
    }
  }

  // 取消支付
  const handleCancelPayment = async (paymentId: string) => {
    try {
      loading.value = true
      clearError()
      
      await cancelPayment(paymentId)
      
      if (currentPayment.value) {
        currentPayment.value.status = PaymentStatus.CANCELLED
        currentPayment.value.updatedAt = new Date()
      }
      
      ElMessage.success('支付已取消')
    } catch (error) {
      if (error instanceof PaymentError) {
        setError(error.message)
      } else {
        setError('取消支付失败')
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  // 申请退款
  const handleApplyRefund = async (data: {
    paymentId: string
    amount: number
    reason: string
  }) => {
    try {
      loading.value = true
      clearError()
      
      const refund = await applyPaymentRefund(data.paymentId, {
        reason: data.reason,
        description: `退款金额：${data.amount}`
      })
      
      if (currentPayment.value) {
        currentPayment.value.status = PaymentStatus.REFUNDED
        currentPayment.value.updatedAt = new Date()
      }
      
      ElMessage.success('退款申请已提交')
      return refund
    } catch (error) {
      if (error instanceof PaymentError) {
        setError(error.message)
      } else {
        setError('申请退款失败')
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  // 取消退款
  const handleCancelRefund = async (paymentId: string) => {
    try {
      loading.value = true
      clearError()
      
      await cancelPaymentRefund(paymentId)
      
      if (currentPayment.value) {
        currentPayment.value.status = PaymentStatus.SUCCESS
        currentPayment.value.updatedAt = new Date()
      }
      
      ElMessage.success('退款已取消')
    } catch (error) {
      if (error instanceof PaymentError) {
        setError(error.message)
      } else {
        setError('取消退款失败')
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  // 申请发票
  const handleApplyInvoice = async (data: {
    paymentId: string
    type: 'personal' | 'company'
    title: string
    taxNumber?: string
    amount: number
  }) => {
    try {
      loading.value = true
      clearError()
      
      const invoice = await applyPaymentInvoice(data.paymentId, {
        type: data.type,
        title: data.title,
        taxNumber: data.taxNumber
      })
      
      ElMessage.success('发票申请已提交')
      return invoice
    } catch (error) {
      if (error instanceof PaymentError) {
        setError(error.message)
      } else {
        setError('申请发票失败')
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取支付统计
  const fetchPaymentStats = async (params: {
    startTime?: string
    endTime?: string
  } = {}) => {
    try {
      loading.value = true
      clearError()
      
      const stats = await getPaymentStats(params)
      paymentStats.value = stats
      
      return stats
    } catch (error) {
      if (error instanceof PaymentError) {
        setError(error.message)
      } else {
        setError('获取支付统计失败')
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  // 重置状态
  const resetState = (): void => {
    currentPayment.value = null
    paymentLimits.value = []
    paymentStats.value = null
    loading.value = false
    error.value = null
  }

  return {
    // 状态
    currentPayment,
    paymentLimits,
    paymentStats,
    loading,
    error,

    // 计算属性
    isPaymentPending,
    isPaymentSuccess,
    isPaymentFailed,
    isPaymentCancelled,
    isPaymentRefunded,

    // 方法
    handleCreatePayment,
    handleGetPaymentQrcode,
    handleCancelPayment,
    handleApplyRefund,
    handleCancelRefund,
    handleApplyInvoice,
    fetchPaymentStats,
    resetState
  }
}) 
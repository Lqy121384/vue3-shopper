import request from './config'
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PaymentError,
  PaymentErrorCode,
  CreatePaymentRequest,
  PaymentResponse,
  PaymentCallback,
  PaymentLimit,
  PaymentFee,
  PaymentStats,
  PaymentRefund,
  PaymentInvoice,
  PaymentMethodConfig,
  PaymentNotification
} from '@/types/payment'
import { ElMessage } from 'element-plus'

// 常量定义
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const PAYMENT_TIMEOUT = 30 * 60 * 1000; // 30分钟
const POLL_INTERVAL = 5000; // 5秒

// 支付并发控制
const paymentLocks = new Map<string, Promise<any>>();

const withPaymentLock = async <T>(
  paymentId: string,
  operation: () => Promise<T>
): Promise<T> => {
  if (paymentLocks.has(paymentId)) {
    await paymentLocks.get(paymentId);
  }
  
  const promise = operation().finally(() => {
    paymentLocks.delete(paymentId);
  });
  
  paymentLocks.set(paymentId, promise);
  return promise;
};

// 网络错误处理
const handleNetworkError = async (error: any, retryCount = 0): Promise<any> => {
  if (retryCount >= MAX_RETRIES) {
    throw new PaymentError('网络请求失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
  
  await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  return handleNetworkError(error, retryCount + 1);
};

// 创建支付订单
export async function createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
  return withPaymentLock(data.orderId, async () => {
    try {
      // 验证支付金额
      const limits = await getPaymentLimits();
      const methodLimit = limits.find(l => l.method === data.paymentMethod);
      
      if (!methodLimit) {
        throw new PaymentError('支付方式不支持', PaymentErrorCode.METHOD_NOT_SUPPORTED);
      }
      
      if (data.amount < methodLimit.minAmount) {
        throw new PaymentError('支付金额低于最小限额', PaymentErrorCode.AMOUNT_TOO_LOW);
      }
      
      if (data.amount > methodLimit.maxAmount) {
        throw new PaymentError('支付金额超过最大限额', PaymentErrorCode.AMOUNT_TOO_HIGH);
      }
      
      // 检查每日限额
      const dailyStats = await getPaymentStats({
        startTime: getStartOfDay(),
        endTime: getEndOfDay()
      });
      
      if (dailyStats.totalAmount + data.amount > methodLimit.dailyLimit) {
        throw new PaymentError('超过每日支付限额', PaymentErrorCode.DAILY_LIMIT_EXCEEDED);
      }
      
      // 计算手续费
      const fee = await getPaymentFee({
        amount: data.amount,
        paymentMethod: data.paymentMethod
      });
      
      const response = await request<PaymentResponse>({
        url: '/payment',
        method: 'post',
        data: { ...data, fee }
      });
      
      // 设置支付超时处理
      handlePaymentTimeout(response.data.data.paymentId);
      
      return {
        code: response.data.code,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }
      throw new PaymentError('创建支付订单失败', PaymentErrorCode.NETWORK_ERROR, error);
    }
  });
}

// 获取支付二维码
export async function getPaymentQrcode(paymentId: string): Promise<string> {
  try {
    const response = await request<{ data: { qrcode: string } }>({
      url: `/payment/${paymentId}/qrcode`,
      method: 'get'
    });
    return response.data.data.qrcode;
  } catch (error) {
    throw new PaymentError('获取支付二维码失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
}

// 查询支付状态
export async function queryPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  try {
    const response = await request<{ data: { status: PaymentStatus } }>({
      url: `/payment/${paymentId}/status`,
      method: 'get'
    });
    return response.data.data.status;
  } catch (error) {
    throw new PaymentError('查询支付状态失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
}

// 取消支付
export async function cancelPayment(paymentId: string): Promise<void> {
  return withPaymentLock(paymentId, async () => {
    try {
      await request({
        url: `/payment/${paymentId}/cancel`,
        method: 'put'
      });
    } catch (error) {
      throw new PaymentError('取消支付失败', PaymentErrorCode.NETWORK_ERROR, error);
    }
  });
}

// 获取支付记录
export async function getPaymentHistory(params: {
  page: number;
  pageSize: number;
}): Promise<{ list: Payment[]; total: number }> {
  try {
    return await request({
      url: '/payment/history',
      method: 'get',
      params
    });
  } catch (error) {
    throw new PaymentError('获取支付记录失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
}

// 获取支付方式列表
export async function getPaymentMethods(): Promise<PaymentMethodConfig[]> {
  try {
    return await request({
      url: '/payment/methods',
      method: 'get'
    });
  } catch (error) {
    throw new PaymentError('获取支付方式列表失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
}

// 获取支付配置
export async function getPaymentConfig(): Promise<Record<string, any>> {
  try {
    return await request({
      url: '/payment/config',
      method: 'get'
    });
  } catch (error) {
    throw new PaymentError('获取支付配置失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
}

// 获取支付限额
export async function getPaymentLimits(): Promise<PaymentLimit[]> {
  try {
    return await request({
      url: '/payment/limits',
      method: 'get'
    });
  } catch (error) {
    throw new PaymentError('获取支付限额失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
}

// 获取支付手续费
export async function getPaymentFee(data: {
  amount: number;
  paymentMethod: PaymentMethod;
}): Promise<PaymentFee> {
  try {
    return await request({
      url: '/payment/fee',
      method: 'post',
      data
    });
  } catch (error) {
    throw new PaymentError('获取支付手续费失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
}

// 获取支付通知
export async function getPaymentNotifications(params: {
  page: number;
  pageSize: number;
}): Promise<{ list: PaymentNotification[]; total: number }> {
  try {
    return await request({
      url: '/payment/notifications',
      method: 'get',
      params
    });
  } catch (error) {
    throw new PaymentError('获取支付通知失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
}

// 获取支付统计
export async function getPaymentStats(params: {
  startTime?: string;
  endTime?: string;
}): Promise<PaymentStats> {
  try {
    return await request({
      url: '/payment/stats',
      method: 'get',
      params
    });
  } catch (error) {
    throw new PaymentError('获取支付统计失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
}

// 获取支付导出
export async function exportPayments(params: {
  startTime?: string;
  endTime?: string;
}): Promise<Blob> {
  try {
    return await request({
      url: '/payment/export',
      method: 'get',
      params,
      responseType: 'blob'
    });
  } catch (error) {
    throw new PaymentError('导出支付记录失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
}

// 获取支付退款
export async function getPaymentRefund(paymentId: string): Promise<PaymentRefund> {
  try {
    return await request({
      url: `/payment/${paymentId}/refund`,
      method: 'get'
    });
  } catch (error) {
    throw new PaymentError('获取支付退款失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
}

// 申请支付退款
export async function applyPaymentRefund(
  paymentId: string,
  data: {
    reason: string;
    description?: string;
  }
): Promise<void> {
  return withPaymentLock(paymentId, async () => {
    try {
      await request({
        url: `/payment/${paymentId}/refund`,
        method: 'post',
        data
      });
    } catch (error) {
      throw new PaymentError('申请支付退款失败', PaymentErrorCode.NETWORK_ERROR, error);
    }
  });
}

// 取消支付退款
export async function cancelPaymentRefund(paymentId: string): Promise<void> {
  return withPaymentLock(paymentId, async () => {
    try {
      await request({
        url: `/payment/${paymentId}/refund/cancel`,
        method: 'put'
      });
    } catch (error) {
      throw new PaymentError('取消支付退款失败', PaymentErrorCode.NETWORK_ERROR, error);
    }
  });
}

// 获取支付发票
export async function getPaymentInvoice(paymentId: string): Promise<PaymentInvoice> {
  try {
    return await request({
      url: `/payment/${paymentId}/invoice`,
      method: 'get'
    });
  } catch (error) {
    throw new PaymentError('获取支付发票失败', PaymentErrorCode.NETWORK_ERROR, error);
  }
}

// 申请支付发票
export async function applyPaymentInvoice(
  paymentId: string,
  data: {
    type: string;
    title: string;
    taxNumber?: string;
    email?: string;
    phone?: string;
    address?: string;
  }
): Promise<void> {
  return withPaymentLock(paymentId, async () => {
    try {
      await request({
        url: `/payment/${paymentId}/invoice`,
        method: 'post',
        data
      });
    } catch (error) {
      throw new PaymentError('申请支付发票失败', PaymentErrorCode.NETWORK_ERROR, error);
    }
  });
}

// 工具函数
function getStartOfDay(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function getEndOfDay(): string {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

function handlePaymentTimeout(paymentId: string): void {
  setTimeout(async () => {
    try {
      const status = await queryPaymentStatus(paymentId);
      if (status === PaymentStatus.PENDING) {
        await cancelPayment(paymentId);
      }
    } catch (error) {
      console.error('Payment timeout handling failed:', error);
    }
  }, PAYMENT_TIMEOUT);
}

// 支付状态轮询
export async function pollPaymentStatus(
  paymentId: string,
  onSuccess: (status: PaymentStatus) => void,
  onError: (error: Error) => void,
  maxAttempts = 30
): Promise<void> {
  let attempts = 0;
  
  const poll = async () => {
    try {
      const status = await queryPaymentStatus(paymentId);
      
      if (status === PaymentStatus.SUCCESS) {
        onSuccess(status);
        return;
      }
      
      if (status === PaymentStatus.FAILED || status === PaymentStatus.CANCELLED) {
        onError(new PaymentError('支付失败', PaymentErrorCode.PAYMENT_FAILED));
        return;
      }
      
      if (attempts >= maxAttempts) {
        onError(new PaymentError('支付超时', PaymentErrorCode.PAYMENT_TIMEOUT));
        return;
      }
      
      attempts++;
      setTimeout(poll, POLL_INTERVAL);
    } catch (error) {
      if (error instanceof Error) {
        onError(error);
      } else {
        onError(new PaymentError('支付状态轮询失败', PaymentErrorCode.NETWORK_ERROR, error));
      }
    }
  };
  
  poll();
} 
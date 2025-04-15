// 支付方式
export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT = 'wechat'
}

// 支付状态
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// 支付错误码
export enum PaymentErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AMOUNT_TOO_LOW = 'AMOUNT_TOO_LOW',
  AMOUNT_TOO_HIGH = 'AMOUNT_TOO_HIGH',
  DAILY_LIMIT_EXCEEDED = 'DAILY_LIMIT_EXCEEDED',
  METHOD_NOT_SUPPORTED = 'METHOD_NOT_SUPPORTED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_TIMEOUT = 'PAYMENT_TIMEOUT',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND',
  INVALID_STATUS = 'INVALID_STATUS'
}

// 支付错误
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: PaymentErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

// 支付请求
export interface CreatePaymentRequest {
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  currency?: string;
  description?: string;
}

// 支付响应
export interface PaymentResponse {
  code: number;
  message: string;
  data: {
    paymentId: string;
    paymentNo: string;
    qrcode?: string;
    paymentUrl?: string;
    expireTime: Date;
  };
}

// 支付回调
export interface PaymentCallback {
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  timestamp: number;
  signature: string;
}

// 支付订单
export interface Payment {
  id: string;
  orderId: string;
  paymentNo: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  qrcode?: string;
  paymentTime?: Date;
  expireTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 支付记录
export interface PaymentRecord {
  id: number;
  paymentId: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  description: string;
  createdAt: Date;
}

// 支付方式配置
export interface PaymentMethodConfig {
  id: string;
  name: string;
  code: PaymentMethod;
  icon: string;
  description: string;
  enabled: boolean;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// 支付限额
export interface PaymentLimit {
  id: number;
  method: PaymentMethod;
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

// 支付手续费
export interface PaymentFee {
  method: PaymentMethod;
  rate: number;
  fixed: number;
  minFee: number;
  maxFee: number;
}

// 支付通知
export interface PaymentNotification {
  id: number;
  paymentId: string;
  type: string;
  content: string;
  status: 'success' | 'failed';
  createdAt: Date;
}

// 支付统计
export interface PaymentStats {
  totalAmount: number;
  totalCount: number;
  successCount: number;
  failedCount: number;
  refundCount: number;
  methodStats: Array<{
    method: PaymentMethod;
    amount: number;
    count: number;
    successCount: number;
    failedCount: number;
    refundCount: number;
  }>;
  dailyStats: Array<{
    date: Date;
    amount: number;
    count: number;
    successCount: number;
    failedCount: number;
    refundCount: number;
  }>;
}

// 支付退款
export interface PaymentRefund {
  id: number;
  paymentId: string;
  orderId: string;
  amount: number;
  reason: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// 支付发票
export interface PaymentInvoice {
  id: number;
  paymentId: string;
  orderId: string;
  type: string;
  title: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  amount: number;
  status: 'pending' | 'issued' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
} 
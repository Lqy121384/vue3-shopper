export enum CouponType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage'
}

export enum CouponStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired'
}

export interface Coupon {
  id: string
  name: string
  type: CouponType
  value: number
  minAmount: number
  startTime: Date
  endTime: Date
  status: CouponStatus
  createdAt: Date
  updatedAt: Date
}

export interface UserCoupon {
  id: string
  userId: string
  couponId: string
  status: 'unused' | 'used' | 'expired'
  usedTime?: Date
  createdAt: Date
  updatedAt: Date
} 
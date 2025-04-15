import request from '@/utils/request'

// 用户行为类型
export type BehaviorType = 'view' | 'favorite' | 'cart' | 'purchase'

// 用户行为接口
export interface UserBehavior {
  id?: string
  userId: string
  productId: string
  behaviorType: BehaviorType
  createdAt?: string
}

// 记录用户行为
export function recordUserBehavior(data: UserBehavior) {
  // 确保发送的数据格式正确
  const requestData = {
    userId: data.userId,
    productId: data.productId,
    behaviorType: data.behaviorType
  }
  return request.post('/api/user-behaviors', requestData)
}

// 获取用户行为列表
export function getUserBehaviors(
  userId: string,
  productId?: string,
  behaviorType?: BehaviorType
): UserBehavior[] {
  // 在实际应用中，这里应该从后端API获取数据
  return []
}

// 获取用户行为统计
export function getUserBehaviorStats(
  userId: string,
  productId?: string,
  behaviorType?: BehaviorType
): Record<BehaviorType, number> {
  // 在实际应用中，这里应该从后端API获取数据
  return {
    view: 0,
    favorite: 0,
    cart: 0,
    purchase: 0
  }
}

// 获取商品行为
export function getProductBehaviors(productId: string): UserBehavior[] {
  return []
}

// 获取用户对特定商品的行为
export function getUserProductBehavior(
  userId: string,
  productId: string,
  behaviorType?: BehaviorType
): UserBehavior | undefined {
  return undefined
}

// 获取用户最近的行为
export function getRecentUserBehaviors(
  userId: string,
  pageSize: number = 10
): UserBehavior[] {
  return []
}

// 获取商品最近的行为
export function getRecentProductBehaviors(
  productId: string,
  pageSize: number = 10
): UserBehavior[] {
  return []
} 
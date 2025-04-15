export type BehaviorType = 'view' | 'favorite' | 'cart' | 'purchase';

export interface UserBehavior {
  id: string;
  userId: string;
  productId: string;
  behaviorType: BehaviorType;
  createdAt: string;
} 
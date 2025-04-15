import type { UserBehavior } from '@/types/userBehavior'

// 模拟用户行为数据
export const mockData = {
  userBehaviors: [
    {
      id: '1',
      userId: 'user1',
      productId: '1',
      behaviorType: 'view',
      createdAt: '2024-03-20T10:00:00Z'
    },
    {
      id: '2',
      userId: 'user1',
      productId: '2',
      behaviorType: 'favorite',
      createdAt: '2024-03-20T11:00:00Z'
    },
    {
      id: '3',
      userId: 'user1',
      productId: '3',
      behaviorType: 'cart',
      createdAt: '2024-03-20T12:00:00Z'
    },
    {
      id: '4',
      userId: 'user1',
      productId: '4',
      behaviorType: 'purchase',
      createdAt: '2024-03-20T13:00:00Z'
    },
    {
      id: '5',
      userId: 'user2',
      productId: '1',
      behaviorType: 'view',
      createdAt: '2024-03-20T14:00:00Z'
    },
    {
      id: '6',
      userId: 'user2',
      productId: '2',
      behaviorType: 'favorite',
      createdAt: '2024-03-20T15:00:00Z'
    },
    {
      id: '7',
      userId: 'user2',
      productId: '5',
      behaviorType: 'cart',
      createdAt: '2024-03-20T16:00:00Z'
    },
    {
      id: '8',
      userId: 'user2',
      productId: '6',
      behaviorType: 'purchase',
      createdAt: '2024-03-20T17:00:00Z'
    }
  ] as UserBehavior[]
} 
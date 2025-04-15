import request from '@/utils/request';
import type { ApiResponse } from '@/types/api';
import type { UserBehavior } from '@/types/userBehavior';

export const recordUserBehavior = (data: UserBehavior): Promise<ApiResponse<UserBehavior>> => {
  return request({
    url: '/api/user-behaviors',
    method: 'post',
    data: {
      ...data,
      timestamp: data.timestamp || Date.now()
    }
  });
};

export const getUserBehaviors = (userId: string): Promise<ApiResponse<UserBehavior[]>> => {
  return request({
    url: '/api/user-behaviors',
    method: 'get',
    params: { userId }
  });
}; 
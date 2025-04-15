import type { ProductCategory } from '@/types/product'
import type { ApiResponse } from '@/types/api'
import request from '@/utils/request'

export const getCategories = () => {
  return request.get<ApiResponse<ProductCategory[]>>('/categories')
} 
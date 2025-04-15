import request from '@/utils/request'
import type { Review, ReviewStatus } from '@/types/review'

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 获取商品评价列表
export async function getProductReviews(productId: string, params: any) {
  return request.get(`/api/products/${productId}/reviews`, { params })
}

// 添加商品评价
export async function addProductReview(productId: string, data: any) {
  return request.post(`/api/products/${productId}/reviews`, data)
}

// 更新商品评价
export async function updateProductReview(productId: string, reviewId: string, data: any) {
  return request.put(`/api/products/${productId}/reviews/${reviewId}`, data)
}

// 删除商品评价
export async function deleteProductReview(productId: string, reviewId: string) {
  return request.delete(`/api/products/${productId}/reviews/${reviewId}`)
}

// 获取商品评价统计
export async function getProductReviewStats(productId: string) {
  await delay(300)
  const reviews = mockData.reviews.filter(r => r.productId === productId)
  const total = reviews.length
  const averageRating = total > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0
  const ratingDistribution = {
    1: reviews.filter(r => r.rating === 1).length,
    2: reviews.filter(r => r.rating === 2).length,
    3: reviews.filter(r => r.rating === 3).length,
    4: reviews.filter(r => r.rating === 4).length,
    5: reviews.filter(r => r.rating === 5).length
  }

  return {
    total,
    averageRating,
    ratingDistribution
  }
} 
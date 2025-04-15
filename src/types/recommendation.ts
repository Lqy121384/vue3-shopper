import type { Product } from './product'

export enum RecommendationType {
  PERSONALIZED = 'personalized',
  SIMILAR_PRODUCTS = 'similar_products',
  FREQUENTLY_BOUGHT_TOGETHER = 'frequently_bought_together',
  SEASONAL = 'seasonal',
  TRENDING = 'trending',
  AI = 'ai'
}

export interface BaseRecommendation {
  id: string
  type: RecommendationType
  title: string
  description: string
  products: Product[]
  createdAt: string
  updatedAt: string
}

export interface Recommendation extends BaseRecommendation {
  score?: number
  reason?: string
}

export interface AIRecommendation extends BaseRecommendation {
  query: string
  confidence: number
  explanation: string
}

export interface SimilarityScore {
  productId: string
  score: number
}

export interface RecommendationParams {
  userId?: string
  productId?: string
  categoryId?: string
  limit?: number
  offset?: number
}

export interface RecommendationResponse {
  code: number
  message: string
  data: Recommendation[]
}

export interface AIRecommendationResponse {
  code: number
  message: string
  data: AIRecommendation
}
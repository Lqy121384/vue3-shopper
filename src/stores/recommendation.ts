import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RecommendationType } from '@/types/recommendation'
import type { Product } from '@/types/product'
import type { Recommendation, AIRecommendation } from '@/types/recommendation'
import request from '@/utils/request'

export const useRecommendationStore = defineStore('recommendation', () => {
  // 个性化推荐
  const personalizedRecommendations = ref<Recommendation[]>([])
  
  // 相似商品推荐
  const similarProducts = ref<Recommendation[]>([])
  
  // 经常一起购买的商品
  const frequentlyBoughtTogether = ref<Recommendation[]>([])
  
  // 季节性推荐
  const seasonalRecommendations = ref<Recommendation[]>([])
  
  // 热门商品
  const trendingProducts = ref<Recommendation[]>([])
  
  // AI推荐
  const aiRecommendations = ref<AIRecommendation[]>([])
  
  // 获取个性化推荐
  const fetchPersonalizedRecommendations = async () => {
    try {
      const response = await request.get('/recommendations/personalized')
      personalizedRecommendations.value = response.data.map((item: any) => ({
        id: item.id,
        type: RecommendationType.PERSONALIZED,
        title: '为您推荐',
        description: '根据您的购物历史为您推荐',
        products: item.products,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    } catch (error) {
      console.error('获取个性化推荐失败:', error)
    }
  }
  
  // 获取相似商品推荐
  const fetchSimilarProducts = async (productId: number) => {
    try {
      const response = await request.get(`/recommendations/similar/${productId}`)
      similarProducts.value = response.data.map((item: any) => ({
        id: item.id,
        type: RecommendationType.SIMILAR_PRODUCTS,
        title: '相似商品',
        description: '与当前商品相似的其他商品',
        products: item.products,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    } catch (error) {
      console.error('获取相似商品推荐失败:', error)
    }
  }
  
  // 获取经常一起购买的商品
  const fetchFrequentlyBoughtTogether = async (productId: number) => {
    try {
      const response = await request.get(`/recommendations/frequently-bought/${productId}`)
      frequentlyBoughtTogether.value = response.data.map((item: any) => ({
        id: item.id,
        type: RecommendationType.FREQUENTLY_BOUGHT_TOGETHER,
        title: '经常一起购买',
        description: '其他用户经常一起购买的商品',
        products: item.products,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    } catch (error) {
      console.error('获取经常一起购买的商品失败:', error)
    }
  }
  
  // 获取季节性推荐
  const fetchSeasonalRecommendations = async () => {
    try {
      const response = await request.get('/recommendations/seasonal')
      seasonalRecommendations.value = response.data.map((item: any) => ({
        id: item.id,
        type: RecommendationType.SEASONAL,
        title: '当季推荐',
        description: '应季新鲜农产品推荐',
        products: item.products,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    } catch (error) {
      console.error('获取季节性推荐失败:', error)
    }
  }
  
  // 获取热门商品
  const fetchTrendingProducts = async () => {
    try {
      const response = await request.get('/recommendations/trending')
      trendingProducts.value = response.data.map((item: any) => ({
        id: item.id,
        type: RecommendationType.TRENDING,
        title: '热门商品',
        description: '最近热销商品推荐',
        products: item.products,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    } catch (error) {
      console.error('获取热门商品失败:', error)
    }
  }
  
  // 获取AI推荐
  const getAIRecommendations = async (query: string) => {
    try {
      const response = await request.post('/recommendations/ai', { query })
      aiRecommendations.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('获取AI推荐失败:', error)
      throw error
    }
  }
  
  return {
    personalizedRecommendations,
    similarProducts,
    frequentlyBoughtTogether,
    seasonalRecommendations,
    trendingProducts,
    aiRecommendations,
    fetchPersonalizedRecommendations,
    fetchSimilarProducts,
    fetchFrequentlyBoughtTogether,
    fetchSeasonalRecommendations,
    fetchTrendingProducts,
    getAIRecommendations
  }
})
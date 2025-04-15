import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product, Category, ProductListResponse } from '@/types/product'
import {
  getProductList,
  getProductDetail,
  getCategories,
  getProductReviews,
  getProductSpecs,
  getProductStock,
  getProductRecommend,
  getProductSuggest,
  getProductHotList,
  getProductNewList,
  getProductSaleList
} from '@/api/product'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // 获取商品列表
  const fetchProducts = async (params: any) => {
    try {
      loading.value = true
      const res = await getProductList(params)
      products.value = res.data.data.items
      total.value = res.data.data.total
    } catch (error) {
      console.error('获取商品列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取商品详情
  const fetchProductDetail = async (id: number) => {
    try {
      loading.value = true
      const res = await getProductDetail(id)
      currentProduct.value = res
      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取商品分类
  const fetchCategories = async () => {
    try {
      loading.value = true
      const res = await getCategories()
      categories.value = res
      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取商品评价列表
  const fetchProductReviews = async (params: {
    productId: number
    page: number
    pageSize: number
  }) => {
    try {
      loading.value = true
      const res = await getProductReviews(params)
      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取商品规格
  const fetchProductSpecs = async (productId: number) => {
    try {
      loading.value = true
      const res = await getProductSpecs(productId)
      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取商品库存
  const fetchProductStock = async (params: {
    productId: number
    specs: Record<string, string>
  }) => {
    try {
      loading.value = true
      const res = await getProductStock(params)
      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取商品推荐
  const fetchProductRecommend = async (params: {
    productId: number
    limit?: number
  }) => {
    try {
      loading.value = true
      const res = await getProductRecommend(params)
      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取商品搜索建议
  const fetchProductSuggest = async (keyword: string) => {
    try {
      loading.value = true
      const res = await getProductSuggest(keyword)
      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取商品热销榜
  const fetchProductHotList = async (limit?: number) => {
    try {
      loading.value = true
      const res = await getProductHotList(limit)
      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取商品新品榜
  const fetchProductNewList = async (limit?: number) => {
    try {
      loading.value = true
      const res = await getProductNewList(limit)
      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取商品特惠榜
  const fetchProductSaleList = async (limit?: number) => {
    try {
      loading.value = true
      const res = await getProductSaleList(limit)
      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    currentProduct,
    categories,
    loading,
    total,
    currentPage,
    pageSize,
    fetchProducts,
    fetchProductDetail,
    fetchCategories,
    fetchProductReviews,
    fetchProductSpecs,
    fetchProductStock,
    fetchProductRecommend,
    fetchProductSuggest,
    fetchProductHotList,
    fetchProductNewList,
    fetchProductSaleList
  }
}) 
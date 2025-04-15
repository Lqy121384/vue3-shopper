import type { ProductCategory, ProductReview, ProductSpec, ProductSku, ProductRecommend, ProductReviewListResponse, Product as ProductType } from '../types/product'
import type { ApiResponse } from '../types/api'
import request from '../utils/request'

export type { ProductType as Product }

export interface ProductListData {
  list: ProductType[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductListParams {
  page?: number
  limit?: number
  categoryId?: string
  search?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
}

export interface ProductListResponse {
  list: ProductType[];
  total: number;
  page: number;
  pageSize: number
}

// 默认商品图片
const DEFAULT_IMAGES = Array.from({ length: 10 }, (_, i) => `/images/products/product-${i + 1}.jpg`);

// 商品分类接口
export interface Category {
  id: string
  name: string
  level: number
  sort: number
  icon: string
  children: Category[]
}

// 获取商品列表
export function getProducts(params: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}): Promise<ApiResponse<ProductListData>> {
  return request.get('/api/products', { params })
}

// 获取商品详情
export function getProductDetail(id: string): Promise<ApiResponse<ProductType>> {
  return request.get(`/api/products/${id}`)
}

// 获取商品分类列表
export function getCategories(): Promise<ApiResponse<ProductCategory[]>> {
  return request.get('/api/categories')
}

// 获取商品评论
export function getProductReviews(productId: string, params: {
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<ProductReviewListResponse>> {
  return request.get(`/api/products/${productId}/reviews`, { params })
}

// 获取商品规格
export function getProductSpecs(productId: string): Promise<ApiResponse<Record<string, string>>> {
  if (!productId) {
    return Promise.reject(new Error('商品ID不能为空'))
  }
  return request.get(`/api/products/${productId}/specs`)
}

// 获取商品库存
export function getProductStock(productId: string, skuId: string): Promise<ApiResponse<number>> {
  return request.get(`/api/products/${productId}/stock/${skuId}`)
}

// 获取商品推荐
export function getProductRecommendations(productId: string): Promise<ApiResponse<ProductRecommend[]>> {
  return request.get(`/api/products/${productId}/recommendations`)
}

// 获取热门商品
export const getHotProducts = (limit?: number): Promise<ApiResponse<Product[]>> => {
  const url = limit ? `/api/products/hot?limit=${limit}` : '/api/products/hot'
  return request.get(url)
}

// 创建商品
export function createProduct(data: Partial<ProductType>): Promise<ApiResponse<ProductType>> {
  if (!data.name || !data.price) {
    return Promise.reject(new Error('商品名称和价格不能为空'))
  }
  return request.post('/api/products', data)
}

// 更新商品
export function updateProduct(id: string, data: Partial<ProductType>): Promise<ApiResponse<ProductType>> {
  if (!id) {
    return Promise.reject(new Error('商品ID不能为空'))
  }
  return request.put(`/api/products/${id}`, data)
}

// 删除商品
export function deleteProduct(id: string): Promise<ApiResponse<void>> {
  if (!id) {
    return Promise.reject(new Error('商品ID不能为空'))
  }
  return request.delete(`/api/products/${id}`)
} 
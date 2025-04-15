import type { CartItem, CartSummary, CartItemSpec, CartItemStock, CartRecommend, CartStats } from '@/types/cart'
import type { ApiResponse, ApiPage } from '@/types/api'
import { ApiCode } from '@/types/api'
import { get, post, put, del } from './config'
import request from '@/utils/request'
import type { AddToCartRequest, UpdateCartRequest } from '@/types/cart'

export interface CartListResponse {
  items: CartItem[]
  total: number
}

export interface AddToCartParams {
  productId: string
  quantity: number
  specs: Record<string, string>
}

export interface UpdateCartItemParams {
  id: number
  quantity: number
}

// 获取购物车列表
export const getCartList = () => {
  return request.get('/api/cart')
}

// 获取购物车统计信息
export const getCartStats = () => {
  return request.get('/api/cart/summary')
}

// 获取购物车推荐商品
export function getCartRecommend() {
  return request.get('/api/cart/recommend')
}

// 添加商品到购物车
export const addToCart = (productId: string, quantity: number = 1) => {
  return request.post('/api/cart', { productId, quantity })
}

// 更新购物车商品数量
export const updateCartItem = (id: string, data: { quantity?: number; selected?: boolean }) => {
  return request.put(`/api/cart/${id}`, data)
}

// 更新购物车商品选中状态
export function updateCartItemSelected(id: string, selected: boolean) {
  return request.put(`/api/cart/${id}`, { selected })
}

// 删除购物车商品
export const removeFromCart = (id: string) => {
  return request.delete(`/api/cart/${id}`)
}

// 清空购物车
export const clearCart = () => {
  return request.delete('/api/cart')
}

// 选择/取消选择所有商品
export const selectAllCartItems = (selected: boolean) => {
  return request.put('/api/cart/select-all', { selected })
}

// 切换全选状态
export const toggleSelectAll = (currentSelected: boolean) => {
  return selectAllCartItems(!currentSelected)
}

// 获取购物车商品规格
export function getCartItemSpecs(productId: number): Promise<ApiResponse<CartItemSpec[]>> {
  return request.get<CartItemSpec[]>(`/api/cart/specs/${productId}`)
}

// 获取购物车商品库存
export function getCartItemStock(params: {
  productId: number
  skuId: number
}): Promise<ApiResponse<CartItemStock>> {
  return request.get<CartItemStock>('/api/cart/stock', { params })
}

// 获取购物车商品推荐
export function getCartItemRecommend(productId: number): Promise<ApiResponse<CartRecommend[]>> {
  return request.get<CartRecommend[]>(`/api/cart/recommend/${productId}`)
}

// 获取购物车商品统计
export function getCartItemStats(productId: number): Promise<ApiResponse<CartStats>> {
  return request.get<CartStats>(`/api/cart/stats/${productId}`)
}

// 获取购物车汇总信息
export const getCartSummary = () => {
  return request.get('/api/cart/summary')
}

// 批量删除购物车商品
export function batchRemoveFromCart(ids: number[]): Promise<ApiResponse<void>> {
  return request.post<void>('/api/cart/batch-remove', { ids })
}

// 批量更新购物车商品数量
export function batchUpdateCartQuantity(items: Array<{ id: number; quantity: number }>): Promise<ApiResponse<CartItem[]>> {
  return request.put<CartItem[]>('/api/cart/batch-update', { items })
}

// 批量选择购物车商品
export function batchSelectCartItems(ids: number[], selected: boolean): Promise<ApiResponse<CartItem[]>> {
  return request.put<CartItem[]>('/api/cart/batch-select', { ids, selected })
}

// 获取购物车商品历史
export function getCartHistory(params: {
  page: number
  pageSize: number
}): Promise<ApiResponse<ApiPage<CartItem>>> {
  return request.get<ApiPage<CartItem>>('/api/cart/history', { params })
}

// 恢复购物车商品
export function restoreCartItem(id: number): Promise<ApiResponse<CartItem>> {
  return request.post<CartItem>(`/api/cart/restore/${id}`)
}

// 批量恢复购物车商品
export function batchRestoreCartItems(ids: number[]): Promise<ApiResponse<CartItem[]>> {
  return request.post<CartItem[]>('/api/cart/batch-restore', { ids })
}

// 获取购物车商品收藏
export function getCartFavorites(): Promise<ApiResponse<CartItem[]>> {
  return request.get<CartItem[]>('/api/cart/favorites')
}

// 添加购物车商品到收藏
export function addCartToFavorites(id: number): Promise<ApiResponse<void>> {
  return request.post<void>(`/api/cart/favorites/${id}`)
}

// 批量添加购物车商品到收藏
export function batchAddCartToFavorites(ids: number[]): Promise<ApiResponse<void>> {
  return request.post<void>('/api/cart/batch-favorites', { ids })
}

// 从收藏移除购物车商品
export function removeCartFromFavorites(id: number): Promise<ApiResponse<void>> {
  return request.delete<void>(`/api/cart/favorites/${id}`)
}

// 获取购物车商品数量
export function getCartCount(): Promise<ApiResponse<number>> {
  return request.get<number>('/api/cart/count')
}

// 移动购物车商品到收藏
export function moveToFavorites(ids: number[]): Promise<ApiResponse<void>> {
  return request.post<void>('/api/cart/move-to-favorites', { ids })
}

// 获取推荐商品
export function getRecommendedProducts(): Promise<ApiResponse<CartItem[]>> {
  return request.get<CartItem[]>('/api/cart/recommendations')
} 
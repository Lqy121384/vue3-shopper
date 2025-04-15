import type { Product } from './product'

// 购物车商品
export interface CartItem {
  id: string
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  selected: boolean
  stock?: number
  unit?: string
  spec?: string
  origin?: string
  brand?: string
  storageMethod?: string
  shelfLife?: string
  packingMethod?: string
}

// 购物车商品规格
export interface CartItemSpec {
  id: string
  name: string
  values: string[]
  sort: number
}

// 购物车商品库存
export interface CartItemStock {
  productId: string
  skuId: string
  stock: number
  sales: number
  available: boolean
}

// 购物车商品推荐
export interface CartRecommend {
  id: string
  productId: string
  name: string
  image: string
  price: number
  originalPrice: number
  sales: number
  rating: number
  type: 'hot' | 'new' | 'sale' | 'similar'
  sort: number
}

// 购物车统计
export interface CartStats {
  totalItems: number
  totalAmount: number
  selectedItems: number
  selectedAmount: number
}

// 购物车汇总
export interface CartSummary {
  totalItems: number
  totalAmount: number
  selectedItems: number
  selectedAmount: number
  totalQuantity: number
  selectedQuantity: number
  totalDiscount: number
  totalTax: number
  totalShipping: number
  totalFinal: number
}

export interface CartListResponse {
  items: CartItem[]
  total: number
}

export interface AddToCartRequest {
  productId: string
  quantity: number
  specs: Record<string, string>
}

export interface UpdateCartRequest {
  quantity: number
  selected?: boolean
}
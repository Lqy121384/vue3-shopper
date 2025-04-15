import { ApiResponse } from '@/types/api'

export enum ProductStatus {
  ON_SALE = 'on_sale',
  OFF_SALE = 'off_sale',
  SOLD_OUT = 'sold_out'
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  categoryId?: string
  sales: number
  rating: number
  reviews: ProductReview[]
  tags?: string[]
  specifications?: ProductSpecification[]
  images?: string[]
  isFresh?: boolean
  isOrganic?: boolean
  isLocal?: boolean
  isSeasonal?: boolean
  isPremium?: boolean
  isNew?: boolean
  isHot?: boolean
  isOnSale?: boolean
  stock?: number
  createdAt?: Date
  updatedAt?: Date
  status: 'on' | 'off'
}

export interface Category {
  id: string | number
  name: string
  parentId?: number
  level: number
  sort: number
  icon?: string
  image?: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface NutritionFacts {
  calories: number
  protein: number
  fat: number
  carbohydrates: number
  fiber?: number
  vitamins?: Record<string, number>
  minerals?: Record<string, number>
}

export interface ProductFilter {
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  isOrganic?: boolean
  origin?: string
  tags?: string[]
  sort?: 'price-asc' | 'price-desc' | 'rating-desc' | 'sales-desc'
}

export interface Banner {
  id: number
  title: string
  image: string
  link: string
  position: number
  startTime?: string
  endTime?: string
  isActive: boolean
}

export interface ProductQuery {
  categoryId?: string
  keyword?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  orderId: string
  userName: string
  userAvatar: string
  rating: number
  content: string
  images?: string[]
  reply?: string
  replyTime?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: number
  userId: number
  productId: number
  quantity: number
  price: number
  product: Product
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: number
  userId: number
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  items: OrderItem[]
  address: Address
  shippingMethod: ShippingMethod
  shippingFee: number
  paymentMethod?: PaymentMethod
  paymentTime?: string
  shippingTime?: string
  deliveryTime?: string
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  price: number
  product: Product
}

export interface Address {
  id: number
  userId: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum ShippingMethod {
  EXPRESS = 'EXPRESS',
  STANDARD = 'STANDARD',
  ECONOMY = 'ECONOMY'
}

export enum PaymentMethod {
  ALIPAY = 'ALIPAY',
  WECHAT = 'WECHAT'
}

export interface Coupon {
  id: number
  userId: number
  code: string
  type: 'fixed' | 'percentage'
  value: number
  minAmount: number
  startTime: string
  endTime: string
  used: boolean
  usedTime?: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: number
  userId: number
  title: string
  content: string
  type: 'system' | 'order' | 'promotion'
  read: boolean
  readTime?: string
  createdAt: string
  updatedAt: string
}

export interface ProductSpec {
  id: string
  name: string
  values: string[]
  sort: number
}

export interface ProductSpecValue {
  id: number
  specId: number
  value: string
  sort: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductSku {
  id: string
  productId: string
  specs: Record<string, string>
  price: number
  originalPrice: number
  stock: number
  sales: number
  code: string
  image?: string
  status: 'on' | 'off'
  createdAt: Date
  updatedAt: Date
}

export interface ProductTag {
  id: string
  name: string
  color: string
  sort: number
}

export interface ProductRecommend {
  id: string
  productId: string
  type: 'category' | 'similar' | 'behavior' | 'rating'
  score: number
  createdAt: string
}

export interface ProductSuggest {
  id: number
  keyword: string
  count: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductStats {
  id: string
  productId: string
  views: number
  sales: number
  favorites: number
  reviews: number
  rating: number
  updatedAt: Date
}

export interface ProductCategory {
  id: number
  name: string
  icon: string
  iconColor: string
}

export interface ProductListData {
  list: Product[]
  total: number
  page: number
  pageSize: number
}

export interface ProductListResponse {
  code: number
  message: string
  data: ProductListData
}

export interface ProductReviewListResponse {
  list: ProductReview[]
  total: number
  page: number
  pageSize: number
}

export interface ProductListParams {
  page: number
  pageSize: number
  category?: string
  keyword?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  showFresh?: boolean
  showOrganic?: boolean
  showLocal?: boolean
  showSeasonal?: boolean
  showPremium?: boolean
}

export interface ProductSpecification {
  name: string
  value: string
  unit?: string
  group?: string
  sort?: number
}

export interface HotProduct extends Omit<Product, 'image'> {
  image: string
}
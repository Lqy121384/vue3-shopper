import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseKey)

// 数据库表名
export const DB_TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  ADDRESSES: 'addresses',
  COUPONS: 'coupons',
  USER_COUPONS: 'user_coupons',
  REVIEWS: 'reviews',
  FAVORITES: 'favorites',
  CART: 'cart',
  CART_ITEMS: 'cart_items'
} 
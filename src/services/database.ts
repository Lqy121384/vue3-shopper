import { supabase, DB_TABLES } from '@/config/database'
import type { User, Product, Order, Address, Coupon, Review } from '@/types'

// 用户相关数据库操作
export const userDB = {
  // 获取用户列表
  getUsers: async (params?: { page?: number; pageSize?: number }) => {
    const { page = 1, pageSize = 10 } = params || {}
    const start = (page - 1) * pageSize
    const end = start + pageSize

    const { data, count, error } = await supabase
      .from(DB_TABLES.USERS)
      .select('*', { count: 'exact' })
      .range(start, end)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, total: count || 0 }
  },

  // 获取用户详情
  getUserById: async (id: string) => {
    const { data, error } = await supabase
      .from(DB_TABLES.USERS)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // 更新用户信息
  updateUser: async (id: string, data: Partial<User>) => {
    const { data: updatedUser, error } = await supabase
      .from(DB_TABLES.USERS)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updatedUser
  }
}

// 商品相关数据库操作
export const productDB = {
  // 获取商品列表
  getProducts: async (params?: {
    page?: number
    pageSize?: number
    categoryId?: string
    status?: string
    isNew?: boolean
    isHot?: boolean
  }) => {
    const { page = 1, pageSize = 10, categoryId, status, isNew, isHot } = params || {}
    const start = (page - 1) * pageSize
    const end = start + pageSize

    let query = supabase
      .from(DB_TABLES.PRODUCTS)
      .select('*', { count: 'exact' })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (isNew !== undefined) {
      query = query.eq('is_new', isNew)
    }
    if (isHot !== undefined) {
      query = query.eq('is_hot', isHot)
    }

    const { data, count, error } = await query
      .range(start, end)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, total: count || 0 }
  },

  // 获取商品详情
  getProductById: async (id: string) => {
    const { data, error } = await supabase
      .from(DB_TABLES.PRODUCTS)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
}

// 订单相关数据库操作
export const orderDB = {
  // 获取订单列表
  getOrders: async (params?: {
    page?: number
    pageSize?: number
    userId?: string
    status?: string
    paymentStatus?: string
    shippingStatus?: string
  }) => {
    const { page = 1, pageSize = 10, userId, status, paymentStatus, shippingStatus } = params || {}
    const start = (page - 1) * pageSize
    const end = start + pageSize

    let query = supabase
      .from(DB_TABLES.ORDERS)
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        ),
        shipping_address:addresses (*)
      `, { count: 'exact' })

    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus)
    }
    if (shippingStatus) {
      query = query.eq('shipping_status', shippingStatus)
    }

    const { data, count, error } = await query
      .range(start, end)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, total: count || 0 }
  },

  // 获取订单详情
  getOrderById: async (id: string) => {
    const { data, error } = await supabase
      .from(DB_TABLES.ORDERS)
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        ),
        shipping_address:addresses (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // 创建订单
  createOrder: async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from(DB_TABLES.ORDERS)
      .insert(orderData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 更新订单状态
  updateOrderStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from(DB_TABLES.ORDERS)
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// 地址相关数据库操作
export const addressDB = {
  // 获取地址列表
  getAddresses: async (userId: string) => {
    const { data, error } = await supabase
      .from(DB_TABLES.ADDRESSES)
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })

    if (error) throw error
    return data
  },

  // 添加地址
  addAddress: async (addressData: Omit<Address, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from(DB_TABLES.ADDRESSES)
      .insert(addressData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 更新地址
  updateAddress: async (id: string, addressData: Partial<Address>) => {
    const { data, error } = await supabase
      .from(DB_TABLES.ADDRESSES)
      .update({ ...addressData, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 删除地址
  deleteAddress: async (id: string) => {
    const { error } = await supabase
      .from(DB_TABLES.ADDRESSES)
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// 优惠券相关数据库操作
export const couponDB = {
  // 获取优惠券列表
  getCoupons: async (params?: {
    page?: number
    pageSize?: number
    status?: string
  }) => {
    const { page = 1, pageSize = 10, status } = params || {}
    const start = (page - 1) * pageSize
    const end = start + pageSize

    let query = supabase
      .from(DB_TABLES.COUPONS)
      .select('*', { count: 'exact' })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, count, error } = await query
      .range(start, end)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, total: count || 0 }
  },

  // 获取用户优惠券
  getUserCoupons: async (userId: string) => {
    const { data, error } = await supabase
      .from(DB_TABLES.USER_COUPONS)
      .select(`
        *,
        coupon:coupons (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}

// 评价相关数据库操作
export const reviewDB = {
  // 获取评价列表
  getReviews: async (params?: {
    page?: number
    pageSize?: number
    productId?: string
    userId?: string
    status?: string
  }) => {
    const { page = 1, pageSize = 10, productId, userId, status } = params || {}
    const start = (page - 1) * pageSize
    const end = start + pageSize

    let query = supabase
      .from(DB_TABLES.REVIEWS)
      .select(`
        *,
        user:users (id, username, avatar)
      `, { count: 'exact' })

    if (productId) {
      query = query.eq('product_id', productId)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, count, error } = await query
      .range(start, end)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, total: count || 0 }
  },

  // 添加评价
  addReview: async (reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from(DB_TABLES.REVIEWS)
      .insert(reviewData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 获取商品评价统计
  getProductReviewStats: async (productId: string) => {
    const { data, error } = await supabase
      .rpc('get_product_review_stats', { product_id: productId })

    if (error) throw error
    return data
  }
} 
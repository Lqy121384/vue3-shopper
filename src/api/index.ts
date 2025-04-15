import type { User, UserRole, UserStatus } from '@/types/user'
import type { Product, Category, ProductStatus } from '@/types/product'
import type { Order, OrderStatus, PaymentMethod, ShippingMethod } from '@/types/order'
import type { Address } from '@/types/address'
import type { Coupon, CouponType, CouponStatus } from '@/types/coupon'
import type { Review, ReviewStatus } from '@/types/review'
import request from '@/utils/request'

// 用户相关API
export const userApi = {
  // 用户登录
  login: (data: { username: string; password: string }) => {
    return request.post('/api/auth/login', data)
  },

  // 用户注册
  register: (data: { username: string; password: string; email: string }) => {
    return request.post('/api/auth/register', data)
  },

  // 获取用户信息
  getUserInfo: () => {
    return request.get('/api/user/info')
  },

  // 更新用户信息
  updateUserInfo: (data: Partial<User>) => {
    return request.put('/api/user/info', data)
  }
}

// 商品相关API
export const productApi = {
  // 获取商品列表
  getProducts: (params?: {
    page?: number
    pageSize?: number
    categoryId?: string
    status?: ProductStatus
    isNew?: boolean
    isHot?: boolean
  }) => {
    return request.get('/api/products', { params })
  },

  // 获取商品详情
  getProductById: (id: string) => {
    return request.get(`/api/products/${id}`)
  },

  // 获取商品分类
  getCategories: () => {
    return request.get('/api/categories')
  },

  // 获取热门商品
  getHotProducts: () => {
    return request.get('/api/products/hot')
  },

  // 获取新品上架
  getNewProducts: () => {
    return request.get('/api/products/new')
  },

  // 获取特价商品
  getSaleProducts: () => {
    return request.get('/api/products/sale')
  }
}

// 订单相关API
export const orderApi = {
  // 创建订单
  createOrder: (data: {
    items: Array<{ productId: string; quantity: number }>
    addressId: string
    paymentMethod: PaymentMethod
    shippingMethod: ShippingMethod
    remark?: string
  }) => {
    return request.post('/api/orders', data)
  },

  // 获取订单列表
  getOrders: (params?: {
    page?: number
    pageSize?: number
    status?: OrderStatus
  }) => {
    return request.get('/api/orders', { params })
  },

  // 获取订单详情
  getOrderById: (id: string) => {
    return request.get(`/api/orders/${id}`)
  },

  // 取消订单
  cancelOrder: (id: string) => {
    return request.post(`/api/orders/${id}/cancel`)
  },

  // 支付订单
  payOrder: (id: string, data: { paymentMethod: PaymentMethod }) => {
    return request.post(`/api/orders/${id}/pay`, data)
  }
}

// 购物车相关API
export const cartApi = {
  // 获取购物车列表
  getCart: () => {
    return request.get('/api/cart')
  },

  // 添加商品到购物车
  addToCart: (data: { productId: string; quantity: number }) => {
    return request.post('/api/cart', data)
  },

  // 更新购物车商品数量
  updateCartItem: (id: string, data: { quantity: number }) => {
    return request.put(`/api/cart/${id}`, data)
  },

  // 删除购物车商品
  removeCartItem: (id: string) => {
    return request.delete(`/api/cart/${id}`)
  },

  // 清空购物车
  clearCart: () => {
    return request.delete('/api/cart')
  }
}

// 地址相关API
export const addressApi = {
  // 获取地址列表
  getAddresses: () => {
    return request.get('/api/addresses')
  },

  // 添加地址
  addAddress: (data: Omit<Address, 'id'>) => {
    return request.post('/api/addresses', data)
  },

  // 更新地址
  updateAddress: (id: string, data: Partial<Address>) => {
    return request.put(`/api/addresses/${id}`, data)
  },

  // 删除地址
  deleteAddress: (id: string) => {
    return request.delete(`/api/addresses/${id}`)
  },

  // 设置默认地址
  setDefaultAddress: (id: string) => {
    return request.post(`/api/addresses/${id}/default`)
  }
}

// 优惠券相关API
export const couponApi = {
  // 获取优惠券列表
  getCoupons: (params?: {
    page?: number
    pageSize?: number
    status?: CouponStatus
  }) => {
    return request.get('/api/coupons', { params })
  },

  // 领取优惠券
  receiveCoupon: (id: string) => {
    return request.post(`/api/coupons/${id}/receive`)
  },

  // 使用优惠券
  useCoupon: (id: string, orderId: string) => {
    return request.post(`/api/coupons/${id}/use`, { orderId })
  }
}

// 评价相关API
export const reviewApi = {
  // 获取评价列表
  getReviews: (params?: {
    page?: number
    pageSize?: number
    productId?: string
    status?: ReviewStatus
  }) => {
    return request.get('/api/reviews', { params })
  },

  // 添加评价
  addReview: (data: {
    productId: string
    orderId: string
    rating: number
    content: string
    images?: string[]
  }) => {
    return request.post('/api/reviews', data)
  },

  // 回复评价
  replyReview: (id: string, data: { content: string }) => {
    return request.post(`/api/reviews/${id}/reply`, data)
  }
} 
import express from 'express'
import auth from '../middleware/auth'
import {
  getCartList,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  toggleSelectAll,
  getCartSummary
} from '../controllers/cartController'

const router = express.Router()

// 获取购物车列表
router.get('/', auth, getCartList)

// 添加商品到购物车
router.post('/', auth, addToCart)

// 更新购物车商品数量
router.put('/:id', auth, updateCartItem)

// 从购物车删除商品
router.delete('/:id', auth, removeFromCart)

// 清空购物车
router.delete('/clear', auth, clearCart)

// 全选/取消全选
router.put('/select-all', auth, toggleSelectAll)

// 获取购物车汇总信息
router.get('/summary', auth, getCartSummary)

export default router 
import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import Cart from '../models/Cart'
import Product from '../models/Product'
import { ApiError } from '../utils/ApiError'

// 扩展 Request 类型以包含用户信息
interface AuthenticatedRequest extends Request {
  user?: {
    id: string
  }
}

// 获取购物车列表
export const getCartList = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id
  const cartItems = await Cart.find({ userId }).populate('productId')
  res.json({
    code: 200,
    message: 'success',
    data: {
      items: cartItems,
      total: cartItems.length
    }
  })
})

// 添加商品到购物车
export const addToCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id
  const { productId, quantity, specs } = req.body

  // 检查商品是否存在
  const product = await Product.findById(productId)
  if (!product) {
    throw new ApiError(404, '商品不存在')
  }

  // 检查库存
  if (product.stock < quantity) {
    throw new ApiError(400, '商品库存不足')
  }

  // 检查购物车是否已存在该商品
  const existingItem = await Cart.findOne({ userId, productId })
  if (existingItem) {
    // 更新数量
    existingItem.quantity += quantity
    await existingItem.save()
  } else {
    // 创建新购物车项
    await Cart.create({
      userId,
      productId,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity,
      selected: true,
      stock: product.stock
    })
  }

  res.json({
    code: 200,
    message: '添加成功'
  })
})

// 更新购物车商品
export const updateCartItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id
  const { id } = req.params
  const { quantity, selected } = req.body

  const cartItem = await Cart.findOne({ _id: id, userId })
  if (!cartItem) {
    throw new ApiError(404, '购物车商品不存在')
  }

  // 检查库存
  const product = await Product.findById(cartItem.productId)
  if (!product) {
    throw new ApiError(404, '商品不存在')
  }

  if (product.stock < quantity) {
    throw new ApiError(400, '商品库存不足')
  }

  // 更新购物车项
  cartItem.quantity = quantity
  if (selected !== undefined) {
    cartItem.selected = selected
  }
  await cartItem.save()

  res.json({
    code: 200,
    message: '更新成功',
    data: cartItem
  })
})

// 删除购物车商品
export const removeFromCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id
  const { id } = req.params

  const result = await Cart.deleteOne({ _id: id, userId })
  if (result.deletedCount === 0) {
    throw new ApiError(404, '购物车商品不存在')
  }

  res.json({
    code: 200,
    message: '删除成功'
  })
})

// 清空购物车
export const clearCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id
  await Cart.deleteMany({ userId })

  res.json({
    code: 200,
    message: '清空成功'
  })
})

// 选择/取消选择所有商品
export const toggleSelectAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id
  const { selected } = req.body

  // 检查购物车是否为空
  const cartItems = await Cart.find({ userId })
  if (cartItems.length === 0) {
    return res.status(404).json({
      code: 1,
      message: '购物车商品不存在',
      data: null
    })
  }

  // 更新所有商品的选中状态
  await Cart.updateMany({ userId }, { selected })

  res.json({
    code: 200,
    message: '操作成功',
    data: null
  })
})

// 获取购物车汇总信息
export const getCartSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id
  const cartItems = await Cart.find({ userId })
  
  const summary = {
    totalItems: cartItems.length,
    totalAmount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    selectedItems: cartItems.filter(item => item.selected).length,
    selectedAmount: cartItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  res.json({
    code: 200,
    message: 'success',
    data: summary
  })
}) 
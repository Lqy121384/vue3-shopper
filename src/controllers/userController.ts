import { Request, Response } from 'express'
import User from '../models/User'
import Order from '../models/Order'

// 获取用户信息
export const getUserInfo = async (req: Request, res: Response) => {
  try {
    // 从 auth 中间件获取用户 ID
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      })
    }

    const user = await User.findById(userId).select('-password')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get user info error:', error)
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    })
  }
}

// 更新用户信息
export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      })
    }

    const updateData = req.body

    // 不允许更新密码和角色
    delete updateData.password
    delete updateData.role

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Update user info error:', error)
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    })
  }
}

// 获取订单统计
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const totalOrders = await Order.countDocuments({ userId })
    const pendingOrders = await Order.countDocuments({ userId, status: 'pending' })
    const processingOrders = await Order.countDocuments({ userId, status: 'processing' })
    const shippedOrders = await Order.countDocuments({ userId, status: 'shipped' })
    const deliveredOrders = await Order.countDocuments({ userId, status: 'delivered' })
    const cancelledOrders = await Order.countDocuments({ userId, status: 'cancelled' })

    res.json({
      total: totalOrders,
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders
    })
  } catch (error) {
    console.error('Error fetching order stats:', error)
    res.status(500).json({ message: 'Error fetching order statistics' })
  }
} 
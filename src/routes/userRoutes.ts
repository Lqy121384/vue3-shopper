import express from 'express'
import { getUserInfo, updateUserInfo, getOrderStats } from '../controllers/userController'
import auth from '../middleware/auth'

const router = express.Router()

// 获取用户信息
router.get('/info', auth, getUserInfo)

// 更新用户信息
router.put('/info', auth, updateUserInfo)

// 获取订单统计
router.get('/order-stats', auth, getOrderStats)

export default router 
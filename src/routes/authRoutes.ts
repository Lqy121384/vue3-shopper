import express from 'express'
import { login, register, getCurrentUser } from '../controllers/authController'
import auth from '../middleware/auth'

const router = express.Router()

// 登录路由
router.post('/login', login)

// 注册路由
router.post('/register', register)

// 获取当前用户信息路由（需要认证）
router.get('/me', auth, getCurrentUser)

export default router 
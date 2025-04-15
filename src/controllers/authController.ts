import { Request, Response, NextFunction, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

// 登录
export const login: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body

    // 验证用户名和密码是否提供
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供用户名和密码'
      })
    }

    // 查找用户
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }

    // 验证密码
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用'
      })
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    // 返回用户信息和token
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
}

// 注册
export const register: RequestHandler = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body
    console.log('Register request body:', req.body)

    // 验证必要字段
    if (!username || !password) {
      console.log('Missing required fields:', { username: !!username, password: !!password })
      return res.status(400).json({
        success: false,
        message: '请提供用户名和密码'
      })
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      $or: [
        { username },
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    })

    if (existingUser) {
      console.log('User already exists:', { username, email, phone })
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱或手机号已被使用'
      })
    }

    // 创建新用户
    const user = await User.create({
      username,
      password,
      email,
      phone
    })

    // 生成 JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    // 返回用户信息和token
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
}

// 获取当前用户信息
export const getCurrentUser: RequestHandler = async (req, res) => {
  try {
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
    console.error('Get current user error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
} 
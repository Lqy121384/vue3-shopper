import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/user'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, phone } = req.body

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [
        { username },
        { email },
        { phone }
      ]
    })

    if (existingUser) {
      return res.status(400).json({
        code: 1,
        message: '用户名、邮箱或手机号已被注册'
      })
    }

    // 创建新用户
    const user = new User({
      username,
      password,
      email,
      phone
    })

    await user.save()

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(201).json({
      code: 0,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({
      code: 1,
      message: '注册失败，请稍后重试'
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    // 查找用户
    const user = await User.findOne({
      $or: [
        { username },
        { email: username },
        { phone: username }
      ]
    })

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
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    })
  }
} 
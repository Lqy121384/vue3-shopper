import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError'
import User from '../models/User'

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头获取 token
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      throw new ApiError(401, '未登录')
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any

    // 获取用户信息
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      throw new ApiError(401, '用户不存在')
    }

    // 将用户信息添加到请求对象
    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, '登录已过期'))
    } else {
      next(error)
    }
  }
} 
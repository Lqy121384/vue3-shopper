import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    })
  }

  // 处理 MongoDB 重复键错误
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return res.status(400).json({
      success: false,
      message: '数据已存在'
    })
  }

  // 处理验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }

  // 处理其他错误
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  })
} 
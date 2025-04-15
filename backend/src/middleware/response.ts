import { Request, Response, NextFunction } from 'express'

// 响应处理中间件
export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  // 保存原始的 res.json 方法
  const originalJson = res.json

  // 重写 res.json 方法
  res.json = function (body: any) {
    // 如果响应已经是标准格式，直接返回
    if (body && typeof body === 'object' && 'code' in body && 'message' in body && 'data' in body) {
      return originalJson.call(this, body)
    }

    // 否则，包装成标准格式
    const response = {
      code: 0,
      message: 'success',
      data: body
    }

    return originalJson.call(this, response)
  }

  next()
}

// 错误处理中间件
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)

  // 如果是自定义错误
  if (err.code && err.message) {
    return res.status(err.status || 500).json({
      code: err.code,
      message: err.message,
      data: null
    })
  }

  // 默认错误响应
  res.status(500).json({
    code: 1,
    message: '服务器内部错误',
    data: null
  })
} 
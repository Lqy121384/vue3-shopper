import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { config } from 'dotenv'
import mongoose from 'mongoose'
import { errorHandler } from './middleware/errorHandler'
import cartRoutes from './routes/cartRoutes'
import authRoutes from './routes/authRoutes'
import productRoutes from './routes/productRoutes'
import userRoutes from './routes/userRoutes'

// 加载环境变量
config()

const app = express()

// 中间件
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-product-mall')
  .then(() => {
    console.log('MongoDB Connected: localhost')
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
  })

// 路由
app.use('/api/cart', cartRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/user', userRoutes)

// 错误处理
app.use(errorHandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app 
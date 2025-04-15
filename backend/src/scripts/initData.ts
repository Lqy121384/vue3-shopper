import mongoose from 'mongoose'
import { Product } from '../models/product'
import dotenv from 'dotenv'

dotenv.config()

const sampleProducts = [
  {
    name: '新鲜草莓',
    description: '精选当季新鲜草莓，果肉饱满，酸甜可口',
    price: 39.9,
    originalPrice: 49.9,
    image: 'https://gw.alicdn.com/imgextra/i4/2200724907121/O1CN01kzmJMM24jcFEzp5Yv_!!2200724907121.jpg',
    images: [
      'https://gw.alicdn.com/imgextra/i4/2200724907121/O1CN01kzmJMM24jcFEzp5Yv_!!2200724907121.jpg',
      'https://gw.alicdn.com/imgextra/i1/2200724907121/O1CN01F0Om5v24jcFHVHh7k_!!2200724907121.jpg'
    ],
    category: '水果',
    stock: 100,
    sales: 50,
    rating: 4.5,
    status: 'on_sale',
    isFresh: true,
    isOrganic: true,
    isLocal: true,
    isSeasonal: true,
    isPremium: true
  },
  {
    name: '有机生菜',
    description: '无农药、无化肥的有机生菜，清脆爽口',
    price: 12.9,
    originalPrice: 15.9,
    image: 'https://gw.alicdn.com/imgextra/i1/2200724907121/O1CN01F0Om5v24jcFHVHh7k_!!2200724907121.jpg',
    images: [
      'https://gw.alicdn.com/imgextra/i1/2200724907121/O1CN01F0Om5v24jcFHVHh7k_!!2200724907121.jpg',
      'https://gw.alicdn.com/imgextra/i2/2200724907121/O1CN01y7YL6j24jcFHVHh7k_!!2200724907121.jpg'
    ],
    category: '蔬菜',
    stock: 200,
    sales: 80,
    rating: 4.8,
    status: 'on_sale',
    isFresh: true,
    isOrganic: true,
    isLocal: false,
    isSeasonal: true,
    isPremium: false
  },
  {
    name: '土鸡蛋',
    description: '散养土鸡蛋，蛋黄饱满，营养丰富',
    price: 29.9,
    originalPrice: 35.9,
    image: 'https://gw.alicdn.com/imgextra/i2/2200724907121/O1CN01y7YL6j24jcFHVHh7k_!!2200724907121.jpg',
    images: [
      'https://gw.alicdn.com/imgextra/i2/2200724907121/O1CN01y7YL6j24jcFHVHh7k_!!2200724907121.jpg',
      'https://gw.alicdn.com/imgextra/i3/2200724907121/O1CN01Z5Yt6j24jcFHVHh7k_!!2200724907121.jpg'
    ],
    category: '禽蛋',
    stock: 150,
    sales: 120,
    rating: 4.7,
    status: 'on_sale',
    isFresh: true,
    isOrganic: true,
    isLocal: true,
    isSeasonal: false,
    isPremium: true
  }
]

async function initData() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-product-mall')
    console.log('Connected to MongoDB')

    // 清空现有数据
    await Product.deleteMany({})
    console.log('Cleared existing products')

    // 插入测试数据
    await Product.insertMany(sampleProducts)
    console.log('Inserted sample products')

    console.log('Data initialization completed')
    process.exit(0)
  } catch (error) {
    console.error('Data initialization failed:', error)
    process.exit(1)
  }
}

initData() 
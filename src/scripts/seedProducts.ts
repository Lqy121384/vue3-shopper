import mongoose from 'mongoose'
import { config } from 'dotenv'
import { Product } from '../models/Product'

// 加载环境变量
config()

const products = [
  {
    name: '有机胡萝卜',
    description: '新鲜采摘的有机胡萝卜，富含胡萝卜素，口感清脆',
    price: 5.99,
    image: 'https://gw.alicdn.com/imgextra/i4/2200724907121/O1CN01kzmJMM24jcFEzp5Yv_!!2200724907121.jpg',
    category: 'vegetables',
    stock: 100,
    unit: '斤',
    isFresh: true,
    isOrganic: true,
    isLocal: true,
    isSeasonal: true,
    isPremium: false
  },
  {
    name: '红富士苹果',
    description: '陕西红富士苹果，果肉细腻，甜度高',
    price: 8.99,
    image: 'https://gw.alicdn.com/imgextra/i1/2200724907121/O1CN01F0Om5v24jcFHVHh7k_!!2200724907121.jpg',
    category: 'fruits',
    stock: 80,
    unit: '斤',
    isFresh: true,
    isOrganic: false,
    isLocal: true,
    isSeasonal: true,
    isPremium: true
  },
  {
    name: '五常大米',
    description: '黑龙江五常大米，颗粒饱满，口感绵软',
    price: 39.99,
    image: 'https://gw.alicdn.com/imgextra/i2/2200724907121/O1CN01y7YL6j24jcFHVHh7k_!!2200724907121.jpg',
    category: 'grains',
    stock: 50,
    unit: '袋',
    isFresh: false,
    isOrganic: true,
    isLocal: true,
    isSeasonal: false,
    isPremium: true
  },
  {
    name: '云南普洱茶',
    description: '云南普洱古树茶，陈年醇厚，回甘持久',
    price: 299.99,
    image: 'https://gw.alicdn.com/imgextra/i3/2200724907121/O1CN01Z5Yt6j24jcFHVHh7k_!!2200724907121.jpg',
    category: 'specialties',
    stock: 30,
    unit: '饼',
    isFresh: false,
    isOrganic: true,
    isLocal: true,
    isSeasonal: false,
    isPremium: true
  },
  {
    name: '有机生菜',
    description: '水培有机生菜，无农药，新鲜采摘',
    price: 4.99,
    image: 'https://gw.alicdn.com/imgextra/i4/2200724907121/O1CN01kzmJMM24jcFEzp5Yv_!!2200724907121.jpg',
    category: 'vegetables',
    stock: 120,
    unit: '斤',
    isFresh: true,
    isOrganic: true,
    isLocal: false,
    isSeasonal: true,
    isPremium: false
  },
  {
    name: '海南芒果',
    description: '海南金煌芒果，果肉金黄，香甜可口',
    price: 12.99,
    image: 'https://gw.alicdn.com/imgextra/i1/2200724907121/O1CN01F0Om5v24jcFHVHh7k_!!2200724907121.jpg',
    category: 'fruits',
    stock: 60,
    unit: '斤',
    isFresh: true,
    isOrganic: false,
    isLocal: false,
    isSeasonal: true,
    isPremium: true
  },
  {
    name: '东北黑木耳',
    description: '东北野生黑木耳，肉质厚实，营养丰富',
    price: 45.99,
    image: 'https://gw.alicdn.com/imgextra/i2/2200724907121/O1CN01y7YL6j24jcFHVHh7k_!!2200724907121.jpg',
    category: 'specialties',
    stock: 40,
    unit: '斤',
    isFresh: false,
    isOrganic: true,
    isLocal: true,
    isSeasonal: false,
    isPremium: true
  },
  {
    name: '有机玉米',
    description: '新鲜有机玉米，颗粒饱满，甜度高',
    price: 6.99,
    image: 'https://gw.alicdn.com/imgextra/i3/2200724907121/O1CN01Z5Yt6j24jcFHVHh7k_!!2200724907121.jpg',
    category: 'vegetables',
    stock: 90,
    unit: '斤',
    isFresh: true,
    isOrganic: true,
    isLocal: true,
    isSeasonal: true,
    isPremium: false
  }
]

async function seedProducts() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-product-mall')
    console.log('Connected to MongoDB')

    // 清空现有产品数据
    await Product.deleteMany({})
    console.log('Cleared existing products')

    // 插入新产品数据
    const insertedProducts = await Product.insertMany(products)
    console.log(`Successfully inserted ${insertedProducts.length} products`)

    // 关闭数据库连接
    await mongoose.connection.close()
    console.log('Database connection closed')
  } catch (error) {
    console.error('Error seeding products:', error)
    process.exit(1)
  }
}

// 运行脚本
seedProducts() 
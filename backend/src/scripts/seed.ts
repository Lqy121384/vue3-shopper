import mongoose from 'mongoose'
import { Product } from '../models/product'

const categories = ['水果', '蔬菜', '禽蛋', '肉类', '粮食', '水产', '干货', '调味品']
const fruits = ['草莓', '苹果', '葡萄', '橙子', '香蕉', '梨', '桃子', '西瓜', '芒果', '樱桃']
const vegetables = ['生菜', '胡萝卜', '西兰花', '白菜', '茄子', '青椒', '土豆', '洋葱', '黄瓜', '西红柿']
const meats = ['土鸡', '腊肉', '猪肉', '牛肉', '羊肉', '鸭肉', '鹅肉', '兔肉', '鸽子', '鹌鹑']
const grains = ['大米', '小米', '玉米', '红豆', '绿豆', '黑米', '燕麦', '荞麦', '薏仁', '花生']
const seafood = ['大虾', '螃蟹', '鱼', '贝类', '海参', '鱿鱼', '海带', '紫菜', '虾皮', '鱼干']
const dried = ['香菇', '木耳', '红枣', '枸杞', '桂圆', '核桃', '杏仁', '瓜子', '葡萄干', '干贝']
const condiments = ['酱油', '醋', '盐', '糖', '花椒', '八角', '桂皮', '辣椒', '蒜', '姜']

const sampleProducts = [
  // 水果类
  ...fruits.map((fruit, index) => ({
    name: `精选${fruit}`,
    description: `新鲜采摘的${fruit}，品质优良，口感好`,
    price: (Math.random() * 30 + 20).toFixed(2),
    originalPrice: (Math.random() * 40 + 30).toFixed(2),
    image: `https://example.com/${fruit}.jpg`,
    images: [
      `https://example.com/${fruit}-1.jpg`,
      `https://example.com/${fruit}-2.jpg`
    ],
    category: '水果',
    stock: Math.floor(Math.random() * 200 + 100),
    sales: Math.floor(Math.random() * 100 + 50),
    rating: (Math.random() * 0.5 + 4.5).toFixed(1),
    status: 'on_sale'
  })),
  
  // 蔬菜类
  ...vegetables.map((vegetable, index) => ({
    name: `有机${vegetable}`,
    description: `无农药、无污染的有机${vegetable}，新鲜采摘`,
    price: (Math.random() * 15 + 5).toFixed(2),
    originalPrice: (Math.random() * 20 + 10).toFixed(2),
    image: `https://example.com/${vegetable}.jpg`,
    images: [
      `https://example.com/${vegetable}-1.jpg`,
      `https://example.com/${vegetable}-2.jpg`
    ],
    category: '蔬菜',
    stock: Math.floor(Math.random() * 300 + 150),
    sales: Math.floor(Math.random() * 150 + 70),
    rating: (Math.random() * 0.5 + 4.5).toFixed(1),
    status: 'on_sale'
  })),
  
  // 肉类
  ...meats.map((meat, index) => ({
    name: `农家${meat}`,
    description: `散养${meat}，肉质鲜美，营养丰富`,
    price: (Math.random() * 50 + 40).toFixed(2),
    originalPrice: (Math.random() * 60 + 50).toFixed(2),
    image: `https://example.com/${meat}.jpg`,
    images: [
      `https://example.com/${meat}-1.jpg`,
      `https://example.com/${meat}-2.jpg`
    ],
    category: '肉类',
    stock: Math.floor(Math.random() * 100 + 50),
    sales: Math.floor(Math.random() * 50 + 20),
    rating: (Math.random() * 0.5 + 4.5).toFixed(1),
    status: 'on_sale'
  })),
  
  // 粮食类
  ...grains.map((grain, index) => ({
    name: `优质${grain}`,
    description: `精选${grain}，品质优良，口感好`,
    price: (Math.random() * 30 + 20).toFixed(2),
    originalPrice: (Math.random() * 40 + 30).toFixed(2),
    image: `https://example.com/${grain}.jpg`,
    images: [
      `https://example.com/${grain}-1.jpg`,
      `https://example.com/${grain}-2.jpg`
    ],
    category: '粮食',
    stock: Math.floor(Math.random() * 200 + 100),
    sales: Math.floor(Math.random() * 100 + 50),
    rating: (Math.random() * 0.5 + 4.5).toFixed(1),
    status: 'on_sale'
  })),
  
  // 水产类
  ...seafood.map((seafood, index) => ({
    name: `新鲜${seafood}`,
    description: `新鲜${seafood}，品质优良，营养丰富`,
    price: (Math.random() * 40 + 30).toFixed(2),
    originalPrice: (Math.random() * 50 + 40).toFixed(2),
    image: `https://example.com/${seafood}.jpg`,
    images: [
      `https://example.com/${seafood}-1.jpg`,
      `https://example.com/${seafood}-2.jpg`
    ],
    category: '水产',
    stock: Math.floor(Math.random() * 150 + 50),
    sales: Math.floor(Math.random() * 80 + 30),
    rating: (Math.random() * 0.5 + 4.5).toFixed(1),
    status: 'on_sale'
  })),
  
  // 干货类
  ...dried.map((dried, index) => ({
    name: `精选${dried}`,
    description: `优质${dried}，品质优良，营养丰富`,
    price: (Math.random() * 35 + 25).toFixed(2),
    originalPrice: (Math.random() * 45 + 35).toFixed(2),
    image: `https://example.com/${dried}.jpg`,
    images: [
      `https://example.com/${dried}-1.jpg`,
      `https://example.com/${dried}-2.jpg`
    ],
    category: '干货',
    stock: Math.floor(Math.random() * 150 + 50),
    sales: Math.floor(Math.random() * 80 + 30),
    rating: (Math.random() * 0.5 + 4.5).toFixed(1),
    status: 'on_sale'
  })),
  
  // 调味品类
  ...condiments.map((condiment, index) => ({
    name: `优质${condiment}`,
    description: `精选${condiment}，品质优良，口感好`,
    price: (Math.random() * 20 + 10).toFixed(2),
    originalPrice: (Math.random() * 30 + 20).toFixed(2),
    image: `https://example.com/${condiment}.jpg`,
    images: [
      `https://example.com/${condiment}-1.jpg`,
      `https://example.com/${condiment}-2.jpg`
    ],
    category: '调味品',
    stock: Math.floor(Math.random() * 200 + 100),
    sales: Math.floor(Math.random() * 100 + 50),
    rating: (Math.random() * 0.5 + 4.5).toFixed(1),
    status: 'on_sale'
  }))
]

async function seedProducts() {
  try {
    // 连接数据库
    await mongoose.connect('mongodb://localhost:27017/farm-product-mall')
    console.log('Connected to MongoDB')

    // 清空现有数据
    await Product.deleteMany({})
    console.log('Cleared existing products')

    // 插入示例数据
    const products = await Product.insertMany(sampleProducts)
    console.log('Added sample products:', products)

    // 关闭数据库连接
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  } catch (error) {
    console.error('Error seeding products:', error)
  }
}

seedProducts() 
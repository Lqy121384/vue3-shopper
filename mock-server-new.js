const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const port = 3001;

// 商品分类数据
const categories = [
  {
    id: 1,
    name: '水果',
    icon: 'el-icon-apple',
    children: []
  },
  {
    id: 2,
    name: '蔬菜',
    icon: 'el-icon-food',
    children: []
  },
  {
    id: 3,
    name: '肉类',
    icon: 'el-icon-food',
    children: []
  },
  {
    id: 4,
    name: '海鲜',
    icon: 'el-icon-food',
    children: []
  },
  {
    id: 5,
    name: '粮油',
    icon: 'el-icon-food',
    children: []
  }
];

// 商品数据
const products = [
  {
    id: 1,
    name: '有机草莓',
    description: '新鲜采摘的有机草莓',
    price: 29.9,
    originalPrice: 39.9,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6',
    category: 1,
    sales: 100,
    rating: 4.8,
    tags: ['有机', '新鲜']
  },
  {
    id: 2,
    name: '新鲜橙子',
    description: '阳光充足的新鲜橙子',
    price: 15.9,
    originalPrice: 19.9,
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9',
    category: 1,
    sales: 80,
    rating: 4.6,
    tags: ['新鲜']
  },
  {
    id: 3,
    name: '有机胡萝卜',
    description: '有机种植的新鲜胡萝卜',
    price: 8.9,
    originalPrice: 12.9,
    image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979',
    category: 2,
    sales: 120,
    rating: 4.7,
    tags: ['有机', '新鲜']
  }
];

// 启用 CORS
app.use(cors({
  origin: '*',  // 允许所有来源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 添加静态文件服务
app.use('/images', express.static('public/images'));
app.use('/uploads', express.static('public/uploads'));

// 添加日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 获取热门商品列表
app.get('/api/products/hot', (req, res) => {
  try {
    // 从所有商品中按销量排序，取前三个
    const sortedProducts = [...products]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3)
      .map(product => ({
        id: product.id,
        name: product.name,
        image: product.image,
        description: product.description,
        price: product.price,
        sales: product.sales,
        categoryId: product.category
      }));

    res.json({
      code: 0,
      data: sortedProducts,
      message: '获取热门商品成功'
    });
  } catch (error) {
    console.error('获取热门商品失败:', error);
    res.status(500).json({
      code: 1,
      message: '获取热门商品失败'
    });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Mock server is running on http://localhost:${port}`);
  console.log('Available routes:');
  console.log('- GET /api/products/hot');
}); 
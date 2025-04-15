const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();
const port = 3002;

// 启用 CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// 解析 JSON 请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 模拟数据
const categories = [
  {
          id: 1,
    name: '新鲜水果',
    icon: 'fruit',
    level: 1,
    sort: 1,
    status: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '时令蔬菜',
    icon: 'vegetable',
    level: 1,
    sort: 2,
    status: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: '肉禽蛋品',
    icon: 'meat',
    level: 1,
    sort: 3,
    status: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: '海鲜水产',
    icon: 'seafood',
    level: 1,
    sort: 4,
    status: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: '粮油调味',
    icon: 'oil',
    level: 1,
    sort: 5,
    status: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const products = [
  {
    id: 1,
    name: '红富士苹果',
    price: 5.99,
    originalPrice: 7.99,
    description: '新鲜红富士苹果，果肉细嫩，汁多味甜',
    image: 'https://picsum.photos/400/400',
    stock: 1000,
    sales: 5000,
    rating: 4.8,
    tags: ['新鲜', '热销'],
    specifications: {
      weight: ['500g', '1kg', '2kg'],
      origin: ['陕西', '山东']
    },
    categoryId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '有机生菜',
    price: 3.99,
    originalPrice: 4.99,
    description: '无农药有机生菜，清脆可口',
    image: 'https://picsum.photos/400/400',
    stock: 500,
    sales: 2000,
    rating: 4.7,
    tags: ['有机', '新鲜'],
    specifications: {
      weight: ['200g', '500g'],
      origin: ['云南', '四川']
    },
    categoryId: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: '土鸡蛋',
    price: 12.99,
    originalPrice: 15.99,
    description: '散养土鸡蛋，蛋黄饱满，营养丰富',
    image: 'https://picsum.photos/400/400',
    stock: 200,
    sales: 1000,
    rating: 4.9,
    tags: ['散养', '新鲜'],
    specifications: {
      quantity: ['10枚', '20枚', '30枚'],
      origin: ['河南', '山东']
    },
    categoryId: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: '三文鱼',
    price: 89.99,
    originalPrice: 99.99,
    description: '进口三文鱼，肉质鲜美，富含omega-3',
    image: 'https://picsum.photos/400/400',
    stock: 100,
    sales: 500,
    rating: 4.8,
    tags: ['进口', '新鲜'],
    specifications: {
      weight: ['200g', '500g', '1kg'],
      origin: ['挪威', '智利']
    },
    categoryId: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: '五常大米',
    price: 39.99,
    originalPrice: 49.99,
    description: '黑龙江五常大米，颗粒饱满，香糯可口',
    image: 'https://picsum.photos/400/400',
    stock: 300,
    sales: 1500,
    rating: 4.9,
    tags: ['优质', '热销'],
    specifications: {
      weight: ['5kg', '10kg', '20kg'],
      origin: ['黑龙江']
    },
    categoryId: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 6,
    name: '红心火龙果',
    price: 15.99,
    originalPrice: 19.99,
    description: '新鲜红心火龙果，果肉红艳，甜度适中',
    image: 'https://picsum.photos/400/400',
    stock: 200,
    sales: 800,
    rating: 4.7,
    tags: ['新鲜', '进口'],
    specifications: {
      weight: ['500g', '1kg'],
      origin: ['越南', '泰国']
    },
    categoryId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 7,
    name: '有机胡萝卜',
    price: 4.99,
    originalPrice: 5.99,
    description: '无农药有机胡萝卜，富含胡萝卜素',
    image: 'https://picsum.photos/400/400',
    stock: 400,
    sales: 1200,
    rating: 4.6,
    tags: ['有机', '新鲜'],
    specifications: {
      weight: ['500g', '1kg'],
      origin: ['山东', '河北']
    },
    categoryId: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 8,
    name: '散养土鸡',
    price: 45.99,
    originalPrice: 49.99,
    description: '散养土鸡，肉质紧实，营养丰富',
    image: 'https://picsum.photos/400/400',
    stock: 50,
    sales: 200,
    rating: 4.8,
    tags: ['散养', '新鲜'],
    specifications: {
      weight: ['1kg', '1.5kg', '2kg'],
      origin: ['河南', '山东']
    },
    categoryId: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 9,
    name: '大闸蟹',
    price: 129.99,
    originalPrice: 149.99,
    description: '阳澄湖大闸蟹，蟹黄饱满，肉质鲜美',
    image: 'https://picsum.photos/400/400',
    stock: 100,
    sales: 300,
    rating: 4.9,
    tags: ['新鲜', '限时'],
    specifications: {
      weight: ['500g', '1kg'],
      origin: ['江苏']
    },
    categoryId: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 10,
    name: '特级初榨橄榄油',
    price: 59.99,
    originalPrice: 69.99,
    description: '西班牙进口特级初榨橄榄油，纯天然冷压榨',
    image: 'https://picsum.photos/400/400',
    stock: 150,
    sales: 600,
    rating: 4.8,
    tags: ['进口', '优质'],
    specifications: {
      volume: ['250ml', '500ml', '1L'],
      origin: ['西班牙']
    },
    categoryId: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 11,
    name: '云南红提',
    price: 12.99,
    originalPrice: 15.99,
    description: '云南高原红提，果肉饱满，甜度适中，富含花青素',
    image: 'https://picsum.photos/400/400',
    stock: 300,
    sales: 1200,
    rating: 4.7,
    tags: ['新鲜', '进口'],
    specifications: {
      weight: ['500g', '1kg', '2kg'],
      origin: ['云南']
    },
    categoryId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 12,
    name: '有机西兰花',
    price: 6.99,
    originalPrice: 8.99,
    description: '无农药有机西兰花，富含维生素C和膳食纤维',
    image: 'https://picsum.photos/400/400',
    stock: 200,
    sales: 800,
    rating: 4.6,
    tags: ['有机', '新鲜'],
    specifications: {
      weight: ['300g', '500g'],
      origin: ['山东', '云南']
    },
    categoryId: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 13,
    name: '散养土鸭',
    price: 68.99,
    originalPrice: 79.99,
    description: '散养土鸭，肉质鲜美，营养丰富',
    image: 'https://picsum.photos/400/400',
    stock: 50,
    sales: 200,
    rating: 4.8,
    tags: ['散养', '新鲜'],
    specifications: {
      weight: ['1.5kg', '2kg', '2.5kg'],
      origin: ['四川', '湖南']
    },
    categoryId: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 14,
    name: '大连生蚝',
    price: 99.99,
    originalPrice: 129.99,
    description: '大连新鲜生蚝，肉质肥美，营养丰富',
    image: 'https://picsum.photos/400/400',
    stock: 100,
    sales: 300,
    rating: 4.9,
    tags: ['新鲜', '限时'],
    specifications: {
      weight: ['500g', '1kg'],
      origin: ['大连']
    },
    categoryId: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 15,
    name: '有机小米',
    price: 19.99,
    originalPrice: 24.99,
    description: '山西有机小米，颗粒饱满，营养丰富',
    image: 'https://picsum.photos/400/400',
    stock: 200,
    sales: 800,
    rating: 4.8,
    tags: ['有机', '优质'],
    specifications: {
      weight: ['1kg', '2kg', '5kg'],
      origin: ['山西']
    },
    categoryId: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 16,
    name: '海南芒果',
    price: 25.99,
    originalPrice: 29.99,
    description: '海南金煌芒果，果肉细腻，香甜多汁',
    image: 'https://picsum.photos/400/400',
    stock: 150,
    sales: 600,
    rating: 4.7,
    tags: ['新鲜', '进口'],
    specifications: {
      weight: ['1kg', '2kg', '3kg'],
      origin: ['海南']
    },
    categoryId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 17,
    name: '有机菜心',
    price: 5.99,
    originalPrice: 7.99,
    description: '无农药有机菜心，清脆可口，营养丰富',
    image: 'https://picsum.photos/400/400',
    stock: 300,
    sales: 1000,
    rating: 4.6,
    tags: ['有机', '新鲜'],
    specifications: {
      weight: ['300g', '500g'],
      origin: ['广东', '广西']
    },
    categoryId: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 18,
    name: '散养鹅',
    price: 89.99,
    originalPrice: 99.99,
    description: '散养鹅，肉质鲜美，营养丰富',
    image: 'https://picsum.photos/400/400',
    stock: 30,
    sales: 100,
    rating: 4.8,
    tags: ['散养', '新鲜'],
    specifications: {
      weight: ['2kg', '2.5kg', '3kg'],
      origin: ['广东', '广西']
    },
    categoryId: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 19,
    name: '青岛大虾',
    price: 159.99,
    originalPrice: 179.99,
    description: '青岛新鲜大虾，肉质鲜美，营养丰富',
    image: 'https://picsum.photos/400/400',
    stock: 80,
    sales: 250,
    rating: 4.9,
    tags: ['新鲜', '限时'],
    specifications: {
      weight: ['500g', '1kg'],
      origin: ['青岛']
    },
    categoryId: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 20,
    name: '有机黑米',
    price: 29.99,
    originalPrice: 34.99,
    description: '东北有机黑米，富含花青素，营养丰富',
    image: 'https://picsum.photos/400/400',
    stock: 150,
    sales: 500,
    rating: 4.8,
    tags: ['有机', '优质'],
    specifications: {
      weight: ['1kg', '2kg', '5kg'],
      origin: ['黑龙江']
    },
    categoryId: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const users = [
  {
    id: 1,
    username: 'test',
    password: '123456',
    email: 'test@example.com',
    avatar: 'https://picsum.photos/200/200',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const carts = new Map();
const orders = new Map();
const combinations = new Map();
const productSpecs = new Map();
const userBehaviors = new Map();

// 添加初始订单数据
const initialOrders = [
  {
    id: 1,
    orderNo: 'ORDER202401010001',
    userId: 1,
    items: [
      {
        id: 1,
        productId: 1,
        name: '红富士苹果',
        price: 5.99,
        quantity: 2,
        specs: { weight: '1kg' },
        image: 'https://picsum.photos/400/400',
        total: 11.98
      }
    ],
    totalAmount: 11.98,
    shippingAmount: 10,
    discountAmount: 0,
    finalAmount: 21.98,
    status: 'PENDING',
    paymentMethod: 'ONLINE',
    address: {
      name: '张三',
      phone: '13800138000',
      address: '北京市海淀区清华大学'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    orderNo: 'ORDER202401010002',
    userId: 1,
    items: [
      {
        id: 2,
        productId: 2,
        name: '有机生菜',
        price: 3.99,
        quantity: 3,
        specs: { weight: '500g' },
        image: 'https://picsum.photos/400/400',
        total: 11.97
      }
    ],
    totalAmount: 11.97,
    shippingAmount: 10,
    discountAmount: 0,
    finalAmount: 21.97,
    status: 'PAID',
    paymentMethod: 'ONLINE',
    address: {
      name: '张三',
      phone: '13800138000',
      address: '北京市海淀区清华大学'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// 将初始订单数据添加到 orders Map 中
initialOrders.forEach(order => {
  orders.set(order.id, order);
});

// 清空现有的订单数据
orders.clear();

// API 路由
app.get('/api/products', (req, res) => {
  const { page = 1, limit = 10, category, search, sort: sortParam, minPrice, maxPrice } = req.query;
  
  // 转换排序参数名称
  const sortMap = {
    'price': 'price_asc',
    'price-desc': 'price_desc',
    'sales': 'sales_desc',
    'rating': 'rating_desc',
    'createdAt': 'newest',
    'id': 'id_desc',
    'id-desc': 'id_desc',
    'id-asc': 'id_asc'
  };

  // 处理排序参数
  const sort = sortParam ? (sortMap[sortParam] || sortParam) : null;
  console.log('Processed sort parameter:', sort); // 添加日志

    let filteredProducts = [...products];
    
  // 分类过滤
    if (category) {
    filteredProducts = filteredProducts.filter(p => p.categoryId === parseInt(category));
  }
  
  // 搜索过滤
    if (search) {
    const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.description.toLowerCase().includes(searchLower)
    );
  }
  
  // 价格过滤
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
  }

  // 应用排序
    if (sort) {
    console.log('Applying sort:', sort); // 添加日志
      switch (sort) {
        case 'price_asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'sales_desc':
          filteredProducts.sort((a, b) => b.sales - a.sales);
          break;
        case 'rating_desc':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
      case 'newest':
          filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      case 'id_desc':
        filteredProducts.sort((a, b) => {
          // 确保 id 是数字类型
          const idA = typeof a.id === 'string' ? parseInt(a.id) : a.id;
          const idB = typeof b.id === 'string' ? parseInt(b.id) : b.id;
          return idB - idA;
        });
        break;
      case 'id_asc':
        filteredProducts.sort((a, b) => {
          // 确保 id 是数字类型
          const idA = typeof a.id === 'string' ? parseInt(a.id) : a.id;
          const idB = typeof b.id === 'string' ? parseInt(b.id) : b.id;
          return idA - idB;
        });
          break;
        default:
          // 默认按创建时间倒序
          filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    console.log('Sorted products:', filteredProducts.map(p => ({ 
      id: p.id,
      name: p.name, 
      price: p.price, 
      sales: p.sales,
      rating: p.rating,
      sort 
    }))); // 添加更详细的日志
    }
    
    // 分页
  const start = (parseInt(page) - 1) * parseInt(limit);
  const end = start + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(start, end);
    
    res.json({
      code: 0,
      data: {
      list: paginatedProducts,
        total: filteredProducts.length,
      page: parseInt(page),
      limit: parseInt(limit)
    },
    message: 'success'
  });
});

app.get('/api/products/hot', (req, res) => {
  const { limit = 8 } = req.query;
  const hotProducts = [...products]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, parseInt(limit));
  
    res.json({
      code: 0,
    data: hotProducts,
    message: 'success'
  });
});

app.get('/api/categories', (req, res) => {
    res.json({
      code: 0,
    data: categories,
    message: 'success'
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({
      code: 404,
      message: 'Product not found'
    });
  }
  res.json({
    code: 0,
    data: product,
    message: 'success'
  });
});

app.get('/api/products/:id/specs', (req, res) => {
  const specs = productSpecs.get(parseInt(req.params.id)) || [];
  res.json({
    code: 0,
    data: specs,
    message: 'success'
  });
});

app.get('/api/products/:id/reviews', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const reviews = []; // 模拟评论数据
  res.json({
    code: 0,
    data: {
      list: reviews,
      total: reviews.length,
      page: parseInt(page),
      limit: parseInt(limit)
    },
    message: 'success'
  });
});

// 购物车相关 API
app.get('/api/cart', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  const userId = 1; // 对于测试用户，我们直接使用ID 1
  
  const cart = carts.get(userId) || [];
    res.json({
      code: 0,
    data: cart,
    message: 'success'
  });
});

// 添加购物车汇总信息接口
app.get('/api/cart/summary', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  const userId = 1; // 对于测试用户，我们直接使用ID 1
  
  const cart = carts.get(userId) || [];
  
  // 计算购物车汇总信息
  const summary = {
    totalQuantity: 0,
    totalAmount: 0,
    totalDiscount: 0,
    totalPrice: 0,
    items: []
  };
  
  cart.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      const itemTotal = product.price * item.quantity;
      const itemDiscount = (product.originalPrice - product.price) * item.quantity;
      
      summary.totalQuantity += item.quantity;
      summary.totalAmount += product.originalPrice * item.quantity;
      summary.totalDiscount += itemDiscount;
      summary.totalPrice += itemTotal;
      
      summary.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: item.quantity,
        total: itemTotal,
        discount: itemDiscount,
        image: product.image
      });
    }
  });

    res.json({
      code: 0,
    data: summary,
    message: 'success'
  });
});

app.post('/api/cart', (req, res) => {
  const userId = req.headers['x-user-id'];
  const { productId, quantity, specs } = req.body;
  const cart = carts.get(userId) || [];
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity, specs });
  }
  
  carts.set(userId, cart);
    res.json({
      code: 0,
    data: cart,
    message: 'success'
  });
});

app.put('/api/cart/:productId', (req, res) => {
  const userId = req.headers['x-user-id'];
  const { quantity } = req.body;
  const cart = carts.get(userId) || [];
  const item = cart.find(item => item.productId === parseInt(req.params.productId));
  
  if (item) {
    item.quantity = quantity;
    carts.set(userId, cart);
  }
  
  res.json({
    code: 0,
    data: cart,
    message: 'success'
  });
});

app.delete('/api/cart/:productId', (req, res) => {
  const userId = req.headers['x-user-id'];
  const cart = carts.get(userId) || [];
  const newCart = cart.filter(item => item.productId !== parseInt(req.params.productId));
  carts.set(userId, newCart);

    res.json({
      code: 0,
    data: newCart,
    message: 'success'
  });
});

app.delete('/api/cart', (req, res) => {
  const userId = req.headers['x-user-id'];
  carts.set(userId, []);

    res.json({
      code: 0,
    data: [],
    message: 'success'
  });
});

app.get('/api/cart/count', (req, res) => {
  const userId = req.headers['x-user-id'];
  const cart = carts.get(userId) || [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  res.json({
    code: 0,
    data: count,
    message: 'success'
  });
});

// 用户认证相关 API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      code: 401,
      message: 'Invalid username or password'
    });
  }
  
  const token = 'mock_token_' + Date.now();
    res.json({
      code: 0,
      data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    },
    message: 'success'
  });
});

app.post('/api/auth/logout', (req, res) => {
    res.json({
      code: 0,
    message: 'success'
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, email } = req.body;
  
  if (users.some(u => u.username === username)) {
    return res.status(400).json({
      code: 400,
      message: 'Username already exists'
    });
  }
  
  const newUser = {
    id: users.length + 1,
    username,
    password,
    email,
    avatar: 'https://picsum.photos/200/200',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);

    res.json({
      code: 0,
      data: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar
    },
    message: 'success'
  });
});

// 用户信息相关 API
app.get('/api/auth/user', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  // 从token中提取用户ID（在这个mock实现中，我们假设token中包含用户ID）
  const userId = 1; // 对于测试用户，我们直接使用ID 1
  
  const user = users.find(u => u.id === userId);
  
  if (!user) {
      return res.status(404).json({
      code: 404,
      message: 'User not found'
    });
  }
  
  res.json({
    code: 0,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    },
    message: 'success'
  });
});

app.get('/api/user/info', (req, res) => {
  const userId = req.headers['x-user-id'];
  const user = users.find(u => u.id === parseInt(userId));
  
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: 'User not found'
    });
    }

    res.json({
      code: 0,
      data: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    },
    message: 'success'
  });
});

app.put('/api/user/info', (req, res) => {
  const userId = req.headers['x-user-id'];
  const { email, avatar } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: 'User not found'
    });
  }
  
  user.email = email;
  user.avatar = avatar;
  user.updatedAt = new Date().toISOString();

    res.json({
      code: 0,
      data: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    },
    message: 'success'
  });
});

app.put('/api/user/password', (req, res) => {
  const userId = req.headers['x-user-id'];
  const { oldPassword, newPassword } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  
  if (!user) {
      return res.status(404).json({
      code: 404,
      message: 'User not found'
    });
  }
  
  if (user.password !== oldPassword) {
    return res.status(400).json({
      code: 400,
      message: 'Invalid old password'
    });
  }
  
  user.password = newPassword;
  user.updatedAt = new Date().toISOString();

    res.json({
      code: 0,
    message: 'success'
  });
});

// 订单相关 API
app.post('/api/user/orders', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  const userId = 1; // 对于测试用户，我们直接使用ID 1
  
  const { items, address, paymentMethod } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      code: 400,
      message: '订单商品不能为空'
    });
  }
  
  if (!address || !address.name || !address.phone || !address.address) {
    return res.status(400).json({
      code: 400,
      message: '收货地址信息不完整'
    });
  }
  
  if (!paymentMethod) {
    return res.status(400).json({
      code: 400,
      message: '请选择支付方式'
    });
  }
  
  // 生成订单号
  const orderNo = `ORDER${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  // 计算订单总金额
  let totalAmount = 0;
  const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
    if (!product) {
      throw new Error(`商品不存在: ${item.productId}`);
    }
    const subtotal = product.price * item.quantity;
    totalAmount += subtotal;
      return {
      id: Date.now() + Math.random(),
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      specs: item.specs,
        image: product.image,
      subtotal
    };
  });
  
  // 创建订单对象
  const orderId = Date.now().toString();
  const order = {
    id: orderId,
    orderNo: orderNo,
    userId: userId,
    status: 'PENDING',
    paymentMethod: paymentMethod,
    items: orderItems,
    address: address,
    totalAmount: totalAmount,
    shippingAmount: 0, // 默认免运费
    discountAmount: 0, // 默认无优惠
    finalAmount: totalAmount, // 实付金额等于商品总额
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // 存储订单
  orders.set(orderId, order);
  
  res.json({
    code: 0,
    data: order,
    message: '订单创建成功'
  });
});

app.get('/api/user/orders', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  const userId = 1; // 对于测试用户，我们直接使用ID 1
  
  const { page = 1, pageSize = 10, status } = req.query;
  
  // 从 Map 中获取所有订单并过滤出用户的订单
  const userOrders = Array.from(orders.values()).filter(order => order.userId === userId);
  
  let filteredOrders = [...userOrders];
  if (status) {
    filteredOrders = filteredOrders.filter(order => order.status === status);
  }
  
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const end = start + parseInt(pageSize);
  const paginatedOrders = filteredOrders.slice(start, end);

    res.json({
      code: 0,
    data: {
      orders: paginatedOrders,
      total: filteredOrders.length,
      currentPage: parseInt(page),
      pageSize: parseInt(pageSize)
    },
    message: 'success'
  });
});

app.get('/api/user/orders/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  const userId = 1; // 对于测试用户，我们直接使用ID 1
  
  const orderId = req.params.id;
  // 从所有订单中查找匹配的订单
  const order = Array.from(orders.values()).find(order => order.id === orderId);
  
  if (!order) {
    return res.status(404).json({
      code: 404,
      message: '订单不存在'
    });
  }

  if (order.userId !== userId) {
    return res.status(403).json({
      code: 403,
      message: '无权查看此订单'
    });
  }
  
  res.json({
    code: 0,
    data: order,
    message: 'success'
  });
});

app.post('/api/user/orders/:id/cancel', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  const userId = 1; // 对于测试用户，我们直接使用ID 1
  
  const orderId = req.params.id;
  // 从所有订单中查找匹配的订单
  const order = Array.from(orders.values()).find(order => order.id === orderId);
  
  if (!order) {
    return res.status(404).json({
      code: 404,
      message: '订单不存在'
    });
  }

  if (order.userId !== userId) {
    return res.status(403).json({
      code: 403,
      message: '无权取消此订单'
    });
  }
  
  if (order.status !== 'PENDING') {
    return res.status(400).json({
      code: 400,
      message: '只能取消待付款的订单'
    });
  }
  
  order.status = 'CANCELLED';
  order.updatedAt = new Date().toISOString();
  
  res.json({
    code: 0,
    data: order,
    message: '订单取消成功'
  });
});

// 套餐相关 API
app.get('/api/combinations', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const combinationList = Array.from(combinations.values());
  
  const start = (parseInt(page) - 1) * parseInt(limit);
  const end = start + parseInt(limit);
  const paginatedCombinations = combinationList.slice(start, end);

    res.json({
      code: 0,
      data: {
      list: paginatedCombinations,
      total: combinationList.length,
      page: parseInt(page),
      limit: parseInt(limit)
    },
    message: 'success'
  });
});

app.get('/api/combinations/hot', (req, res) => {
  const { limit = 4 } = req.query;
  const combinationList = Array.from(combinations.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, parseInt(limit));
  
    res.json({
      code: 0,
    data: combinationList,
    message: 'success'
  });
});

app.get('/api/combinations/:id', (req, res) => {
  const combination = combinations.get(parseInt(req.params.id));
  
  if (!combination) {
    return res.status(404).json({
      code: 404,
      message: 'Combination not found'
    });
  }
  
  res.json({
    code: 0,
    data: combination,
    message: 'success'
  });
});

// 用户行为相关 API
app.post('/api/user-behaviors', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  const userId = 1; // 对于测试用户，我们直接使用ID 1
  
  const { type, productId, combinationId } = req.body;
  
  const behavior = {
    id: Date.now(),
    userId,
    type,
    productId,
    combinationId,
    createdAt: new Date().toISOString()
  };
  
  const userBehaviorsList = userBehaviors.get(userId) || [];
  userBehaviorsList.push(behavior);
  userBehaviors.set(userId, userBehaviorsList);
  
  res.json({
    code: 0,
    data: behavior,
    message: 'success'
  });
});

app.get('/api/user-behaviors', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  const userId = 1; // 对于测试用户，我们直接使用ID 1
  
  const { page = 1, limit = 10, type } = req.query;
  const userBehaviorsList = userBehaviors.get(userId) || [];
  
  let filteredBehaviors = [...userBehaviorsList];
  if (type) {
    filteredBehaviors = filteredBehaviors.filter(behavior => behavior.type === type);
  }
  
  const start = (parseInt(page) - 1) * parseInt(limit);
  const end = start + parseInt(limit);
  const paginatedBehaviors = filteredBehaviors.slice(start, end);

  res.json({
    code: 0,
    data: {
      list: paginatedBehaviors,
      total: filteredBehaviors.length,
      page: parseInt(page),
      limit: parseInt(limit)
    },
    message: 'success'
  });
});

// 推荐算法相关函数
function calculateProductSimilarity(product1, product2) {
  let similarity = 0;
  
  // 基于类别的相似度
  if (product1.categoryId === product2.categoryId) {
    similarity += 0.3;
  }
  
  // 基于标签的相似度
  const commonTags = product1.tags.filter(tag => product2.tags.includes(tag));
  similarity += (commonTags.length / Math.max(product1.tags.length, product2.tags.length)) * 0.3;
  
  // 基于价格的相似度
  const priceDiff = Math.abs(product1.price - product2.price);
  const maxPrice = Math.max(product1.price, product2.price);
  similarity += (1 - priceDiff / maxPrice) * 0.2;
  
  // 基于评分的相似度
  similarity += (1 - Math.abs(product1.rating - product2.rating) / 5) * 0.2;
  
  return similarity;
}

// 计算时间衰减因子
function calculateTimeDecay(timestamp) {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const days = diff / (1000 * 60 * 60 * 24);
  return Math.exp(-days / 30); // 30天的半衰期
}

// 获取用户兴趣标签
function getUserInterestTags(userId) {
  const userBehaviorsList = Array.from(userBehaviors.entries())
    .filter(([_, behaviors]) => behaviors.some(b => b.userId === userId))
    .flatMap(([_, behaviors]) => behaviors);

  const tagCounts = new Map();
  userBehaviorsList.forEach(behavior => {
    if (behavior.productId) {
      const product = products.find(p => p.id === behavior.productId);
      if (product) {
        product.tags.forEach(tag => {
          const count = tagCounts.get(tag) || 0;
          tagCounts.set(tag, count + 1);
        });
      }
    }
  });

  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

// 获取商品组合推荐
function getCombinationRecommendations(userId, limit = 5) {
  const userBehaviorsList = Array.from(userBehaviors.entries())
    .filter(([_, behaviors]) => behaviors.some(b => b.userId === userId))
    .flatMap(([_, behaviors]) => behaviors);

  // 获取用户最近购买的商品类别
  const recentCategories = new Set(
    userBehaviorsList
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(behavior => {
        const product = products.find(p => p.id === behavior.productId);
        return product ? product.categoryId : null;
      })
      .filter(Boolean)
  );

  // 获取不同类别的热门商品
  const recommendations = [];
  recentCategories.forEach(categoryId => {
    const categoryProducts = products
      .filter(p => p.categoryId === categoryId)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 2);
    recommendations.push(...categoryProducts);
  });

  return recommendations.slice(0, limit);
}

function getRecommendations(userId, limit = 10) {
  // 获取用户行为数据
  const userBehaviorsList = Array.from(userBehaviors.entries())
    .filter(([_, behaviors]) => behaviors.some(b => b.userId === userId))
    .flatMap(([_, behaviors]) => behaviors);
  
  const userProductGraph = buildUserProductGraph(userBehaviorsList);
  const userProducts = userProductGraph.get(userId) || new Map();
  
  // 获取用户未购买的商品
  const candidateProducts = products.filter(product => !userProducts.has(product.id));
  
  // 获取用户兴趣标签
  const userInterestTags = getUserInterestTags(userId);
  
  // 计算推荐分数
  const recommendations = candidateProducts.map(product => {
    let score = 0;
    
    // 基于商品相似度的得分
    userProducts.forEach((weight, productId) => {
      const userProduct = products.find(p => p.id === productId);
      if (userProduct) {
        score += calculateProductSimilarity(product, userProduct) * weight;
      }
    });
    
    // 考虑商品的热度
    score += (product.sales / 1000) * 0.2;
    
    // 考虑商品的评分
    score += (product.rating / 5) * 0.2;
    
    // 考虑用户兴趣标签匹配度
    const matchingTags = product.tags.filter(tag => userInterestTags.includes(tag));
    score += (matchingTags.length / product.tags.length) * 0.3;
    
    // 添加随机因子，增加多样性
    score += Math.random() * 0.1;
    
    return {
      product,
      score
    };
  });
  
  // 按推荐分数排序
  const sortedRecommendations = recommendations.sort((a, b) => b.score - a.score);
  
  // 获取基于组合的推荐
  const combinationRecommendations = getCombinationRecommendations(userId);
  
  // 合并两种推荐结果
  const finalRecommendations = [
    ...sortedRecommendations.slice(0, limit - combinationRecommendations.length),
    ...combinationRecommendations
  ];
  
  // 打乱顺序以增加多样性
  return finalRecommendations
    .sort(() => Math.random() - 0.5)
    .slice(0, limit)
    .map(item => item.product || item);
}

// 推荐相关API
app.get('/api/recommendations', (req, res) => {
  const userId = parseInt(req.query.userId);
  const limit = parseInt(req.query.limit) || 10;
  
  if (!userId) {
    return res.status(400).json({
      code: 400,
      message: '用户ID不能为空'
    });
  }
  
  try {
    const recommendations = getRecommendations(userId, limit);
    res.json({
      code: 0,
      data: recommendations,
      message: '获取推荐商品成功'
    });
  } catch (error) {
    console.error('获取推荐商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取推荐商品失败'
    });
  }
});

// 基于用户行为的推荐
app.get('/api/recommendations/behavior', (req, res) => {
  const userId = parseInt(req.query.userId);
  const limit = parseInt(req.query.limit) || 10;
  
  if (!userId) {
    return res.status(400).json({
      code: 400,
      message: '用户ID不能为空'
    });
  }
  
  try {
    // 获取用户行为数据
    const userBehaviorsList = Array.from(userBehaviors.entries())
      .filter(([_, behaviors]) => behaviors.some(b => b.userId === userId))
      .flatMap(([_, behaviors]) => behaviors)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
    
    // 获取用户浏览过的商品类别
    const viewedCategories = new Set(
      userBehaviorsList
        .filter(behavior => behavior.productId)
        .map(behavior => {
          const product = products.find(p => p.id === behavior.productId);
          return product ? product.categoryId : null;
        })
        .filter(Boolean)
    );
    
    // 获取同类别的其他商品
    const categoryRecommendations = products
      .filter(product => 
        viewedCategories.has(product.categoryId) && 
        !userBehaviorsList.some(behavior => behavior.productId === product.id)
      )
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit / 2);
    
    // 获取基于用户兴趣标签的推荐
    const userInterestTags = getUserInterestTags(userId);
    const tagRecommendations = products
      .filter(product => 
        product.tags.some(tag => userInterestTags.includes(tag)) &&
        !userBehaviorsList.some(behavior => behavior.productId === product.id)
      )
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit / 2);
    
    // 合并推荐结果并打乱顺序
    const recommendations = [...categoryRecommendations, ...tagRecommendations]
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
    
    res.json({
      code: 0,
      data: recommendations,
      message: '获取行为推荐成功'
    });
  } catch (error) {
    console.error('获取行为推荐失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取行为推荐失败'
    });
  }
});

// 热门推荐
app.get('/api/recommendations/hot', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  try {
    // 获取不同类别的热门商品
    const categoryHotProducts = new Map();
    products.forEach(product => {
      if (!categoryHotProducts.has(product.categoryId)) {
        categoryHotProducts.set(product.categoryId, []);
      }
      categoryHotProducts.get(product.categoryId).push(product);
    });
    
    // 从每个类别选择最热门的商品
    const recommendations = Array.from(categoryHotProducts.values())
      .map(categoryProducts => 
        categoryProducts
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 2)
      )
      .flat()
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    res.json({
      code: 0,
      data: recommendations,
      message: '获取热门推荐成功'
    });
  } catch (error) {
    console.error('获取热门推荐失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取热门推荐失败'
    });
  }
});

// 订单统计相关 API
app.get('/api/user/order-stats', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  // 从token中提取用户ID（在这个mock实现中，我们假设token中包含用户ID）
  const userId = 1; // 对于测试用户，我们直接使用ID 1
  
  const userOrders = orders.get(userId) || [];
  
  // 计算订单统计信息
  const stats = {
    total: userOrders.length,
    pending: userOrders.filter(order => order.status === 'pending').length,
    paid: userOrders.filter(order => order.status === 'paid').length,
    shipped: userOrders.filter(order => order.status === 'shipped').length,
    completed: userOrders.filter(order => order.status === 'completed').length,
    cancelled: userOrders.filter(order => order.status === 'cancelled').length,
    refunded: userOrders.filter(order => order.status === 'refunded').length
  };
  
  res.json({
    code: 0,
    data: stats,
    message: 'success'
  });
});

app.get('/api/user/order-amount-stats', (req, res) => {
  res.json({
    code: 0,
    data: {
      total: 10000,
      pending: 2000,
      processing: 3000,
      shipped: 2000,
      delivered: 2000,
      cancelled: 500,
      refunded: 500
    },
    message: 'success'
  });
});

app.get('/api/user/order-product-stats', (req, res) => {
  res.json({
    code: 0,
    data: {
      total: 500,
      pending: 100,
      processing: 150,
      shipped: 100,
      delivered: 100,
      cancelled: 25,
      refunded: 25
    },
    message: 'success'
  });
});

app.get('/api/user/order-review-stats', (req, res) => {
  res.json({
    code: 0,
    data: {
      total: 200,
      rating: 4.5,
      good: 150,
      medium: 40,
      bad: 10
    },
    message: 'success'
  });
});

app.get('/api/user/order-refund-stats', (req, res) => {
  res.json({
    code: 0,
    data: {
      total: 50,
      pending: 10,
      approved: 20,
      rejected: 5,
      completed: 10,
      cancelled: 5
    },
    message: 'success'
  });
});

app.delete('/api/user/orders/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  const userId = 1; // 对于测试用户，我们直接使用ID 1
  
  const orderId = req.params.id;
  // 从所有订单中查找匹配的订单
  const order = Array.from(orders.values()).find(order => order.id === orderId);
  
  if (!order) {
    return res.status(404).json({
      code: 404,
      message: '订单不存在'
    });
  }

  if (order.userId !== userId) {
    return res.status(403).json({
      code: 403,
      message: '无权删除此订单'
    });
  }
  
  // 从 Map 中删除订单
  orders.delete(orderId);
  
  res.json({
    code: 0,
    message: '订单删除成功'
  });
});

// 系统提示词
const systemPrompt = `你是一位热情、懂生活的农产品电商导购助手，名字叫"小田"。你对各类有机、健康、绿色的农产品非常了解，尤其擅长为顾客推荐主打商品、组合搭配和衍生商品，帮助他们做出最合适的选择。

你的语言风格亲切自然、温暖，有时带点乡村风格的可爱口吻。你会根据用户提供的需求、喜好、预算、使用场景等信息，进行推荐，并适时引导他们探索更多优质产品。

你需要：
- 推荐时附带理由，比如口感、搭配、产地优势、适合人群等。
- 如果用户没有明确需求，也要主动提出引导性问题，例如："今天想来点清爽的水果解解暑吗？"或者"是想买来送人，还是自己享用呢？"
- 如果系统提供了商品信息，要学会利用商品的 name、description、price、tag 等字段进行自然推荐。
- 如果商品有优惠、组合装或赠品，也要一并告知。
- 使用表情符号（如"🍓""🛒"）让推荐更生动有趣，但不要太多。
- 遇到用户提出的问题，要简洁准确地回应，并引导回推荐流程。

请用"小田"的语气输出推荐话术。`

// AI聊天路由
app.post('/api/chat', async (req, res) => {
  try {
    console.log('收到聊天请求:', JSON.stringify(req.body, null, 2))
    const { message, history } = req.body
    if (!message) {
      return res.status(400).json({
        code: 400,
        message: '消息不能为空',
        data: null
      })
    }

    const apiKey = process.env.AI_ASSISTANT_API_KEY
    if (!apiKey) {
      console.error('AI助手API密钥未配置')
      return res.status(500).json({
        code: 500,
        message: 'AI助手服务未正确配置',
        data: null
      })
    }

    // 构建对话历史
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    console.log('发送到AI的请求:', JSON.stringify({ messages }, null, 2))

    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-max',
        input: { messages },
        parameters: {
          result_format: 'message',
          max_tokens: 1500,
          temperature: 0.7,
          top_p: 0.8,
          repetition_penalty: 1.1,
          stream: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-SSE': 'disable'
        },
        timeout: 30000 // 设置30秒超时
      }
    )

    console.log('AI响应:', JSON.stringify(response.data, null, 2))

    if (!response.data || !response.data.output || !response.data.output.choices || !response.data.output.choices[0]?.message?.content) {
      console.error('AI响应格式错误:', JSON.stringify(response.data, null, 2))
      return res.status(500).json({
        code: 500,
        message: 'AI响应格式错误',
        data: null
      })
    }

    const aiResponse = response.data.output.choices[0].message.content

    return res.json({
      code: 0,
      message: 'success',
      data: {
        message: aiResponse
      }
    })
  } catch (error) {
    console.error('AI聊天错误:', error)
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return res.status(500).json({
          code: 500,
          message: 'AI服务响应超时，请稍后重试',
          data: null
        })
      }
      if (error.response) {
        console.error('AI服务错误响应:', error.response.data)
        return res.status(error.response.status).json({
          code: error.response.status,
          message: error.response.data?.message || 'AI服务请求失败',
          data: null
        })
      }
      if (error.request) {
        console.error('AI服务请求失败:', error.request)
        return res.status(500).json({
          code: 500,
          message: '无法连接到AI服务，请检查网络连接',
          data: null
        })
      }
    }
    return res.status(500).json({
      code: 500,
      message: 'AI服务暂时不可用，请稍后重试',
      data: null
    })
  }
})

// 解析商品推荐
function parseProductRecommendations(response) {
  // 这里可以根据实际需求实现商品推荐解析逻辑
  return []
}

// 启动服务器
app.listen(port, () => {
  console.log(`Mock server is running at http://localhost:${port}`);
  console.log('Available API routes:');
  console.log('  GET /api/products');
  console.log('  GET /api/products/hot');
  console.log('  GET /api/categories');
  console.log('  GET /api/products/:id');
  console.log('  GET /api/products/:id/specs');
  console.log('  GET /api/products/:id/reviews');
  console.log('  GET /api/cart');
  console.log('  POST /api/cart');
  console.log('  PUT /api/cart/:productId');
  console.log('  DELETE /api/cart/:productId');
  console.log('  DELETE /api/cart');
  console.log('  GET /api/cart/count');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/logout');
  console.log('  POST /api/auth/register');
  console.log('  GET /api/auth/user');
  console.log('  GET /api/user/info');
  console.log('  PUT /api/user/info');
  console.log('  PUT /api/user/password');
  console.log('  GET /api/user/orders');
  console.log('  POST /api/user/orders');
  console.log('  GET /api/user/orders/:id');
  console.log('  POST /api/user/orders/:id/cancel');
  console.log('  GET /api/combinations');
  console.log('  GET /api/combinations/hot');
  console.log('  GET /api/combinations/:id');
  console.log('  POST /api/user-behaviors');
  console.log('  GET /api/user-behaviors');
  console.log('  GET /api/recommendations');
  console.log('  GET /api/recommendations/behavior');
  console.log('  GET /api/recommendations/hot');
  console.log('  GET /api/user/order-stats');
  console.log('  GET /api/user/order-amount-stats');
  console.log('  GET /api/user/order-product-stats');
  console.log('  GET /api/user/order-review-stats');
  console.log('  GET /api/user/order-refund-stats');
  console.log('  DELETE /api/user/orders/:id');
  console.log('  POST /api/chat');
}); 
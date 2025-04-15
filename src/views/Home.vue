<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Apple, Food, Bowl, IceCream, Coffee, Phone, Message, Location, ChatDotRound, Share, Service } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { getHotProducts } from '@/api/product'
import type { Product } from '@/types/product'
import { useUserStore } from '@/stores/user'

interface HotProduct extends Omit<Product, 'image'> {
  image: string;
}

const router = useRouter()
const userStore = useUserStore()
const searchQuery = ref('')
const currentSlide = ref(0)
let carouselInterval: number | null = null

const carouselItems = ref([
  {
    title: '新鲜水果',
    image: '/images/banner/fruits.jpg',
    description: '精选当季新鲜水果，产地直供',
    buttonText: '立即查看',
    link: '/products?category=fruits'
  },
  {
    title: '有机蔬菜',
    image: '/images/banner/vegetables.jpg',
    description: '无污染、无添加的绿色食品',
    buttonText: '查看详情',
    link: '/products?category=vegetables'
  },
  {
    title: '粮油调味',
    image: '/images/banner/ingredients.jpg',
    description: '优质粮油，健康调味',
    buttonText: '了解更多',
    link: '/products?category=ingredients'
  }
])

const handleBannerClick = (item: typeof carouselItems.value[0]) => {
  router.push(item.link)
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % carouselItems.value.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + carouselItems.value.length) % carouselItems.value.length
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

onMounted(() => {
  carouselInterval = window.setInterval(nextSlide, 3000)
  fetchHotProducts()
})

onUnmounted(() => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
  }
})

const handleSearch = () => {
  // 搜索功能实现
}

// 分类数据
const categories = ref([
  { id: 1, name: '新鲜水果', icon: 'Apple', iconColor: '#67C23A' },
  { id: 2, name: '有机蔬菜', icon: 'Food', iconColor: '#67C23A' },
  { id: 3, name: '农家土特产', icon: 'Food', iconColor: '#E6A23C' },
  { id: 4, name: '粮油调味', icon: 'Bowl', iconColor: '#409EFF' },
  { id: 5, name: '休闲零食', icon: 'IceCream', iconColor: '#F56C6C' },
  { id: 6, name: '茶酒饮品', icon: 'Coffee', iconColor: '#909399' }
])

// 热门商品数据
const hotProducts = ref<Product[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchHotProducts = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getHotProducts(8) // 获取8个热门商品
    if (response.code === 0 && response.data) {
      hotProducts.value = response.data
    } else {
      error.value = response.message || '获取热门商品失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取热门商品失败'
  } finally {
    loading.value = false
  }
}

// 组合搭配数据
const combinations = ref([
  {
    id: 1,
    title: '健康早餐组合',
    description: '营养均衡的早餐搭配',
    image: '/images/products/breakfast-combo.jpg',
    price: 99.9,
    originalPrice: 129.9,
    products: [
      { name: '有机燕麦片', quantity: '500g' },
      { name: '新鲜水果', quantity: '1kg' },
      { name: '纯牛奶', quantity: '1L' }
    ]
  },
  {
    id: 2,
    title: '家庭烹饪组合',
    description: '美味佳肴的食材搭配',
    image: '/images/products/cooking-combo.jpg',
    price: 159.9,
    originalPrice: 199.9,
    products: [
      { name: '新鲜蔬菜', quantity: '2kg' },
      { name: '精选肉类', quantity: '1kg' },
      { name: '调味料套装', quantity: '1套' }
    ]
  },
  {
    id: 3,
    title: '养生茶饮组合',
    description: '健康养生的茶饮搭配',
    image: '/images/products/tea-combo.jpg',
    price: 199.9,
    originalPrice: 259.9,
    products: [
      { name: '西湖龙井', quantity: '100g' },
      { name: '枸杞', quantity: '200g' },
      { name: '红枣', quantity: '500g' }
    ]
  }
])

// 处理分类点击
const handleCategoryClick = (category: any) => {
  router.push(`/products?category=${category.id}`)
}

// 处理商品点击
const handleProductClick = (product: any) => {
  router.push(`/products/${product.id}`)
}

// 处理图片加载错误
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = '/images/banner/default.jpg';
}
</script>

<template>
  <div class="home">
    <div class="content-wrapper">
      <!-- 用户信息 -->
      <div v-if="userStore.isLoggedIn" class="user-info">
        <h2>欢迎回来，{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</h2>
      </div>

      <!-- 侧边栏 -->
      <div class="sidebar">
        <div class="sidebar-section">
          <h3 class="sidebar-title">快速导航</h3>
          <ul class="sidebar-menu">
            <li v-for="category in categories" :key="category.id" @click="handleCategoryClick(category)">
              <el-icon :color="category.iconColor">
                <component :is="category.icon" />
              </el-icon>
              <span>{{ category.name }}</span>
            </li>
          </ul>
        </div>
        
        <div class="sidebar-section">
          <h3 class="sidebar-title">热门商品</h3>
          <ul class="sidebar-products">
            <li v-for="product in hotProducts.slice(0, 3)" :key="product.id" @click="handleProductClick(product)">
              <div class="product-thumbnail">
                <img :src="product.image" :alt="product.name" />
              </div>
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">¥{{ product.price }}</div>
              </div>
            </li>
          </ul>
        </div>
        
        <div class="sidebar-section">
          <h3 class="sidebar-title">联系我们</h3>
          <div class="contact-info">
            <p><el-icon><Phone /></el-icon> 400-123-4567</p>
            <p><el-icon><Message /></el-icon> service@example.com</p>
            <p><el-icon><Location /></el-icon> 北京市朝阳区xxx街道</p>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3 class="sidebar-title">关注我们</h3>
          <div class="social-links">
            <div class="social-icon wechat">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="social-icon weibo">
              <el-icon><Share /></el-icon>
            </div>
            <div class="social-icon qq">
              <el-icon><Service /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 主内容区域 -->
      <div class="main-content">
        <!-- Logo -->
        <div class="logo-container">
          <div class="logo">
            <div class="logo-icon">
              <div class="logo-circle"></div>
              <div class="logo-symbol"></div>
            </div>
            <div class="logo-text">
              <span class="brand-name">田园优选</span>
              <span class="brand-slogan">优质农产品直供平台</span>
            </div>
          </div>
        </div>
        
        <!-- 装饰元素 -->
        <div class="decorative-elements">
          <div class="decorative-shape shape-1"></div>
          <div class="decorative-shape shape-2"></div>
          <div class="decorative-dot dot-1"></div>
          <div class="decorative-dot dot-2"></div>
          <div class="decorative-dot dot-3"></div>
          <div class="decorative-line line-1"></div>
          <div class="decorative-line line-2"></div>
        </div>
        
        <!-- 自定义轮播图 -->
        <div class="custom-carousel">
          <div class="carousel-container">
            <div 
              v-for="(item, index) in carouselItems" 
              :key="item.title" 
              class="carousel-item"
              :class="{ active: index === currentSlide, prev: index === (currentSlide - 1 + carouselItems.length) % carouselItems.length, next: index === (currentSlide + 1) % carouselItems.length }"
            >
              <img :src="item.image" :alt="item.title" class="carousel-image" @error="handleImageError">
              <div class="carousel-content">
                <h3 class="carousel-title">{{ item.title }}</h3>
                <p class="carousel-description">{{ item.description }}</p>
                <el-button type="success" @click="handleBannerClick(item)">
                  {{ item.buttonText }}
                </el-button>
              </div>
            </div>
          </div>
          <div class="carousel-controls">
            <button class="carousel-control prev" @click="prevSlide">&lt;</button>
            <button class="carousel-control next" @click="nextSlide">&gt;</button>
          </div>
          <div class="carousel-indicators">
            <span 
              v-for="(item, index) in carouselItems" 
              :key="index" 
              class="indicator"
              :class="{ active: index === currentSlide }"
              @click="goToSlide(index)"
            ></span>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索商品"
            class="search-input"
          >
            <template #append>
              <el-button type="success" @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>

        <!-- 分类导航 -->
        <div class="categories">
          <h2 class="section-title">商品分类</h2>
          <el-row :gutter="20">
            <el-col :span="4" v-for="category in categories" :key="category.id">
              <div class="category-item" @click="handleCategoryClick(category)">
                <el-icon :size="32" :color="category.iconColor">
                  <component :is="category.icon" />
                </el-icon>
                <span>{{ category.name }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 热门商品 -->
        <div class="hot-products">
          <h2 class="section-title">热门商品</h2>
          <el-row :gutter="20">
            <el-col :span="6" v-for="product in hotProducts" :key="product.id">
              <div class="product-card" @click="handleProductClick(product)">
                <div class="product-image">
                  <img :src="product.image" :alt="product.name" />
                  <div class="hot-tag">热门</div>
                </div>
                <div class="product-info">
                  <h3>{{ product.name }}</h3>
                  <p class="description">{{ product.description }}</p>
                  <div class="price">¥{{ product.price }}</div>
                  <div class="sales">已售 {{ product.sales }} 件</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 组合搭配 -->
        <div class="combinations">
          <h2 class="section-title">组合搭配</h2>
          <el-row :gutter="20">
            <el-col :span="8" v-for="combo in combinations" :key="combo.id">
              <div class="combo-card">
                <div class="combo-image">
                  <img :src="combo.image" :alt="combo.title" />
                </div>
                <div class="combo-info">
                  <h3>{{ combo.title }}</h3>
                  <p class="description">{{ combo.description }}</p>
                  <div class="products-list">
                    <div v-for="(product, index) in combo.products" :key="index" class="product-item">
                      <span class="product-name">{{ product.name }}</span>
                      <span class="product-quantity">{{ product.quantity }}</span>
                    </div>
                  </div>
                  <div class="combo-price">
                    <span class="current-price">¥{{ combo.price }}</span>
                    <span class="original-price">¥{{ combo.originalPrice }}</span>
                  </div>
                  <el-button type="success" class="buy-button">立即购买</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  background-color: #f9fbf7;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  .content-wrapper {
    display: flex;
    gap: 20px;
    position: relative;
    max-width: 1360px; // 1400px - 2*20px padding
    margin: 0 auto;
  }

  // 侧边栏样式
  .sidebar {
    width: 250px;
    flex-shrink: 0;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
    height: fit-content;
    position: fixed;
    top: 80px;
    left: calc((100% - 1360px) / 2 + 20px); // 居中计算
    z-index: 10;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    
    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #67C23A;
      border-radius: 3px;
      
      &:hover {
        background: #95D475;
      }
    }
  }

  .sidebar-section {
    margin-bottom: 25px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .sidebar-title {
    font-size: 18px;
    color: #2c3e50;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e8f5e9;
    position: relative;
    z-index: 2;
    font-weight: bold;
    display: block;
    background-color: #fff;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 40px;
      height: 2px;
      background-color: #67C23A;
    }
  }

  .sidebar-menu {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      display: flex;
      align-items: center;
      padding: 12px 10px;
      cursor: pointer;
      transition: all 0.3s;
      border-radius: 6px;
      margin-bottom: 5px;
      position: relative;
      overflow: hidden;
      
      &:hover {
        background-color: #f0f9eb;
        padding-left: 15px;
        transform: translateX(5px);
        
        .el-icon {
          transform: scale(1.2);
        }
        
        &::after {
          width: 100%;
        }
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background-color: #67C23A;
        transition: width 0.3s ease;
      }
      
      .el-icon {
        margin-right: 12px;
        transition: transform 0.3s;
        font-size: 18px;
      }
      
      span {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
        transition: color 0.3s;
      }
      
      &:hover span {
        color: #67C23A;
      }
    }
  }

  .sidebar-products {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      display: flex;
      align-items: center;
      padding: 10px 0;
      cursor: pointer;
      transition: all 0.3s;
      border-bottom: 1px dashed #e8f5e9;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        transform: translateX(5px);
        
        .product-thumbnail img {
          transform: scale(1.1);
        }
      }
      
      .product-thumbnail {
        width: 50px;
        height: 50px;
        border-radius: 4px;
        overflow: hidden;
        margin-right: 10px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
      }
      
      .product-info {
        flex: 1;
        
        .product-name {
          font-size: 14px;
          color: #2c3e50;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .product-price {
          font-size: 14px;
          color: #67C23A;
          font-weight: bold;
        }
      }
    }
  }

  .contact-info {
    p {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      font-size: 14px;
      color: #606266;
      
      .el-icon {
        margin-right: 10px;
        color: #67C23A;
      }
    }
  }

  .social-links {
    display: flex;
    justify-content: space-around;
    
    .social-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-5px);
      }
      
      .el-icon {
        font-size: 20px;
        color: #fff;
      }
      
      &.wechat {
        background-color: #07C160;
      }
      
      &.weibo {
        background-color: #E6162D;
      }
      
      &.qq {
        background-color: #12B7F5;
      }
    }
  }

  // 主内容区域
  .main-content {
    flex: 1;
    min-width: 0; // 防止内容溢出
    margin-left: 270px; // 250px sidebar width + 20px gap
    max-width: calc(100% - 270px); // 确保主内容区域不会过宽
  }

  // Logo样式
  .logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    padding: 20px 0;
  }

  .logo {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
      
      .logo-symbol {
        animation: symbolPulse 1.5s infinite;
      }
    }
  }

  .logo-icon {
    position: relative;
    width: 70px;
    height: 70px;
    margin-right: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo-circle {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #67C23A, #95D475);
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
    z-index: 1;
  }

  .logo-symbol {
    position: absolute;
    width: 40px;
    height: 40px;
    z-index: 2;
    background-color: transparent;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      background-color: #fff;
      border-radius: 50%;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 10px;
      height: 10px;
      background-color: #fff;
      border-radius: 50%;
    }
  }

  .logo-text {
    display: flex;
    flex-direction: column;
  }

  .brand-name {
    font-size: 36px;
    font-weight: bold;
    background: linear-gradient(135deg, #67C23A, #95D475);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.2;
    letter-spacing: 2px;
  }

  .brand-slogan {
    font-size: 16px;
    color: #606266;
    margin-top: 6px;
    letter-spacing: 1px;
  }

  @keyframes symbolPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  // 装饰元素
  .decorative-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .decorative-shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.08;
  }

  .shape-1 {
    top: 5%;
    left: 5%;
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, #67C23A, #95D475);
    transform: rotate(15deg);
  }

  .shape-2 {
    top: 15%;
    left: 15%;
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #409EFF, #79bbff);
    transform: rotate(-15deg);
  }

  .decorative-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    opacity: 0.15;
  }

  .dot-1 {
    top: 10%;
    left: 5%;
    background-color: #67C23A;
  }

  .dot-2 {
    top: 30%;
    right: 8%;
    background-color: #409EFF;
  }

  .dot-3 {
    bottom: 15%;
    left: 12%;
    background-color: #E6A23C;
  }

  .decorative-line {
    position: absolute;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(103, 194, 58, 0.2), transparent);
  }

  .line-1 {
    top: 20%;
    left: 0;
    width: 100%;
  }

  .line-2 {
    bottom: 25%;
    left: 0;
    width: 100%;
  }

  .custom-carousel {
    position: relative;
    width: 100%;
    height: 400px;
    margin-bottom: 20px;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 10px;
      background: linear-gradient(transparent, rgba(103, 194, 58, 0.1));
      z-index: 1;
    }

    .carousel-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .carousel-item {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transform: scale(1.05);
      transition: all 0.5s ease-in-out;
      border-radius: 8px;
      overflow: hidden;

      &.active {
        opacity: 1;
        transform: scale(1);
        z-index: 1;
      }

      &.prev {
        transform: translateX(-100%);
      }

      &.next {
        transform: translateX(100%);
      }

      .carousel-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .carousel-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 20px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
        color: white;
        text-align: center;

        .carousel-title {
          font-size: 24px;
          margin-bottom: 10px;
        }

        .carousel-description {
          font-size: 16px;
          margin-bottom: 15px;
        }
      }
    }

    .carousel-controls {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;

      .carousel-control {
        background-color: rgba(103, 194, 58, 0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background-color: rgba(103, 194, 58, 0.9);
        }
      }
    }

    .carousel-indicators {
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      z-index: 2;
      display: flex;
      justify-content: center;
      gap: 10px;

      .indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.5);
        cursor: pointer;

        &.active {
          background-color: #67C23A;
        }
      }
    }
  }

  .search-box {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    z-index: 1;

    .search-input {
      width: 100%;
      border-radius: 30px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease-in-out;

      &::before {
        content: '';
        position: absolute;
        top: -5px;
        left: -5px;
        right: -5px;
        bottom: -5px;
        border: 1px solid rgba(103, 194, 58, 0.2);
        border-radius: 35px;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      &:focus-within::before {
        opacity: 1;
      }
    }
  }

  .section-title {
    font-size: 24px;
    color: #2c3e50;
    margin-bottom: 20px;
    text-align: center;
    position: relative;
    padding-bottom: 10px;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background-color: #67C23A;
      border-radius: 3px;
      transition: width 0.3s ease-in-out;
    }

    &::before {
      content: '';
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background-color: #67C23A;
      border-radius: 3px;
    }

    &:hover::after {
      width: 100px;
    }
  }

  .categories {
    margin: 40px 0;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    z-index: 1;

    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      padding: 16px;
      transition: all 0.3s;
      border-radius: 8px;
      background-color: #f9fbf7;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 2px;
        background-color: #67C23A;
        transition: width 0.3s ease;
      }
      
      &:hover::after {
        width: 50%;
      }

      .el-icon {
        animation: iconBounce 0.5s ease;
      }

      span {
        margin-top: 8px;
        font-size: 14px;
        color: #2c3e50;
      }
    }
  }

  .hot-products {
    margin: 40px 0;
    z-index: 1;

    .product-card {
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
      margin-bottom: 20px;
      cursor: pointer;
      border: 1px solid #e8f5e9;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #67C23A, #95D475);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      &:hover::before {
        opacity: 1;
      }

      &:hover {
        transform: translateY(-5px) scale(1.02) rotate(1deg);
        box-shadow: 0 4px 16px rgba(103, 194, 58, 0.2);
        border-color: #67C23A;

        .product-image img {
          transform: scale(1.1);
        }

        .hot-tag {
          animation: tagPulse 1s infinite;
        }
      }

      .product-image {
        position: relative;
        height: 200px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease-in-out;
        }

        .hot-tag {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 4px 8px;
          background-color: #67C23A;
          color: #fff;
          border-radius: 4px;
          font-size: 12px;
        }
      }

      .product-info {
        padding: 16px;

        h3 {
          margin: 0 0 8px;
          font-size: 16px;
          color: #2c3e50;
        }

        .description {
          color: #606266;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .price {
          color: #67C23A;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .sales {
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }

  .combinations {
    margin-top: 40px;
    z-index: 1;

    .combo-card {
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
      margin-bottom: 20px;
      border: 1px solid #e8f5e9;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #67C23A, #95D475);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      &:hover::before {
        opacity: 1;
      }

      &:hover {
        transform: translateY(-5px) scale(1.02) rotate(-1deg);
        box-shadow: 0 4px 16px rgba(103, 194, 58, 0.2);
        border-color: #67C23A;

        .combo-image img {
          transform: scale(1.1);
        }

        .buy-button {
          animation: buttonPulse 1s infinite;
        }
      }

      .combo-image {
        height: 200px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease-in-out;
        }
      }

      .combo-info {
        padding: 16px;

        h3 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #2c3e50;
        }

        .description {
          color: #606266;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .products-list {
          background-color: #f9fbf7;
          border-radius: 4px;
          padding: 12px;
          margin: 12px 0;

          .product-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
            color: #606266;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }

        .combo-price {
          margin: 12px 0;

          .current-price {
            font-size: 20px;
            color: #67C23A;
            font-weight: bold;
          }

          .original-price {
            font-size: 14px;
            color: #909399;
            text-decoration: line-through;
            margin-left: 8px;
          }
        }

        .buy-button {
          width: 100%;
        }
      }
    }
  }

  // 新增动画关键帧
  @keyframes iconBounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  @keyframes tagPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  @keyframes buttonPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  // 响应式调整
  @media (max-width: 1400px) {
    .sidebar {
      left: 20px; // 在小屏幕上固定在左侧
    }
  }

  @media (max-width: 768px) {
    .content-wrapper {
      flex-direction: column;
    }
    
    .sidebar {
      position: relative;
      width: 100%;
      left: 0;
      top: 0;
      margin-bottom: 20px;
    }
    
    .main-content {
      margin-left: 0;
      max-width: 100%;
    }
  }

  .user-info {
    margin-bottom: 20px;
    padding: 20px;
    background: var(--el-color-primary-light-9);
    border-radius: 8px;

    h2 {
      margin: 0;
      color: var(--el-text-color-primary);
      font-size: 20px;
    }
  }
}
</style> 
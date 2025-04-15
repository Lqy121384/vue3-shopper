<template>
  <div class="home-container">
    <!-- 轮播图 -->
    <el-carousel height="400px" class="banner">
      <el-carousel-item v-for="item in banners" :key="item.id">
        <img :src="item.image" :alt="item.title" class="banner-image" />
      </el-carousel-item>
    </el-carousel>

    <!-- 商品分类 -->
    <div class="categories">
      <h2>商品分类</h2>
      <el-row :gutter="20">
        <el-col :span="6" v-for="category in categories" :key="category.id">
          <el-card class="category-card" @click="handleCategoryClick(category)">
            <img :src="category.icon" :alt="category.name" class="category-icon" />
            <h3>{{ category.name }}</h3>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 热门商品 -->
    <div class="hot-products">
      <h2>热门商品</h2>
      <el-row :gutter="20">
        <el-col :span="6" v-for="product in hotProducts" :key="product.id">
          <el-card class="product-card" @click="handleProductClick(product)">
            <img :src="product.image" :alt="product.name" class="product-image" />
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p class="price">¥{{ product.price }}</p>
              <p class="description">{{ product.description }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- AI助手入口 -->
    <div class="ai-assistant">
      <el-card class="ai-card" @click="handleAIClick">
        <div class="ai-content">
          <el-icon class="ai-icon"><ChatDotRound /></el-icon>
          <div class="ai-text">
            <h3>智能助手</h3>
            <p>为您推荐最适合的农产品</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChatDotRound } from '@element-plus/icons-vue'

const router = useRouter()

// 模拟数据
const banners = ref([
  { id: 1, image: '/banner1.jpg', title: '新鲜水果' },
  { id: 2, image: '/banner2.jpg', title: '时令蔬菜' },
  { id: 3, image: '/banner3.jpg', title: '优质粮油' }
])

const categories = ref([
  { id: 1, name: '水果', icon: '/fruit.png' },
  { id: 2, name: '蔬菜', icon: '/vegetable.png' },
  { id: 3, name: '粮油', icon: '/grain.png' },
  { id: 4, name: '茶叶', icon: '/tea.png' }
])

const hotProducts = ref([
  {
    id: 1,
    name: '红富士苹果',
    price: 29.9,
    description: '新鲜采摘，甜脆可口',
    image: '/apple.jpg'
  },
  {
    id: 2,
    name: '有机生菜',
    price: 15.8,
    description: '无农药，健康美味',
    image: '/lettuce.jpg'
  },
  {
    id: 3,
    name: '五常大米',
    price: 89.9,
    description: '东北黑土地种植',
    image: '/rice.jpg'
  },
  {
    id: 4,
    name: '西湖龙井',
    price: 299,
    description: '明前采摘，清香持久',
    image: '/tea.jpg'
  }
])

const handleCategoryClick = (category: any) => {
  router.push({
    path: '/products',
    query: { category: category.id }
  })
}

const handleProductClick = (product: any) => {
  router.push(`/product/${product.id}`)
}

const handleAIClick = () => {
  router.push('/ai-assistant')
}
</script>

<style scoped lang="scss">
.home-container {
  padding: 20px;

  .banner {
    margin-bottom: 40px;
    border-radius: 8px;
    overflow: hidden;

    .banner-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .categories {
    margin-bottom: 40px;

    h2 {
      margin-bottom: 20px;
    }

    .category-card {
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .category-icon {
        width: 60px;
        height: 60px;
        margin-bottom: 10px;
      }

      h3 {
        margin: 0;
        text-align: center;
      }
    }
  }

  .hot-products {
    margin-bottom: 40px;

    h2 {
      margin-bottom: 20px;
    }

    .product-card {
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .product-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }

      .product-info {
        padding: 10px;

        h3 {
          margin: 0 0 10px;
        }

        .price {
          color: #f56c6c;
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 10px;
        }

        .description {
          color: #666;
          margin: 0;
          font-size: 14px;
        }
      }
    }
  }

  .ai-assistant {
    .ai-card {
      cursor: pointer;
      background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
      color: white;

      .ai-content {
        display: flex;
        align-items: center;
        padding: 20px;

        .ai-icon {
          font-size: 48px;
          margin-right: 20px;
        }

        .ai-text {
          h3 {
            margin: 0 0 10px;
            font-size: 24px;
          }

          p {
            margin: 0;
            font-size: 16px;
            opacity: 0.8;
          }
        }
      }
    }
  }
}
</style> 
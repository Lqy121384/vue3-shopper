<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, Apple, Food, Picture } from '@element-plus/icons-vue'
import { getProductList, type Product, type ProductListResponse } from '@/api/product'
import { ElMessage } from 'element-plus'
import { ApiCode } from '@/types/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const products = ref<Product[]>([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(8)

const carouselItems = [
  {
    icon: 'ShoppingCart',
    title: '新鲜蔬果',
    description: '精选当季新鲜水果和蔬菜',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=400&q=80'
  },
  {
    icon: 'Apple',
    title: '有机农产品',
    description: '无污染、无添加的绿色食品',
    image: 'https://images.unsplash.com/photo-1557844352-761f2565b576?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=400&q=80'
  },
  {
    icon: 'Food',
    title: '地方特产',
    description: '各地特色农产品，品质保证',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=400&q=80'
  }
]

const handleProductClick = (product: Product) => {
  router.push(`/products/${product.id}`)
}

const handleSizeChange = async (val: number) => {
  pageSize.value = val
  await fetchProducts()
}

const handleCurrentChange = async (val: number) => {
  currentPage.value = val
  await fetchProducts()
}

const getImageUrl = (product: Product) => {
  // 首先检查 images 数组
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    // 检查是否是 base64 或完整 URL
    if (firstImage.startsWith('data:') || firstImage.startsWith('http')) {
      return firstImage;
    }
    // 确保相对路径以 / 开头
    return firstImage.startsWith('/') ? firstImage : `/${firstImage}`;
  }

  // 如果没有 images 数组，回退到 image 属性
  if (product.image) {
    // 检查是否是 base64 或完整 URL
    if (product.image.startsWith('data:') || product.image.startsWith('http')) {
      return product.image;
    }
    // 确保相对路径以 / 开头
    return product.image.startsWith('/') ? product.image : `/${product.image}`;
  }

  // 如果既没有 images 也没有 image，返回默认图片
  return '/images/products/default-product.jpg';
};

const fetchProducts = async () => {
  try {
    loading.value = true
    const response = await getProductList({
      page: currentPage.value,
      limit: pageSize.value
    })
    products.value = response.data.data.items
    total.value = response.data.data.total
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="home">
    <!-- 用户信息 -->
    <div v-if="userStore.isLoggedIn" class="user-info">
      <h2>欢迎回来，{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</h2>
    </div>

    <!-- 轮播图 -->
    <el-carousel :interval="4000" type="card" height="400px" class="carousel">
      <el-carousel-item v-for="item in carouselItems" :key="item.title" class="carousel-item">
        <el-icon :size="64"><component :is="item.icon" /></el-icon>
        <h3 class="carousel-title">{{ item.title }}</h3>
        <p class="carousel-description">{{ item.description }}</p>
      </el-carousel-item>
    </el-carousel>

    <!-- 产品展示 -->
    <div class="products-section">
      <h2 class="section-title">精选农产品</h2>
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="!products || products.length === 0" class="empty-container">
        <el-empty description="暂无商品" />
      </div>
      <template v-else>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in products" :key="product.id">
            <el-card class="product-card" @click="handleProductClick(product)" shadow="hover">
              <div class="image-container">
                <el-image 
                  :src="getImageUrl(product)" 
                  :alt="product.name" 
                  class="product-image"
                  fit="cover"
                >
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon :size="32"><Picture /></el-icon>
                      <p>暂无图片</p>
                    </div>
                  </template>
                </el-image>
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-footer">
                  <div class="product-meta">
                    <span class="price">¥{{ product.price.toFixed(2) }}</span>
                    <span class="sales">销量: {{ product.sales }}</span>
                  </div>
                  <el-button type="primary" size="small">查看详情</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <div v-if="products.length > 0" class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[8, 12, 24, 36]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home {
  padding: 20px;

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

  .carousel {
    margin-bottom: 40px;

    .carousel-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--el-color-primary-light-9);
      border-radius: 8px;
      padding: 20px;

      .el-icon {
        color: var(--el-color-primary);
        margin-bottom: 20px;
      }

      .carousel-title {
        font-size: 24px;
        color: var(--el-text-color-primary);
        margin: 0 0 10px;
      }

      .carousel-description {
        font-size: 16px;
        color: var(--el-text-color-secondary);
        text-align: center;
      }
    }
  }

  .products-section {
    .section-title {
      font-size: 28px;
      color: var(--el-text-color-primary);
      margin-bottom: 30px;
      text-align: center;
    }

    .product-card {
      margin-bottom: 20px;
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .image-container {
        height: 200px;
        overflow: hidden;

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--el-fill-color-lighter);
          color: var(--el-text-color-secondary);
        }
      }

      .product-info {
        padding: 15px;

        .product-name {
          font-size: 18px;
          margin: 0 0 10px;
          color: var(--el-text-color-primary);
        }

        .product-description {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin-bottom: 15px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .product-meta {
            display: flex;
            flex-direction: column;
            gap: 5px;

            .price {
              font-size: 20px;
              color: var(--el-color-danger);
              font-weight: bold;
            }

            .sales {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }

    .pagination {
      margin-top: 30px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>

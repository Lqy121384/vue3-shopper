<template>
  <div class="product-detail-container">
    <div class="product-main">
      <!-- 左侧图片区域 -->
      <div class="product-gallery">
        <div class="main-image">
          <el-carousel
            trigger="click"
            height="500px"
            indicator-position="outside"
            :interval="4000"
            arrow="always"
          >
            <el-carousel-item v-for="image in product.images" :key="image">
              <div class="image-wrapper">
                <img :src="image" :alt="product.name" class="gallery-image" />
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
        
        <div class="thumbnail-list">
          <div 
            v-for="(image, index) in product.images" 
            :key="index"
            class="thumbnail"
            :class="{ active: index === 0 }"
          >
            <img :src="image" :alt="`${product.name}-${index}`" />
          </div>
        </div>
      </div>
      
      <!-- 右侧信息区域 -->
      <div class="product-info">
        <div class="product-header">
          <div class="product-title">
            <h1>{{ product.name }}</h1>
            <div class="product-tags">
              <el-tag
                v-for="tag in product.tags"
                :key="tag"
                size="small"
                effect="plain"
                class="tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
          
          <div class="product-rating">
            <el-rate
              v-model="product.rating"
              disabled
              show-score
              text-color="#ff9900"
            />
            <span class="review-count">({{ product.reviews }}条评价)</span>
            <span class="sales-count">销量: {{ product.sales }}</span>
          </div>
        </div>
        
        <div class="product-price">
          <div class="current-price">
            <span class="price-label">价格</span>
            <span class="price-value">¥{{ product.price }}</span>
            <span v-if="product.originalPrice" class="original-price">
              ¥{{ product.originalPrice }}
            </span>
          </div>
        </div>
        
        <div class="product-specs">
          <h3 class="specs-title">商品规格</h3>
          <div class="specs-content">
            <template v-if="product.specifications && Object.keys(product.specifications).length > 0">
              <div 
                v-for="(value, name) in product.specifications" 
                :key="name"
                class="spec-item"
              >
                <span class="spec-name">{{ name }}：</span>
                <span class="spec-value">{{ value }}</span>
              </div>
            </template>
            <div v-else class="no-specs">暂无规格信息</div>
          </div>
        </div>
        
        <div class="product-quantity">
          <span class="quantity-label">数量</span>
          <el-input-number
            v-model="quantity"
            :min="1"
            :max="product.stock"
            size="large"
            controls-position="right"
          />
          <span class="stock-info">库存: {{ product.stock }}件</span>
        </div>
        
        <div class="product-actions">
          <el-button
            type="primary"
            size="large"
            class="add-to-cart-btn"
            @click="handleAddToCart"
          >
            <el-icon><ShoppingCart /></el-icon>
            加入购物车
          </el-button>
          <el-button
            type="danger"
            size="large"
            class="buy-now-btn"
            @click="handleBuyNow"
          >
            <el-icon><ShoppingBag /></el-icon>
            立即购买
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 商品详情和评价 -->
    <div class="product-tabs">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="商品详情" name="detail">
          <div class="detail-content" v-html="product.description"></div>
        </el-tab-pane>
        <el-tab-pane label="商品评价" name="reviews">
          <div class="reviews-container">
            <div class="reviews-summary">
              <div class="rating-overview">
                <div class="rating-score">
                  <div class="score-value">{{ product.rating }}</div>
                  <el-rate
                    v-model="product.rating"
                    disabled
                    show-score
                    text-color="#ff9900"
                  />
                  <div class="total-reviews">{{ totalReviews }}条评价</div>
                </div>
                <div class="rating-distribution">
                  <div
                    v-for="(count, rating) in ratingDistribution"
                    :key="rating"
                    class="rating-bar-item"
                  >
                    <span class="rating-label">{{ rating }}星</span>
                    <el-progress
                      :percentage="calculateRatingPercentage(count)"
                      :show-text="false"
                      :stroke-width="8"
                      :color="getRatingColor(Number(rating))"
                    />
                    <span class="rating-count">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="reviews-list">
              <div
                v-for="review in reviews"
                :key="review.id"
                class="review-card"
              >
                <div class="review-header">
                  <el-avatar :src="review.userAvatar" :size="40" />
                  <div class="review-user">
                    <span class="user-name">{{ review.userName }}</span>
                    <el-rate
                      v-model="review.rating"
                      disabled
                      size="small"
                    />
                  </div>
                  <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                </div>
                <div class="review-body">
                  <p class="review-text">{{ review.content }}</p>
                  <div v-if="review.images" class="review-images">
                    <el-image
                      v-for="image in review.images"
                      :key="image"
                      :src="image"
                      :preview-src-list="review.images"
                      fit="cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div class="reviews-pagination">
              <el-pagination
                v-model:current-page="reviewPage"
                :page-size="10"
                :total="totalReviews"
                layout="prev, pager, next"
                @current-change="handleReviewPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, ShoppingBag } from '@element-plus/icons-vue'
import type { ProductReview } from '@/types/product'
import type { Product } from '@/api/product'
import { getProductDetail, getProductSpecs, getProductReviews } from '@/api/product'

const route = useRoute()
const router = useRouter()

const activeTab = ref('detail')
const quantity = ref(1)
const reviewPage = ref(1)
const totalReviews = ref(0)

const mockProduct: Product = {
  id: '1',
  name: '有机苹果',
  description: '新鲜采摘的有机苹果',
  price: 149.99,
  image: 'https://example.com/apple.jpg',
  images: ['https://example.com/apple.jpg'],
  categoryId: '1',
  category: {
    id: '1',
    name: '水果',
    level: 1,
    sort: 1,
    icon: 'fruit-icon',
    status: 'active'
  },
  stock: 100,
  sales: 50,
  rating: 4.8,
  reviews: [],
  tags: ['有机', '新鲜'],
  specifications: {
    '重量': '500g',
    '产地': '陕西'
  },
  isOnSale: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const product = ref<Product>(mockProduct)

const mockReviews: ProductReview[] = [
  {
    id: '1',
    userId: '1',
    productId: '1',
    orderId: '1',
    userName: '张三',
    userAvatar: '/images/avatars/user1.jpg',
    rating: 5,
    content: '苹果非常新鲜，口感很好',
    images: ['/images/reviews/apple1.jpg'],
    createdAt: new Date('2024-02-01T00:00:00Z'),
    updatedAt: new Date('2024-02-01T00:00:00Z')
  }
]

// 评分分布
const ratingDistribution = computed(() => ({
  '5': 80,
  '4': 30,
  '3': 10,
  '2': 5,
  '1': 3
}))

// 商品评价列表
const reviews = ref<ProductReview[]>([
  {
    id: '1',
    userId: '1',
    productId: '1',
    orderId: '1',
    userName: '张三',
    userAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    rating: 5,
    content: '非常新鲜，口感很好！',
    images: ['https://example.com/review1.jpg'],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  }
])

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    const id = route.params.id as string
    const response = await getProductDetail(id)
    if (response.data) {
      // 获取商品规格
      const specsResponse = await getProductSpecs(id)
      const specs = specsResponse.data || {
        '重量': '500g',
        '产地': '陕西',
        '保质期': '7天',
        '储存方式': '冷藏',
        '包装方式': '盒装'
      }
      
      product.value = {
        ...response.data,
        specifications: specs
      }
      
      // 获取商品评价
      const reviewsResponse = await getProductReviews(id, { page: 1, pageSize: 10 })
      if (reviewsResponse.data) {
        reviews.value = reviewsResponse.data.list || []
        totalReviews.value = reviewsResponse.data.total || 0
      }
    }
  } catch (error) {
    ElMessage.error('获取商品详情失败')
    console.error('获取商品详情失败:', error)
  }
}

// 获取评价列表
const fetchReviews = async () => {
  try {
    const id = route.params.id as string
    const response = await getProductReviews(id, { 
      page: reviewPage.value, 
      pageSize: 10 
    })
    if (response.data) {
      reviews.value = response.data.list || []
      totalReviews.value = response.data.total || 0
    }
  } catch (error) {
    ElMessage.error('获取评价失败')
    console.error('获取评价失败:', error)
  }
}

// 处理加入购物车
const handleAddToCart = () => {
  // 这里应该调用实际的API
  ElMessage.success('已添加到购物车')
}

// 处理立即购买
const handleBuyNow = () => {
  router.push({
    path: '/order/confirm',
    query: {
      productId: product.value.id,
      quantity: quantity.value
    }
  })
}

// 处理评价分页
const handleReviewPageChange = (page: number) => {
  reviewPage.value = page
  fetchReviews()
}

// 处理评分分布计算
const calculateRatingPercentage = (count: number) => {
  if (!product.value?.reviews?.length) return 0
  return (count / product.value.reviews.length) * 100
}

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取评分颜色
const getRatingColor = (rating: number) => {
  const colors = {
    5: '#67C23A',
    4: '#67C23A',
    3: '#E6A23C',
    2: '#F56C6C',
    1: '#F56C6C'
  }
  return colors[rating as keyof typeof colors] || '#909399'
}

onMounted(() => {
  fetchProductDetail()
  fetchReviews()
})
</script>

<style scoped lang="scss">
.product-detail-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  
  .product-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
    background: #fff;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  
  .product-gallery {
    .main-image {
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 1rem;
      background: #f8f9fa;
      
      .image-wrapper {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      
      .gallery-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        transition: transform 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
        }
      }
      
      :deep(.el-carousel__arrow) {
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.5);
        }
      }
    }
    
    .thumbnail-list {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      
      .thumbnail {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.3s ease;
        
        &.active {
          border-color: #409eff;
        }
        
        &:hover {
          transform: translateY(-2px);
        }
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
  
  .product-info {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    
    .product-header {
      .product-title {
        h1 {
          font-size: 2rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }
        
        .product-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          
          .tag {
            border-radius: 4px;
            padding: 0 0.75rem;
            height: 24px;
            line-height: 22px;
          }
        }
      }
      
      .product-rating {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
        
        .review-count, .sales-count {
          color: #666;
          font-size: 0.9rem;
        }
      }
    }
    
    .product-price {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      
      .current-price {
        display: flex;
        align-items: baseline;
        gap: 1rem;
        
        .price-label {
          font-size: 1.1rem;
          color: #666;
        }
        
        .price-value {
          font-size: 2.5rem;
          color: #ff6b6b;
          font-weight: 600;
        }
        
        .original-price {
          font-size: 1.1rem;
          color: #999;
          text-decoration: line-through;
        }
      }
    }
    
    .product-specs {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #eee;
      margin: 1.5rem 0;
      
      .specs-title {
        font-size: 1.2rem;
        margin: 0 0 1.5rem 0;
        color: #2c3e50;
        font-weight: 600;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #409eff;
      }
      
      .specs-content {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        
        .spec-item {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          }
          
          .spec-name {
            color: #666;
            margin-right: 0.5rem;
            font-weight: 500;
          }
          
          .spec-value {
            color: #2c3e50;
            font-weight: 500;
          }
        }
        
        .no-specs {
          color: #999;
          font-style: italic;
          text-align: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
      }
    }
    
    .product-quantity {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      .quantity-label {
        font-size: 1.1rem;
        color: #2c3e50;
        font-weight: 500;
      }
      
      :deep(.el-input-number) {
        width: 160px;
      }
      
      .stock-info {
        color: #666;
        font-size: 0.9rem;
      }
    }
    
    .product-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      
      .el-button {
        flex: 1;
        height: 48px;
        font-size: 1.1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        
        .el-icon {
          font-size: 1.2rem;
        }
        
        &.add-to-cart-btn {
          background: #409eff;
          border-color: #409eff;
          
          &:hover {
            background: #66b1ff;
            border-color: #66b1ff;
            transform: translateY(-2px);
          }
        }
        
        &.buy-now-btn {
          background: #ff6b6b;
          border-color: #ff6b6b;
          
          &:hover {
            background: #ff8585;
            border-color: #ff8585;
            transform: translateY(-2px);
          }
        }
      }
    }
  }
  
  .product-tabs {
    background: #fff;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    
    :deep(.detail-tabs) {
      .el-tabs__nav-wrap::after {
        display: none;
      }
      
      .el-tabs__item {
        font-size: 1.1rem;
        padding: 0 2rem;
        height: 48px;
        line-height: 48px;
        
        &.is-active {
          color: #409eff;
          font-weight: 600;
        }
      }
    }
    
    .detail-content {
      padding: 2rem 1rem;
      color: #666;
      line-height: 1.8;
    }
    
    .reviews-container {
      .reviews-summary {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        
        .rating-overview {
          display: flex;
          gap: 3rem;
          
          .rating-score {
            text-align: center;
            padding-right: 2rem;
            border-right: 1px solid #eee;
            
            .score-value {
              font-size: 3.5rem;
              font-weight: 600;
              color: #ff9900;
              line-height: 1;
              margin-bottom: 0.5rem;
            }
            
            .total-reviews {
              color: #666;
              margin-top: 0.5rem;
            }
          }
          
          .rating-distribution {
            flex: 1;
            
            .rating-bar-item {
              display: flex;
              align-items: center;
              gap: 1rem;
              margin-bottom: 0.75rem;
              
              .rating-label {
                width: 40px;
                color: #2c3e50;
                font-weight: 500;
              }
              
              :deep(.el-progress) {
                flex: 1;
              }
              
              .rating-count {
                width: 40px;
                text-align: right;
                color: #666;
              }
            }
          }
        }
      }
      
      .reviews-list {
        .review-card {
          padding: 1.5rem;
          border-radius: 12px;
          background: #f8f9fa;
          margin-bottom: 1.5rem;
          
          .review-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
            
            .review-user {
              flex: 1;
              
              .user-name {
                display: block;
                font-weight: 500;
                color: #2c3e50;
                margin-bottom: 0.25rem;
              }
            }
            
            .review-date {
              color: #999;
              font-size: 0.9rem;
            }
          }
          
          .review-body {
            .review-text {
              color: #666;
              line-height: 1.8;
              margin: 0 0 1rem 0;
            }
            
            .review-images {
              display: flex;
              gap: 0.75rem;
              margin-top: 1rem;
              
              :deep(.el-image) {
                width: 100px;
                height: 100px;
                border-radius: 8px;
                overflow: hidden;
                transition: transform 0.3s ease;
                
                &:hover {
                  transform: scale(1.05);
                }
              }
            }
          }
        }
      }
      
      .reviews-pagination {
        display: flex;
        justify-content: center;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #eee;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .product-detail-container {
    .product-main {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .product-info {
      .product-specs {
        .specs-content {
          grid-template-columns: 1fr;
        }
      }
    }
    
    .reviews-container {
      .reviews-summary {
        .rating-overview {
          flex-direction: column;
          gap: 2rem;
          
          .rating-score {
            padding-right: 0;
            padding-bottom: 2rem;
            border-right: none;
            border-bottom: 1px solid #eee;
          }
        }
      }
    }
  }
}
</style> 
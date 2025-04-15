<template>
  <div class="product-detail" v-loading="loading">
    <el-empty v-if="!loading && !product" description="商品不存在" />
    <template v-else-if="product">
      <!-- 商品基本信息 -->
      <div class="product-info">
        <div class="product-gallery">
          <el-carousel height="400px">
            <el-carousel-item v-for="(image, index) in product.images" :key="index">
              <img :src="image" :alt="product.name" class="product-image" @error="handleImageError" />
            </el-carousel-item>
          </el-carousel>
        </div>

        <div class="product-content">
          <h1 class="product-name">{{ product.name }}</h1>
          <div class="product-price">
            <span class="current-price">¥{{ product.price }}</span>
            <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
          </div>
          <div class="product-meta">
            <span class="sales">销量: {{ product.sales }}</span>
            <el-rate v-model="product.rating" disabled />
          </div>

          <!-- 商品规格选择 -->
          <div class="product-specs" v-if="specs.length > 0">
            <div v-for="spec in specs" :key="spec.id" class="spec-group">
              <div class="spec-name">{{ spec.name }}</div>
              <div class="spec-values">
                <el-radio-group v-model="selectedSpecs[spec.id]">
                  <el-radio-button
                    v-for="value in spec.values"
                    :key="value"
                    :label="value"
                  >
                    {{ value }}
                  </el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </div>

          <!-- 商品数量选择 -->
          <div class="product-quantity">
            <span class="label">数量:</span>
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="product.stock"
              :disabled="product.stock === 0"
            />
          </div>

          <!-- 商品操作按钮 -->
          <div class="product-actions">
            <el-button
              type="primary"
              size="large"
              :disabled="product.stock === 0"
              @click="handleAddToCart"
            >
              加入购物车
            </el-button>
            <el-button
              type="danger"
              size="large"
              :disabled="product.stock === 0"
              @click="handleBuyNow"
            >
              立即购买
            </el-button>
          </div>
        </div>
      </div>

      <!-- 商品详情 -->
      <div class="product-detail-section">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="detail-content" v-html="product.description"></div>
          </el-tab-pane>
          <el-tab-pane label="商品评价" name="reviews">
            <div class="reviews-section">
              <div class="reviews-summary">
                <div class="rating-overview">
                  <div class="average-rating">
                    <span class="rating-number">{{ product.rating }}</span>
                    <el-rate v-model="product.rating" disabled />
                  </div>
                  <div class="rating-stats">
                    <div v-for="i in 5" :key="i" class="rating-bar">
                      <span class="star">{{ 6 - i }}星</span>
                      <el-progress
                        :percentage="getRatingPercentage(6 - i)"
                        :show-text="false"
                      />
                      <span class="count">{{ getRatingCount(6 - i) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="reviews-list">
                <div v-for="review in reviews" :key="review.id" class="review-item">
                  <div class="review-header">
                    <el-avatar :src="review.userAvatar" />
                    <div class="review-info">
                      <div class="review-user">{{ review.userName }}</div>
                      <div class="review-time">{{ formatDate(review.createdAt) }}</div>
                    </div>
                  </div>
                  <div class="review-content">
                    <el-rate v-model="review.rating" disabled />
                    <div class="review-text">{{ review.content }}</div>
                    <div class="review-images" v-if="review.images?.length">
                      <el-image
                        v-for="(image, index) in review.images"
                        :key="index"
                        :src="image"
                        :preview-src-list="review.images"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="reviews-pagination">
                <el-pagination
                  v-model:current-page="reviewPage"
                  v-model:page-size="reviewPageSize"
                  :total="reviewTotal"
                  :page-sizes="[5, 10, 20, 50]"
                  layout="total, sizes, prev, pager, next"
                  @size-change="handleReviewSizeChange"
                  @current-change="handleReviewCurrentChange"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 相关推荐 -->
      <div v-if="relatedProducts.length > 0" class="related-products">
        <h2 class="section-title">相关推荐</h2>
        <div class="product-grid">
          <div
            v-for="product in relatedProducts"
            :key="product.id"
            class="product-card"
            @click="handleProductClick(product.id)"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name">
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-price">
                <span class="current-price">¥{{ product.price }}</span>
                <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
              </div>
              <div class="product-meta">
                <span class="sales">销量: {{ product.sales }}</span>
                <span class="rating">评分: {{ product.rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Product, ProductSpec, ProductReview, ProductRecommend, ProductReviewListResponse, ProductListResponse } from '@/types/product'
import type { ApiResponse, ListResponse } from '@/types/api'
import { getProductDetail, getProductSpecs, getProductReviews, getProducts } from '@/api/product'
import { getRecommendations, getPopularInCategory, getUserBasedCF, getItemBasedCF, getSimilarProducts } from '@/services/recommendation'
import { addToCart } from '@/api/cart'
import { createOrder } from '@/api/order'
import type { CartItem } from '@/types/cart'
import { recordUserBehavior } from '@/services/userBehavior'
import type { BehaviorType } from '@/services/userBehavior'
import { formatDate as formatDateUtil } from '@/utils/format'
import { useUserStore } from '@/stores/user'

defineOptions({
  name: 'ProductDetailPage'
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 状态定义
const loading = ref(false)
const product = ref<Product | null>(null)
const specs = ref<ProductSpec[]>([])
const selectedSpecs = ref<Record<string, string>>({})
const quantity = ref(1)
const activeTab = ref('detail')
const reviews = ref<ProductReview[]>([])
const reviewPage = ref(1)
const reviewPageSize = ref(10)
const reviewTotal = ref(0)
const relatedProducts = ref<Product[]>([])

// 默认图片URL - 使用在线图片服务
const defaultImageUrl = 'https://dummyimage.com/400x400/f0f0f0/999999.png&text=暂无图片'

// 页面加载时间
const pageLoadTime = ref(Date.now())

// 生成会话ID
const generateSessionId = () => {
  return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// 获取或创建会话ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// 记录用户行为
const handleProductInteraction = (type: BehaviorType) => {
  if (product.value) {
    recordUserBehavior({
      type,
      targetId: product.value.id,
      targetType: 'product'
    })
  }
}

// 记录页面浏览时长
const recordPageViewDuration = () => {
  if (product.value) {
    const duration = Math.floor((Date.now() - pageLoadTime.value) / 1000)
    recordUserBehavior({
      userId: '1', // 假设当前用户ID为1
      productId: product.value.id,
      type: 'view',
      duration
    })
  }
}

// 处理图片URL
const processImageUrl = (image: string | null | undefined): string => {
  if (!image) return defaultImageUrl
  if (image.startsWith('http')) return image
  if (image.startsWith('data:')) return image
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  return `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`
}

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    loading.value = true
    const productId = route.params.id as string
    const response = await getProductDetail(productId)
    if (response?.code === 0 && response.data) {
      product.value = response.data as unknown as Product
    } else {
      ElMessage.error(response?.message || '商品不存在')
      product.value = null
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
    product.value = null
  } finally {
    loading.value = false
  }
}

// 获取商品规格
const fetchProductSpecs = async () => {
  try {
    const productId = route.params.id as string
    const response = await getProductSpecs(productId)
    if (response?.code === 0 && response.data) {
      specs.value = response.data as unknown as ProductSpec[]
      // 初始化选中的规格
      if (specs.value?.length > 0) {
        selectedSpecs.value = specs.value.reduce((acc, spec) => {
          if (spec?.name && spec?.values?.length > 0) {
            acc[spec.name] = spec.values[0]
          }
          return acc
        }, {} as Record<string, string>)
      }
    }
  } catch (error) {
    console.error('获取商品规格失败:', error)
    ElMessage.error('获取商品规格失败')
  }
}

// 获取商品评价
const fetchProductReviews = async () => {
  try {
    const productId = route.params.id as string
    const response = await getProductReviews({
      productId,
      page: reviewPage.value,
      pageSize: reviewPageSize.value
    })
    if (response?.code === 0 && response.data) {
      const reviewData = response.data as unknown as ProductReviewListResponse
      reviews.value = reviewData.list.map(review => ({
        ...review,
        userAvatar: review.userAvatar || defaultImageUrl,
        userName: review.userName || '匿名用户'
      }))
      reviewTotal.value = reviewData.total
    }
  } catch (error) {
    console.error('获取商品评价失败:', error)
  }
}

// 获取推荐商品
const fetchRecommendations = async () => {
  try {
    if (!product.value) return
    
    // 获取所有商品用于推荐
    const response = await getProducts({ limit: 100 })
    if (response?.code === 0 && response.data) {
      const productListResponse = response.data as unknown as ProductListResponse
      const allProducts = productListResponse.list
      
      // 获取当前用户ID（如果有登录用户）
      const storedUserId = localStorage.getItem('userId')
      
      // 使用多种推荐策略
      let recommendations: Product[] = []
      
      // 1. 优先使用同类别的热门商品
      if (product.value.categoryId) {
        const categoryRecommendations = getPopularInCategory(
          product.value.categoryId,
          allProducts,
          4
        )
        if (categoryRecommendations.length > 0) {
          recommendations = categoryRecommendations
        }
      }
      
      // 2. 如果同类商品不足，使用基于相似度的推荐
      if (recommendations.length < 4) {
        const similarProducts = getSimilarProducts(
          product.value,
          allProducts.filter(p => !recommendations.some(r => r.id === p.id)),
          4 - recommendations.length
        )
        if (similarProducts.length > 0) {
          recommendations = [...recommendations, ...similarProducts]
        }
      }
      
      // 3. 如果用户已登录，添加基于用户行为的推荐
      if (storedUserId && recommendations.length < 4) {
        const userBasedRecommendations = getUserBasedCF(
          storedUserId,
          allProducts.filter(p => !recommendations.some(r => r.id === p.id)),
          4 - recommendations.length
        )
        if (userBasedRecommendations.length > 0) {
          recommendations = [...recommendations, ...userBasedRecommendations]
        }
      }
      
      // 4. 如果还是不足，使用基于商品的协同过滤
      if (recommendations.length < 4) {
        const itemBasedRecommendations = getItemBasedCF(
          product.value.id,
          allProducts.filter(p => !recommendations.some(r => r.id === p.id)),
          4 - recommendations.length
        )
        if (itemBasedRecommendations.length > 0) {
          recommendations = [...recommendations, ...itemBasedRecommendations]
        }
      }
      
      // 更新推荐商品列表
      relatedProducts.value = recommendations
    }
  } catch (error) {
    console.error('获取推荐商品失败:', error)
  }
}

// 添加到购物车
const handleAddToCart = async () => {
  if (!product.value) return
  
  try {
    // 记录用户行为
    handleProductInteraction('cart')
    
    // 添加到购物车
    const response = await addToCart(product.value.id, quantity.value)
    
    if (response.code === 0) {
      ElMessage.success('已添加到购物车')
    } else {
      ElMessage.error(response.message || '添加失败')
    }
  } catch (error) {
    console.error('添加到购物车失败:', error)
    ElMessage.error('添加失败')
  }
}

// 立即购买
const handleBuyNow = async () => {
  if (!product.value) return
  
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/auth/login')
    return
  }
  
  // 检查是否选择了规格
  if (!selectedSpecs.value) {
    ElMessage.warning('请选择商品规格')
    return
  }
  
  // 检查库存 - 增加库存限制
  if (quantity.value > 1000) {
    ElMessage.warning('单次购买数量不能超过1000件')
    return
  }
  
  try {
    loading.value = true
    
    // 创建订单
    const orderData = {
      items: [{
        productId: product.value.id,
        quantity: quantity.value,
        specs: selectedSpecs.value
      }],
      address: {
        name: userStore.userInfo?.nickname || '测试用户',
        phone: userStore.userInfo?.phone || '13800138000',
        address: '测试地址' // 这里应该从用户的默认地址中获取
      },
      paymentMethod: 'ONLINE'
    }
    
    const response = await createOrder(orderData)
    
    if (response.code === 0 && response.data) {
      ElMessage.success('订单创建成功')
      // 跳转到订单列表页面
      router.push('/orders')
    } else {
      ElMessage.error(response.message || '创建订单失败')
    }
  } catch (error: any) {
    console.error('创建订单失败:', error)
    ElMessage.error(error.response?.data?.message || '创建订单失败')
  } finally {
    loading.value = false
  }
}

// 获取评分百分比
const getRatingPercentage = (rating: number) => {
  if (!reviews.value) return 0
  const total = reviews.value.length
  const count = reviews.value.filter(r => r.rating === rating).length
  return total ? Math.round((count / total) * 100) : 0
}

// 获取评分数量
const getRatingCount = (rating: number) => {
  if (!reviews.value) return 0
  return reviews.value.filter(r => r.rating === rating).length
}

// 格式化日期
const formatDate = (date: Date | string) => {
  return formatDateUtil(date);
}

// 事件处理
const handleReviewSizeChange = (val: number) => {
  reviewPageSize.value = val
  fetchProductReviews()
}

const handleReviewCurrentChange = (val: number) => {
  reviewPage.value = val
  fetchProductReviews()
}

// 处理商品点击
const handleProductClick = (productId: string) => {
  router.push({
    path: `/products/${productId}`
  })
}

// 修改handleSpecSelect函数
const handleSpecSelect = (spec: ProductSpec) => {
  if (selectedSpecs.value[spec.id]) {
    selectedSpecs.value[spec.id] = '';
  } else {
    selectedSpecs.value[spec.id] = spec.values[0];
  }
  handleProductInteraction('specSelect');
};

// 修改handleQuantityChange函数
const handleQuantityChange = (value: number) => {
  quantity.value = value;
  handleProductInteraction('quantityChange');
};

// 图片加载错误处理
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  
  // 如果图片加载失败，替换为默认图片
  if (target.src !== defaultImageUrl) {
    console.warn('图片加载失败，使用默认图片:', {
      originalSrc: target.src,
      newSrc: defaultImageUrl
    })
    target.src = defaultImageUrl
  }
}

// 生命周期钩子
onMounted(async () => {
  await fetchProductDetail()
  await fetchProductSpecs()
  await fetchProductReviews()
  await fetchRecommendations()
})

// 在组件卸载时停止页面浏览计时器
onUnmounted(() => {
  recordPageViewDuration()
})
</script>

<style scoped>
.product-detail {
  padding: 20px;
}

.product-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.product-gallery {
  border: 1px solid #eee;
  border-radius: 4px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-content {
  padding: 20px;
}

.product-name {
  margin: 0 0 20px;
  font-size: 24px;
  line-height: 1.4;
}

.product-price {
  margin-bottom: 20px;
}

.current-price {
  color: #f56c6c;
  font-size: 28px;
  font-weight: bold;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  margin-left: 12px;
  font-size: 16px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #666;
}

.spec-group {
  margin-bottom: 20px;
}

.spec-name {
  margin-bottom: 10px;
  font-weight: bold;
}

.product-quantity {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.label {
  margin-right: 10px;
}

.product-actions {
  display: flex;
  gap: 20px;
}

.product-detail-section {
  margin-bottom: 40px;
}

.detail-content {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.reviews-section {
  padding: 20px;
}

.reviews-summary {
  margin-bottom: 30px;
}

.rating-overview {
  display: flex;
  gap: 40px;
}

.average-rating {
  text-align: center;
}

.rating-number {
  font-size: 36px;
  font-weight: bold;
  color: #f56c6c;
}

.rating-stats {
  flex: 1;
}

.rating-bar {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.star {
  width: 40px;
}

.count {
  width: 40px;
  text-align: right;
}

.review-item {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.review-info {
  margin-left: 10px;
}

.review-user {
  font-weight: bold;
}

.review-time {
  color: #999;
  font-size: 12px;
}

.review-content {
  margin-top: 10px;
}

.review-text {
  margin: 10px 0;
  line-height: 1.6;
}

.review-images {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.review-images .el-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
}

.reviews-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.related-products {
  margin-top: 40px;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
  padding-bottom: 12px;
  border-bottom: 2px solid #f56c6c;
}

.product-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-card {
  display: flex;
  cursor: pointer;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #eee;
  padding: 16px;
}

.product-card:hover {
  transform: translateX(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-color: #f56c6c;
}

.product-card .product-image {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 20px;
}

.product-card .product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-card .product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 0;
}

.product-card .product-name {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-card .product-price {
  margin-bottom: 16px;
}

.product-card .current-price {
  font-size: 22px;
  font-weight: 600;
  color: #f56c6c;
}

.product-card .original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-left: 8px;
}

.product-card .product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
  margin-top: auto;
}

.product-card .sales {
  color: #666;
}

.product-card .rating {
  color: #f56c6c;
  font-weight: 500;
}
</style> 
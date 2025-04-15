<template>
  <div class="cart-container">
    <el-card class="cart-card" v-loading="loading" element-loading-text="加载中...">
      <template #header>
        <div class="card-header">
          <span>我的购物车</span>
          <el-button 
            type="danger" 
            @click="clearCart" 
            :disabled="cartItems.length === 0"
          >清空购物车</el-button>
        </div>
      </template>

      <el-empty v-if="error" :description="error">
        <el-button type="primary" @click="retryFetch">重试</el-button>
      </el-empty>

      <el-empty v-else-if="cartItems.length === 0" description="购物车空空如也，快去选购商品吧！">
        <el-button type="primary" @click="goToProducts">去购物</el-button>
      </el-empty>

      <div v-else class="cart-content">
        <!-- 购物车头部 -->
        <div class="cart-header">
          <el-checkbox v-model="selectAll" @change="handleSelectAllChange">全选</el-checkbox>
          <div class="header-item product-info">商品信息</div>
          <div class="header-item product-price">单价</div>
          <div class="header-item product-quantity">数量</div>
          <div class="header-item product-subtotal">小计</div>
          <div class="header-item product-action">操作</div>
        </div>

        <!-- 购物车列表 -->
        <div class="cart-list">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <el-checkbox v-model="item.selected" @change="handleItemSelectChange" />
            <div class="product-info">
              <div class="product-image" @click="navigateToProduct(item.productId)">
                <el-image :src="item.productImage" :alt="item.productName" fit="cover" />
              </div>
              <div class="product-name" @click="navigateToProduct(item.productId)">
                {{ item.productName }}
              </div>
            </div>
            <div class="product-price">¥{{ item.price }}</div>
            <div class="product-quantity">
              <el-input-number 
                v-model="item.quantity" 
                :min="1" 
                :max="99"
                size="small"
                @change="handleQuantityChange(item)"
              />
            </div>
            <div class="product-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
            <div class="product-action">
              <el-button type="text" @click="removeItem(item.id)">删除</el-button>
            </div>
          </div>
        </div>

        <!-- 购物车底部 -->
        <div class="cart-footer">
          <div class="footer-left">
            <el-checkbox v-model="selectAll" @change="handleSelectAllChange">全选</el-checkbox>
            <el-button type="text" @click="removeSelected">删除选中商品</el-button>
          </div>
          <div class="footer-right">
            <div class="cart-summary">
              <div class="summary-item">
                <span>已选商品 {{ cartSummary.selectedItems }} 件</span>
              </div>
              <div class="summary-item">
                <span>合计：</span>
                <span class="total-price">¥{{ cartSummary.selectedAmount.toFixed(2) }}</span>
              </div>
            </div>
            <el-button 
              type="primary" 
              size="large" 
              @click="checkout" 
              :disabled="cartSummary.selectedItems === 0"
            >
              去结算
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 推荐商品 -->
    <el-card v-if="recommendations.length > 0" class="recommendations-card" v-loading="loadingRecommendations">
      <template #header>
        <div class="card-header">
          <span>为您推荐</span>
        </div>
      </template>

      <div class="recommendations-list">
        <el-row :gutter="20">
          <el-col :span="4" v-for="product in recommendations" :key="product.id">
            <el-card class="recommendation-item" @click="navigateToProduct(Number(product.productId))">
              <img :src="product.image" :alt="product.name" class="product-image" />
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">¥{{ product.price }}</div>
              </div>
              <el-button 
                type="primary" 
                size="small" 
                class="add-to-cart-btn"
                @click.stop="handleAddToCart(Number(product.productId), 1)"
              >
                加入购物车
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { CartItem, CartSummary, CartRecommend } from '@/types/cart'
import {
  getCartList,
  getRecommendedProducts,
  updateCartItem,
  removeFromCart,
  clearCart as clearCartApi,
  batchRemoveFromCart,
  toggleSelectAll as toggleSelectAllApi,
  addToCart
} from '@/api/cart'

const router = useRouter()
const userStore = useUserStore()

// 状态管理
const cartItems = ref<CartItem[]>([])
const selectAll = ref(true)
const loading = ref(false)
const loadingRecommendations = ref(false)
const error = ref<string | null>(null)
const recommendations = ref<CartRecommend[]>([])

// 购物车汇总信息
const cartSummary = computed<CartSummary>(() => {
  const totalItems = cartItems.value.length
  const selectedItems = cartItems.value.filter(item => item.selected).length
  const totalAmount = cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const selectedAmount = cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  return {
    totalItems,
    totalAmount,
    selectedItems,
    selectedAmount
  }
})

// 获取购物车列表
const fetchCartItems = async () => {
  try {
    // 检查用户是否登录
    if (!userStore.userInfo) {
      ElMessage.warning('请先登录')
      router.push('/auth/login')
      return
    }
    
    loading.value = true
    error.value = null
    const response = await getCartList()
    cartItems.value = response.data
    
    // 获取推荐商品
    await fetchRecommendations()
  } catch (error: any) {
    console.error('获取购物车列表失败', error)
    error.value = error.message || '获取购物车列表失败，请检查网络连接'
    cartItems.value = []
  } finally {
    loading.value = false
  }
}

// 重试加载
const retryFetch = () => {
  error.value = null
  fetchCartItems()
}

// 获取推荐商品
const fetchRecommendations = async () => {
  try {
    loadingRecommendations.value = true
    const response = await getRecommendedProducts()
    recommendations.value = response.data.map(item => ({
      id: String(item.id),
      productId: String(item.productId),
      name: item.productName,
      image: item.productImage,
      price: item.price,
      originalPrice: item.price,
      sales: 0,
      rating: 5,
      type: 'similar',
      sort: 0
    }))
  } catch (error) {
    console.error('获取推荐商品失败', error)
    recommendations.value = []
  } finally {
    loadingRecommendations.value = false
  }
}

// 处理全选/取消全选
const handleSelectAllChange = async (val: boolean | string | number) => {
  try {
    const isSelected = Boolean(val)
    await toggleSelectAllApi(isSelected)
    await fetchCartItems()
  } catch (error: any) {
    handleNetworkError(error, '更新选择状态失败')
    await fetchCartItems()
  }
}

// 处理单个商品选择状态变化
const handleItemSelectChange = async (item: CartItem) => {
  try {
    await updateCartItem(item.id, {
      quantity: item.quantity,
      selected: item.selected
    })
    selectAll.value = cartItems.value.every(item => item.selected)
  } catch (error: any) {
    handleNetworkError(error, '更新选择状态失败')
    await fetchCartItems()
  }
}

// 处理商品数量变化
const handleQuantityChange = async (item: CartItem) => {
  try {
    await updateCartItem(item.id, { quantity: item.quantity })
  } catch (error: any) {
    handleNetworkError(error, '更新商品数量失败')
    await fetchCartItems()
  }
}

// 删除单个商品
const removeItem = async (itemId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await removeFromCart(itemId)
    ElMessage.success('删除成功')
    await fetchCartItems()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除商品失败', error)
      ElMessage.error(error.message || '删除商品失败')
    }
  }
}

// 删除选中商品
const removeSelected = async () => {
  try {
    const selectedIds = cartItems.value
      .filter(item => item.selected)
      .map(item => item.id)
    
    if (selectedIds.length === 0) {
      ElMessage.warning('请先选择商品')
      return
    }
    
    await ElMessageBox.confirm('确定要删除选中的商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await batchRemoveFromCart(selectedIds)
    ElMessage.success('删除成功')
    await fetchCartItems()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除商品失败', error)
      ElMessage.error(error.message || '删除商品失败')
    }
  }
}

// 清空购物车
const clearCart = async () => {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await clearCartApi()
    ElMessage.success('购物车已清空')
    cartItems.value = []
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('清空购物车失败', error)
      ElMessage.error(error.message || '清空购物车失败')
    }
  }
}

// 跳转到商品详情
const navigateToProduct = (productId: number) => {
  router.push(`/products/${productId}`)
}

// 跳转到商品列表
const goToProducts = () => {
  router.push('/products')
}

// 去结算
const checkout = () => {
  router.push('/checkout')
}

// 添加商品到购物车
const handleAddToCart = async (productId: number, quantity: number) => {
  try {
    // 检查用户是否登录
    if (!userStore.userInfo) {
      ElMessage.warning('请先登录')
      router.push('/auth/login')
      return
    }
    
    await addToCart({ productId, quantity })
    ElMessage.success('商品已添加到购物车')
    await fetchCartItems()
  } catch (error: any) {
    console.error('添加商品到购物车失败', error)
    ElMessage.error(error.message || '添加商品到购物车失败，请稍后重试')
  }
}

// 处理网络错误
const handleNetworkError = (error: any, defaultMessage: string) => {
  if (error.response) {
    // 服务器返回错误响应
    switch (error.response.status) {
      case 401:
        ElMessage.error('登录已过期，请重新登录')
        userStore.handleLogout()
        router.push('/auth/login')
        break
      case 403:
        ElMessage.error('没有权限执行此操作')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 500:
        ElMessage.error('服务器内部错误，请稍后重试')
        break
      default:
        ElMessage.error(error.response.data?.message || defaultMessage)
    }
  } else if (error.request) {
    // 请求发出但没有收到响应
    ElMessage.error('网络连接失败，请检查网络设置')
  } else {
    // 请求配置出错
    ElMessage.error(error.message || defaultMessage)
  }
}

// 初始化
onMounted(() => {
  fetchCartItems()
})
</script>

<style scoped>
.cart-container {
  padding: 20px;
}

.cart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-content {
  margin-top: 20px;
}

.cart-header {
  display: grid;
  grid-template-columns: 50px 1fr 100px 150px 100px 100px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.cart-item {
  display: grid;
  grid-template-columns: 50px 1fr 100px 150px 100px 100px;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  cursor: pointer;
}

.product-name {
  cursor: pointer;
  color: #333;
}

.product-name:hover {
  color: #409eff;
}

.product-price,
.product-quantity,
.product-subtotal,
.product-action {
  flex: 1;
  text-align: center;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-summary {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}

.recommendations-card {
  margin-top: 20px;
}

.recommendations-list {
  margin-top: 20px;
}

.recommendation-item {
  cursor: pointer;
  transition: all 0.3s;
}

.recommendation-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.recommendation-item .product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.recommendation-item .product-info {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.recommendation-item .product-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommendation-item .product-price {
  color: #f56c6c;
  font-size: 16px;
  font-weight: bold;
}

.add-to-cart-btn {
  width: 100%;
  margin-top: 10px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.loading-overlay .el-loading-spinner {
  opacity: 1;
}

.el-card.is-loading {
  position: relative;
  overflow: hidden;
}

.el-card.is-loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1;
}
</style>
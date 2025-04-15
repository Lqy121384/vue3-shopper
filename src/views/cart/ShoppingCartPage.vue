<template>
  <div class="shopping-cart" v-loading="loading">
    <el-empty v-if="!loading && cartItems.length === 0" description="购物车是空的">
      <el-button type="primary" @click="$router.push('/products')">去购物</el-button>
    </el-empty>

    <template v-else>
      <!-- 购物车列表 -->
      <div class="cart-list">
        <div class="cart-header">
          <el-checkbox v-model="isAllSelected" @change="handleSelectAll">全选</el-checkbox>
          <span class="header-item">商品信息</span>
          <span class="header-item">单价</span>
          <span class="header-item">数量</span>
          <span class="header-item">小计</span>
          <span class="header-item">操作</span>
        </div>

        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <el-checkbox v-model="item.selected" @change="handleSelect(item)" />
            <div class="item-info">
              <img :src="item.product.image" :alt="item.product.name" class="item-image" />
              <div class="item-detail">
                <h3 class="item-name">{{ item.product.name }}</h3>
                <div class="item-specs">
                  <span v-for="(value, key) in item.specs" :key="key">
                    {{ key }}: {{ value }}
                  </span>
                </div>
              </div>
            </div>
            <div class="item-price">
              <span class="current-price">¥{{ item.product.price }}</span>
              <span class="original-price" v-if="item.originalPrice">¥{{ item.originalPrice }}</span>
            </div>
            <div class="item-quantity">
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="item.product.stock"
                @change="(val) => handleQuantityChange(item, val)"
              />
            </div>
            <div class="item-subtotal">
              ¥{{ (item.product.price * item.quantity).toFixed(2) }}
            </div>
            <div class="item-actions">
              <el-button type="text" @click="handleRemove(item)">删除</el-button>
              <el-button type="text" @click="handleMoveToFavorites(item)">移入收藏</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 购物车底部 -->
      <div class="cart-footer">
        <div class="footer-left">
          <el-checkbox v-model="isAllSelected" @change="handleSelectAll">全选</el-checkbox>
          <el-button type="text" @click="handleClear">清空购物车</el-button>
          <el-button type="text" @click="handleBatchMoveToFavorites">批量移入收藏</el-button>
        </div>
        <div class="footer-right">
          <div class="cart-summary">
            <div class="summary-item">
              <span>已选择 {{ selectedCount }} 件商品</span>
            </div>
            <div class="summary-item">
              <span>合计：</span>
              <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
          <el-button
            type="primary"
            size="large"
            :disabled="selectedCount === 0"
            @click="handleCheckout"
          >
            结算
          </el-button>
        </div>
      </div>

      <!-- 购物车推荐 -->
      <div class="cart-recommend">
        <h2>猜你喜欢</h2>
        <div class="recommend-grid">
          <el-card
            v-for="item in recommendItems"
            :key="item.id"
            class="recommend-card"
            @click="handleProductClick(item)"
          >
            <img :src="item.image" :alt="item.name" class="recommend-image" />
            <div class="recommend-info">
              <h3 class="recommend-name">{{ item.name }}</h3>
              <div class="recommend-price">
                <span class="current-price">¥{{ item.price }}</span>
                <span class="original-price" v-if="item.originalPrice">¥{{ item.originalPrice }}</span>
              </div>
              <div class="recommend-meta">
                <span class="sales">销量: {{ item.sales }}</span>
                <el-rate v-model="item.rating" disabled />
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CartItem, CartRecommend } from '@/types/cart'
import {
  getCartList,
  updateCartItem,
  removeCartItem,
  clearCart,
  selectCartItem,
  selectAllCartItems,
  getCartSummary,
  getCartStats,
  getCartRecommend
} from '@/api/cart'

defineOptions({
  name: 'ShoppingCartPage'
})

const router = useRouter()

// 状态定义
const loading = ref(false)
const cartItems = ref<CartItem[]>([])
const recommendItems = ref<CartRecommend[]>([])

// 计算属性
const isAllSelected = computed(() => cartItems.value.length > 0 && cartItems.value.every(item => item.selected))
const selectedItems = computed(() => cartItems.value.filter(item => item.selected))
const selectedCount = computed(() => selectedItems.value.length)
const totalPrice = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
})

// 获取购物车列表
const fetchCartList = async () => {
  try {
    loading.value = true
    const response = await getCartList()
    cartItems.value = response.data.items
  } catch (error) {
    console.error('获取购物车列表失败:', error)
    ElMessage.error('获取购物车列表失败')
  } finally {
    loading.value = false
  }
}

// 获取购物车推荐
const fetchCartRecommend = async () => {
  try {
    const response = await getCartRecommend()
    recommendItems.value = response.data
  } catch (error) {
    console.error('获取购物车推荐失败:', error)
    ElMessage.error('获取购物车推荐失败')
  }
}

// 更新商品数量
const handleQuantityChange = async (item: CartItem, quantity: number) => {
  try {
    await updateCartItem({ id: item.id, quantity })
    ElMessage.success('更新成功')
  } catch (error) {
    console.error('更新数量失败:', error)
  }
}

// 删除商品
const handleRemove = async (item: CartItem) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await removeCartItem(item.id)
    ElMessage.success('删除成功')
    fetchCartList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 选择商品
const handleSelect = async (item: CartItem) => {
  try {
    await selectCartItem(item.id.toString(), !item.selected)
    ElMessage.success('更新成功')
  } catch (error) {
    console.error('更新选中状态失败:', error)
  }
}

// 全选/取消全选
const handleSelectAll = async () => {
  try {
    await selectAllCartItems(!isAllSelected.value)
    ElMessage.success('更新成功')
  } catch (error) {
    console.error('更新选中状态失败:', error)
  }
}

// 清空购物车
const handleClear = async () => {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await clearCart()
    ElMessage.success('清空成功')
    fetchCartList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空失败:', error)
    }
  }
}

// 移入收藏
const handleMoveToFavorites = async (item: CartItem) => {
  try {
    await addCartToFavorites(item.id)
    ElMessage.success('移入收藏成功')
  } catch (error) {
    console.error('移入收藏失败:', error)
    ElMessage.error('移入收藏失败')
  }
}

// 批量移入收藏
const handleBatchMoveToFavorites = async () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要移入收藏的商品')
    return
  }

  try {
    await batchAddCartToFavorites(selectedItems.value.map(item => item.id))
    ElMessage.success('移入收藏成功')
  } catch (error) {
    console.error('批量移入收藏失败:', error)
    ElMessage.error('批量移入收藏失败')
  }
}

// 结算
const handleCheckout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }

  router.push({
    path: '/checkout',
    query: {
      items: selectedItems.value.map(item => `${item.id}:${item.quantity}`).join(',')
    }
  })
}

// 点击商品
const handleProductClick = (product: CartRecommend) => {
  router.push(`/products/${product.id}`)
}

// 生命周期钩子
onMounted(() => {
  fetchCartList()
  fetchCartRecommend()
})
</script>

<style scoped>
.shopping-cart {
  padding: 20px;
}

.cart-list {
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 20px;
}

.cart-header {
  display: grid;
  grid-template-columns: 60px 2fr 1fr 1fr 1fr 1fr;
  padding: 20px;
  border-bottom: 1px solid #eee;
  font-weight: bold;
}

.header-item {
  text-align: center;
}

.cart-items {
  padding: 20px;
}

.cart-item {
  display: grid;
  grid-template-columns: 60px 2fr 1fr 1fr 1fr 1fr;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-detail {
  flex: 1;
}

.item-name {
  margin: 0 0 8px;
  font-size: 16px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-specs {
  color: #666;
  font-size: 14px;
}

.item-specs span {
  margin-right: 12px;
}

.item-price {
  text-align: center;
}

.current-price {
  color: #f56c6c;
  font-size: 16px;
  font-weight: bold;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  margin-left: 8px;
  font-size: 14px;
}

.item-quantity {
  display: flex;
  justify-content: center;
}

.item-subtotal {
  text-align: center;
  color: #f56c6c;
  font-size: 16px;
  font-weight: bold;
}

.item-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 20px;
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
  text-align: right;
}

.summary-item {
  margin-bottom: 8px;
}

.total-price {
  color: #f56c6c;
  font-size: 24px;
  font-weight: bold;
}

.cart-recommend {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
}

.cart-recommend h2 {
  margin: 0 0 20px;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.recommend-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.recommend-card:hover {
  transform: translateY(-5px);
}

.recommend-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.recommend-info {
  padding: 12px;
}

.recommend-name {
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.recommend-price {
  margin: 8px 0;
}

.recommend-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}
</style> 
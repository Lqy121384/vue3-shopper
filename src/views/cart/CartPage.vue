<!-- CartPage.vue -->
<template>
  <div class="cart-page">
    <el-card v-if="!cartStore.isEmpty" class="cart-container">
      <template #header>
        <div class="cart-header">
          <el-checkbox
            :model-value="cartStore.isAllSelected"
            :disabled="cartStore.isEmpty"
            :loading="cartStore.loading"
            @change="handleSelectAllChange"
          >
            全选
          </el-checkbox>
          <el-button
            type="danger"
            link
            :disabled="cartStore.isEmpty"
            :loading="cartStore.loading"
            @click="handleClearCart"
          >
            清空购物车
          </el-button>
        </div>
      </template>
      <!-- 购物车头部 -->
      <div class="cart-header">
        <div class="cart-header-right">
          <span>单价</span>
          <span>数量</span>
          <span>小计</span>
          <span>操作</span>
        </div>
      </div>

      <!-- 购物车列表 -->
      <div class="cart-list">
        <el-skeleton :loading="cartStore.loading" :rows="3" animated>
          <template #default>
            <div v-for="item in cartStore.cartItems" :key="item.id" class="cart-item">
              <div class="item-main">
                <el-checkbox
                  v-model="item.selected"
                  @change="(selected: boolean) => cartStore.handleUpdateCartItem(Number(item.id), item.quantity, selected)"
                />
                <el-image :src="item.image" fit="cover" class="product-image">
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <span class="product-name">{{ item.name }}</span>
              </div>
              <div class="item-price">¥{{ item.price.toFixed(2) }}</div>
              <div class="item-quantity">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="item.stock"
                  @change="(quantity: number) => cartStore.handleUpdateCartItem(Number(item.id), quantity)"
                />
              </div>
              <div class="item-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
              <div class="item-actions">
                <el-button
                  type="danger"
                  link
                  @click="cartStore.handleRemoveFromCart(Number(item.id))"
                >
                  删除
                </el-button>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 购物车底部 -->
      <div class="cart-footer">
        <div class="footer-left">
          <el-button type="danger" plain @click="cartStore.handleClearCart">
            清空购物车
          </el-button>
        </div>
        <div class="footer-right">
          <div class="selected-info">
            已选择 <span class="highlight">{{ cartStore.cartSummary.selectedItems }}</span> 件商品
          </div>
          <div class="total-price">
            合计：<span class="highlight">¥{{ cartStore.cartSummary.selectedAmount.toFixed(2) }}</span>
          </div>
          <el-button
            type="primary"
            :disabled="cartStore.cartSummary.selectedItems === 0"
            @click="handleCheckout"
          >
            结算
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 空购物车 -->
    <el-empty
      v-else
      description="购物车是空的"
      :image-size="200"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">
          去购物
        </el-button>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()

// 处理全选/取消全选
const handleSelectAllChange = async (selected: boolean) => {
  try {
    await cartStore.handleToggleSelectAll(selected)
  } catch (error) {
    console.error('Select all change failed:', error)
  }
}

// 处理清空购物车
const handleClearCart = async () => {
  try {
    await cartStore.handleClearCart()
  } catch (error) {
    console.error('Clear cart failed:', error)
  }
}

// 初始化购物车数据
onMounted(async () => {
  try {
    await cartStore.fetchCartList()
  } catch (error) {
    console.error('Failed to fetch cart list:', error)
  }
})

// 处理结算
const handleCheckout = () => {
  if (cartStore.cartSummary.selectedItems === 0) {
    ElMessage.warning('请先选择要结算的商品')
    return
  }
  router.push('/checkout')
}
</script>

<style scoped>
.cart-page {
  padding: 20px;
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
}

.cart-container {
  margin-bottom: 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.cart-header-right {
  display: flex;
  gap: 80px;
}

.cart-list {
  min-height: 200px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.item-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #909399;
}

.product-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.item-price,
.item-quantity,
.item-subtotal,
.item-actions {
  width: 80px;
  text-align: center;
  margin: 0 40px;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.selected-info,
.total-price {
  font-size: 14px;
  color: #606266;
}

.highlight {
  color: #f56c6c;
  font-weight: bold;
  margin: 0 4px;
}
</style> 
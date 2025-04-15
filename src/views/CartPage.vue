<template>
  <div class="cart-page">
    <div class="cart-header">
      <h2>我的购物车</h2>
      <div class="cart-actions">
        <el-button type="danger" @click="handleClearCart">清空购物车</el-button>
      </div>
    </div>
    
    <div class="cart-list">
      <el-table 
        :data="cartItems" 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
        ref="cartTable"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品信息">
          <template #default="{ row }">
            <div class="product-info">
              <el-image :src="row.image" :alt="row.name" class="product-image" />
              <div class="product-details">
                <h3>{{ row.name }}</h3>
                <p class="product-specs">{{ row.specs }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单价" prop="price" width="120">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="数量" width="150">
          <template #default="{ row }">
            <el-input-number 
              v-model="row.quantity" 
              :min="1" 
              :max="row.stock || 99"
              @change="(cur: number | undefined, prev: number | undefined) => handleQuantityChange(row, cur || 1)"
            />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            ¥{{ (row.price * row.quantity).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleRemove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="cart-footer">
      <div class="cart-summary">
        <el-checkbox v-model="isAllSelected" @change="handleSelectAllChange">全选</el-checkbox>
        <p>已选择 {{ selectedCount }} 件商品</p>
        <p>合计：<span class="total-price">¥{{ totalPrice.toFixed(2) }}</span></p>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useCartStore } from '../stores/cart'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { CartItem } from '@/types/cart'

const cartStore = useCartStore()
const cartItems = ref<CartItem[]>([])
const selectedRows = ref<CartItem[]>([])
const router = useRouter()
const cartTable = ref()

// 计算是否全选
const isAllSelected = computed({
  get: () => cartItems.value.length > 0 && selectedRows.value.length === cartItems.value.length,
  set: (val) => handleSelectAllChange(val)
})

// 计算总价
const totalPrice = computed(() => {
  return selectedRows.value
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
})

// 计算选中商品数量
const selectedCount = computed(() => {
  return selectedRows.value.length
})

// 处理全选变化
const handleSelectAllChange = async (val: boolean | string | number) => {
  try {
    const isSelected = Boolean(val)
    
    // 使用 cartStore 的 handleToggleSelectAll 方法
    await cartStore.handleToggleSelectAll(isSelected)
    
    // 更新本地状态
    if (isSelected) {
      selectedRows.value = [...cartItems.value]
    } else {
      selectedRows.value = []
    }
    
    // 更新本地状态
    cartItems.value = cartItems.value.map(item => ({
      ...item,
      selected: isSelected
    }))
    
    // 重新计算总价
    console.log('Updated total price:', totalPrice.value)
  } catch (error) {
    console.error('Select all change failed:', error)
    ElMessage.error('更新选中状态失败，请重试')
  }
}

// 处理选中状态变化
const handleSelectionChange = async (selection: CartItem[]) => {
  try {
    console.log('Selection changed:', selection)
    console.log('Previous selection:', selectedRows.value)
    
    // 找出新增和移除的选中项
    const previousIds = new Set(selectedRows.value.map(item => item.id))
    const currentIds = new Set(selection.map(item => item.id))
    
    // 更新选中状态
    selectedRows.value = selection
    
    // 更新每个发生变化的商品的选中状态
    for (const item of cartItems.value) {
      const wasSelected = previousIds.has(item.id)
      const isSelected = currentIds.has(item.id)
      
      if (wasSelected !== isSelected) {
        console.log(`Updating item ${item.id} selection from ${wasSelected} to ${isSelected}`)
        try {
          await cartStore.handleUpdateCartItem(item.id, item.quantity, isSelected)
          console.log(`Successfully updated item ${item.id} selection`)
        } catch (err) {
          console.error(`Failed to update item ${item.id} selection:`, err)
          // 如果更新失败，回滚本地状态
          if (wasSelected) {
            selectedRows.value = selectedRows.value.filter(row => row.id !== item.id)
          } else {
            selectedRows.value = [...selectedRows.value, item]
          }
          throw err
        }
      }
    }
    
    // 更新本地状态
    cartItems.value = cartItems.value.map(item => ({
      ...item,
      selected: currentIds.has(item.id)
    }))
    
    // 重新计算总价
    console.log('Updated total price:', totalPrice.value)
    
  } catch (error) {
    console.error('Selection change failed:', error)
    ElMessage.error('更新选中状态失败，请重试')
  }
}

// 处理数量变化
const handleQuantityChange = async (item: CartItem, value: number) => {
  try {
    // 更新本地数量
    const index = cartItems.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      cartItems.value[index].quantity = value
    }
    // 更新后端数据
    await cartStore.handleUpdateCartItem(item.id, value, item.selected)
    // 更新购物车列表
    await cartStore.fetchCartList()
  } catch (error) {
    console.error('Quantity change failed:', error)
    ElMessage.error('更新数量失败，请重试')
  }
}

// 处理删除商品
const handleRemove = async (item: CartItem) => {
  try {
    await cartStore.handleRemoveFromCart(item.id)
    // 更新购物车列表
    await cartStore.fetchCartList()
    // 清除已删除商品的选中状态
    selectedRows.value = selectedRows.value.filter(row => row.id !== item.id)
  } catch (error) {
    console.error('Remove item failed:', error)
    ElMessage.error('删除商品失败，请重试')
  }
}

// 处理清空购物车
const handleClearCart = async () => {
  try {
    await cartStore.handleClearCart()
    // 清空选中状态
    selectedRows.value = []
    // 更新购物车列表
    await cartStore.fetchCartList()
  } catch (error) {
    console.error('Clear cart failed:', error)
    ElMessage.error('清空购物车失败，请重试')
  }
}

// 处理结算
const handleCheckout = async () => {
  try {
    // 检查是否有选中的商品
    if (cartStore.cartSummary.selectedItems === 0) {
      ElMessage.warning('请先选择要结算的商品')
      return
    }

    // 检查结算金额
    if (cartStore.cartSummary.selectedAmount <= 0) {
      ElMessage.warning('结算金额不能为0')
      return
    }

    // 跳转到结算页面
    router.push({
      path: '/checkout',
      query: {
        items: cartStore.cartItems
          .filter(item => item.selected)
          .map(item => item.id)
          .join(','),
        amount: cartStore.cartSummary.selectedAmount.toFixed(2)
      }
    })
  } catch (error) {
    console.error('Checkout failed:', error)
    ElMessage.error('结算失败，请重试')
  }
}

// 初始化购物车数据
onMounted(async () => {
  try {
    console.log('Initializing cart...')
    await cartStore.fetchCartList()
    cartItems.value = cartStore.cartItems
    console.log('Cart items loaded:', cartItems.value)
    
    // 初始化选中状态
    const initialSelection = cartItems.value.filter(item => item.selected)
    console.log('Initial selection:', initialSelection)
    selectedRows.value = initialSelection
    
    // 设置表格的选中状态
    nextTick(() => {
      console.log('Setting initial table selection...')
      const table = document.querySelector('.el-table__body-wrapper table')
      if (table) {
        cartItems.value.forEach((item, index) => {
          if (item.selected) {
            const checkbox = table.querySelector(`tbody tr:nth-child(${index + 1}) .el-checkbox`)
            if (checkbox) {
              console.log(`Selecting row ${index + 1} for item ${item.id}`)
              ;(checkbox as any).click()
            }
          }
        })
      }
    })
  } catch (error) {
    console.error('Failed to initialize cart:', error)
    ElMessage.error('加载购物车数据失败，请刷新页面重试')
  }
})

// 监听购物车数据变化
watch(() => cartStore.cartItems, (newItems) => {
  console.log('Cart items changed:', newItems)
  cartItems.value = newItems
  // 同步选中状态
  const selectedIds = new Set(selectedRows.value.map(item => item.id))
  selectedRows.value = newItems.filter(item => selectedIds.has(item.id))
}, { deep: true })
</script>

<style>
.cart-page {
  padding: 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.cart-list {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.product-details h3 {
  margin: 0;
  font-size: 16px;
}

.product-specs {
  margin: 5px 0 0;
  color: #666;
  font-size: 14px;
}

.cart-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.cart-summary {
  text-align: right;
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}
</style> 
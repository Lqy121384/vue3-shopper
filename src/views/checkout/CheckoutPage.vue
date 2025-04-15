<template>
  <div class="checkout-page">
    <el-card>
      <template #header>
        <div class="checkout-header">
          <h2>确认订单</h2>
        </div>
      </template>
      
      <!-- 收货地址 -->
      <div class="section">
        <h3>收货地址</h3>
        <div class="address-list">
          <el-radio-group v-model="selectedAddress">
            <el-radio
              v-for="address in addresses"
              :key="address.id"
              :label="address.id"
              class="address-item"
            >
              <div class="address-info">
                <div class="contact">
                  <span class="name">{{ address.name }}</span>
                  <span class="phone">{{ address.phone }}</span>
                </div>
                <div class="location">
                  {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
                </div>
              </div>
              <div class="address-actions">
                <el-button link @click="handleEditAddress(address)">
                  编辑
                </el-button>
                <el-button link @click="handleDeleteAddress(address)">
                  删除
                </el-button>
              </div>
            </el-radio>
          </el-radio-group>
        </div>
        
        <el-button type="primary" link @click="handleAddAddress">
          <el-icon><Plus /></el-icon>
          新增收货地址
        </el-button>
      </div>
      
      <!-- 商品信息 -->
      <div class="section">
        <h3>商品信息</h3>
        <div class="product-list">
          <div
            v-for="product in products"
            :key="product.id"
            class="product-item"
          >
            <el-image 
              :src="processImageUrl(product.image)"
              :alt="product.name"
              fit="cover"
              @error="() => product.image = defaultImageUrl"
            />
            <div class="product-info">
              <h4>{{ product.name }}</h4>
              <p class="product-specs">{{ product.specs }}</p>
              <div class="product-price">
                <span class="price">¥{{ product.price }}</span>
                <span class="quantity">x{{ product.quantity }}</span>
                <span class="subtotal">小计：¥{{ (product.price * product.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 优惠券 -->
      <div class="section">
        <h3>优惠券</h3>
        <el-select v-model="selectedCoupon" placeholder="请选择优惠券">
          <el-option
            v-for="coupon in coupons"
            :key="coupon.id"
            :label="coupon.name"
            :value="coupon.id"
          >
            <span>{{ coupon.name }}</span>
            <span class="coupon-amount">-¥{{ coupon.amount }}</span>
          </el-option>
        </el-select>
      </div>
      
      <!-- 积分抵扣 -->
      <div class="section">
        <h3>积分抵扣</h3>
        <div class="points-deduction">
          <el-switch v-model="usePoints" />
          <span class="points-info">
            可用积分：{{ availablePoints }}
            可抵扣：¥{{ (availablePoints / 100).toFixed(2) }}
          </span>
        </div>
      </div>
      
      <!-- 支付方式 -->
      <div class="section">
        <h3>支付方式</h3>
        <el-radio-group v-model="paymentMethod">
          <el-radio value="alipay">支付宝</el-radio>
          <el-radio value="wechat">微信支付</el-radio>
        </el-radio-group>
      </div>
      
      <!-- 订单备注 -->
      <div class="section">
        <h3>订单备注</h3>
        <el-input
          v-model="remark"
          type="textarea"
          :rows="3"
          placeholder="请输入订单备注（选填）"
        />
      </div>
      
      <!-- 订单金额 -->
      <div class="order-amount">
        <div class="amount-item">
          <span>商品总额：</span>
          <span>¥{{ totalAmount.toFixed(2) }}</span>
        </div>
        <div class="amount-item">
          <span>优惠金额：</span>
          <span>-¥{{ discountAmount.toFixed(2) }}</span>
        </div>
        <div class="amount-item">
          <span>积分抵扣：</span>
          <span>-¥{{ pointsDeduction.toFixed(2) }}</span>
        </div>
        <div class="amount-item total">
          <span>实付金额：</span>
          <span class="price">¥{{ finalAmount.toFixed(2) }}</span>
        </div>
      </div>
      
      <!-- 提交订单 -->
      <div class="submit-order">
        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          @click="handleSubmitOrder"
        >
          提交订单
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'

// 类型定义
interface CartItem {
  id: number
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  selected: boolean
  specs?: string
}

interface Product {
  id: number
  name: string
  specs: string
  price: number
  quantity: number
  image: string
}

defineOptions({
  name: 'CheckoutPage'
})

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

// 默认图片
const defaultImageUrl = 'https://placehold.co/400x400/png?text=暂无图片'

// 处理图片URL
const processImageUrl = (url: string) => {
  if (!url) return defaultImageUrl
  if (url.startsWith('http')) return url
  return `http://localhost:3001/images/products${url.startsWith('/') ? url : `/${url}`}`
}

// 收货地址
const addresses = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '山东省',
    city: '烟台市',
    district: '芝罘区',
    detail: '某某街道某某号',
    isDefault: true
  }
])

const selectedAddress = ref(1)

// 商品信息
const products = ref<Product[]>([])

// 优惠券
const coupons = ref([
  {
    id: 1,
    name: '新人优惠券',
    amount: 10
  }
])

const selectedCoupon = ref('')

// 积分抵扣
const availablePoints = ref(1000)
const usePoints = ref(false)

// 支付方式
const paymentMethod = ref('alipay')

// 订单备注
const remark = ref('')

// 提交状态
const submitting = ref(false)

// 计算订单金额
const totalAmount = computed(() => {
  return products.value.reduce((total, product) => {
    return total + product.price * product.quantity
  }, 0)
})

const discountAmount = computed(() => {
  const coupon = coupons.value.find(c => String(c.id) === String(selectedCoupon.value))
  return coupon ? coupon.amount : 0
})

const pointsDeduction = computed(() => {
  if (!usePoints.value) return 0
  return Math.min(availablePoints.value / 100, totalAmount.value - discountAmount.value)
})

const finalAmount = computed(() => {
  return totalAmount.value - discountAmount.value - pointsDeduction.value
})

// 处理地址操作
const handleAddAddress = () => {
  // TODO: 打开新增地址对话框
  ElMessage.success('打开新增地址对话框')
}

const handleEditAddress = (address: any) => {
  // TODO: 打开编辑地址对话框
  ElMessage.success('打开编辑地址对话框')
}

const handleDeleteAddress = (address: any) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 调用删除地址API
    ElMessage.success('删除成功')
  })
}

// 获取购物车商品
const fetchCartProducts = async () => {
  try {
    // 从路由参数获取商品信息
    const cartItems = route.params.items
    if (!cartItems) {
      ElMessage.warning('请先选择要购买的商品')
      router.push('/cart')
      return
    }

    // 解析商品信息
    let selectedProducts
    try {
      selectedProducts = typeof cartItems === 'string' ? JSON.parse(cartItems) : cartItems
    } catch (e) {
      console.error('解析商品信息失败:', e)
      ElMessage.error('商品信息格式错误')
      router.push('/cart')
      return
    }

    if (!Array.isArray(selectedProducts) || selectedProducts.length === 0) {
      ElMessage.warning('请先选择要购买的商品')
      router.push('/cart')
      return
    }

    products.value = selectedProducts.map((item: CartItem) => ({
      id: item.id,
      name: item.productName,
      specs: item.specs || '',
      price: item.price,
      quantity: item.quantity,
      image: item.productImage
    }))
  } catch (error) {
    console.error('获取商品信息失败:', error)
    ElMessage.error('获取商品信息失败')
    router.push('/cart')
  }
}

// 提交订单
const handleSubmitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  if (!paymentMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }
  
  submitting.value = true
  try {
    // TODO: 调用创建订单API
    await new Promise(resolve => setTimeout(resolve, 1000))
    const orderId = '202403200001' // 这里应该是从API返回的订单号
    
    ElMessage.success('订单创建成功')
    router.push({
      path: '/payment',
      query: {
        orderId,
        amount: finalAmount.value
      }
    })
  } catch (error) {
    console.error('创建订单失败:', error)
    ElMessage.error('创建订单失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 页面加载
onMounted(async () => {
  await fetchCartProducts()
  // TODO: 获取地址列表
  // TODO: 获取优惠券列表
  // TODO: 获取可用积分
})
</script>

<style scoped>
.checkout-page {
  padding: 20px;
}

.checkout-header {
  h2 {
    margin: 0;
    font-size: 20px;
    color: #303133;
  }
}

.section {
  margin-bottom: 30px;
  
  h3 {
    margin: 0 0 20px;
    font-size: 16px;
    color: #303133;
  }
}

.address-list {
  margin-bottom: 15px;
  
  .address-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 15px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    
    .address-info {
      flex: 1;
      
      .contact {
        margin-bottom: 10px;
        
        .name {
          font-weight: bold;
          margin-right: 10px;
          color: #303133;
        }
        
        .phone {
          color: #606266;
        }
      }
      
      .location {
        color: #606266;
      }
    }
    
    .address-actions {
      display: flex;
      gap: 10px;
    }
  }
}

.product-list {
  .product-item {
    display: flex;
    margin-bottom: 15px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .el-image {
      width: 80px;
      height: 80px;
      margin-right: 15px;
    }
    
    .product-info {
      flex: 1;
      
      h4 {
        margin: 0 0 10px;
        font-size: 16px;
        color: #303133;
      }
      
      .product-specs {
        margin: 0 0 10px;
        color: #909399;
      }
      
      .product-price {
        .price {
          color: #f56c6c;
          margin-right: 10px;
        }
        
        .quantity {
          color: #909399;
          margin-right: 10px;
        }
        
        .subtotal {
          color: #f56c6c;
          font-weight: bold;
        }
      }
    }
  }
}

.points-deduction {
  display: flex;
  align-items: center;
  gap: 10px;
  
  .points-info {
    color: #606266;
  }
}

.order-amount {
  margin: 30px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  
  .amount-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    color: #606266;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &.total {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #ebeef5;
      font-size: 18px;
      font-weight: bold;
      
      .price {
        color: #f56c6c;
      }
    }
  }
}

.submit-order {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
}
</style> 
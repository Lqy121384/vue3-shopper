<template>
  <div class="checkout-container">
    <el-steps :active="activeStep" finish-status="success" class="checkout-steps">
      <el-step title="确认订单" />
      <el-step title="支付订单" />
      <el-step title="支付成功" />
    </el-steps>

    <!-- 确认订单 -->
    <div v-if="activeStep === 0" class="checkout-content">
      <!-- 收货地址 -->
      <el-card class="address-card">
        <template #header>
          <div class="card-header">
            <span>收货地址</span>
            <el-button type="primary" @click="addNewAddress" v-if="addresses.length > 0">新增地址</el-button>
          </div>
        </template>

        <el-empty v-if="addresses.length === 0" description="暂无收货地址">
          <el-button type="primary" @click="addNewAddress">添加收货地址</el-button>
        </el-empty>

        <div v-else class="address-list">
          <el-radio-group v-model="selectedAddressId">
            <div v-for="address in addresses" :key="address.id" class="address-item">
              <el-radio :value="String(address.id)">
                <div class="address-content">
                  <div class="address-info">
                    <div class="address-name">{{ address.receiver }}</div>
                    <div class="address-phone">{{ address.phone }}</div>
                    <el-tag v-if="address.isDefault" type="success" size="small">默认</el-tag>
                  </div>
                  <div class="address-detail">
                    {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
                  </div>
                </div>
              </el-radio>
              <div class="address-actions">
                <el-button type="text" @click="editAddress(address)">编辑</el-button>
                <el-button type="text" @click="deleteAddress(address.id)" :disabled="address.isDefault">删除</el-button>
              </div>
            </div>
          </el-radio-group>
        </div>
      </el-card>

      <!-- 商品清单 -->
      <el-card class="products-card">
        <template #header>
          <div class="card-header">
            <span>商品清单</span>
          </div>
        </template>

        <div class="product-list">
          <div class="product-header">
            <div class="product-info">商品信息</div>
            <div class="product-price">单价</div>
            <div class="product-quantity">数量</div>
            <div class="product-subtotal">小计</div>
          </div>

          <div v-for="item in checkoutItems" :key="item.id" class="product-item">
            <div class="product-info">
              <div class="product-image">
                <el-image :src="item.productImage" :alt="item.productName" fit="cover" />
              </div>
              <div class="product-name">{{ item.productName }}</div>
            </div>
            <div class="product-price">¥{{ item.price }}</div>
            <div class="product-quantity">{{ item.quantity }}</div>
            <div class="product-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
      </el-card>

      <!-- 配送方式 -->
      <el-card class="shipping-card">
        <template #header>
          <div class="card-header">
            <span>配送方式</span>
          </div>
        </template>

        <el-radio-group v-model="selectedShippingMethod" @change="handleShippingMethodChange">
          <el-radio :value="ShippingMethod.EXPRESS">
            <div class="shipping-method-item">
              <div class="shipping-method-name">快递配送</div>
              <div class="shipping-method-fee">¥ 10.00</div>
              <div class="shipping-method-desc">预计 1-3 天送达</div>
            </div>
          </el-radio>
          <el-radio :value="ShippingMethod.STANDARD">
            <div class="shipping-method-item">
              <div class="shipping-method-name">普通配送</div>
              <div class="shipping-method-fee">¥ 5.00</div>
              <div class="shipping-method-desc">预计 3-5 天送达</div>
            </div>
          </el-radio>
          <el-radio :value="ShippingMethod.SAME_DAY">
            <div class="shipping-method-item">
              <div class="shipping-method-name">同城配送</div>
              <div class="shipping-method-fee">¥ 15.00</div>
              <div class="shipping-method-desc">当天送达</div>
            </div>
          </el-radio>
        </el-radio-group>
      </el-card>

      <!-- 优惠券 -->
      <el-card class="coupon-card">
        <template #header>
          <div class="card-header">
            <span>优惠券</span>
          </div>
        </template>

        <el-select v-model="selectedCouponId" placeholder="请选择优惠券" style="width: 100%" clearable>
          <el-option
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            :label="`${coupon.name} - 满${coupon.minAmount}减${coupon.type === 'fixed' ? coupon.value : coupon.value + '%'}`"
            :value="coupon.id"
          />
          <template #empty>
            <el-empty description="暂无可用优惠券" />
          </template>
        </el-select>
      </el-card>

      <!-- 订单备注 -->
      <el-card class="remark-card">
        <template #header>
          <div class="card-header">
            <span>订单备注</span>
          </div>
        </template>

        <el-input
          v-model="orderRemark"
          type="textarea"
          :rows="2"
          placeholder="请输入订单备注，限100字"
          maxlength="100"
          show-word-limit
        />
      </el-card>

      <!-- 订单汇总 -->
      <el-card class="summary-card">
        <div class="order-summary">
          <div class="summary-item">
            <span>商品总价：</span>
            <span>¥{{ productTotal.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span>运费：</span>
            <span>¥{{ formattedShippingFee }}</span>
          </div>
          <div class="summary-item" v-if="couponDiscount > 0">
            <span>优惠券抵扣：</span>
            <span>-¥{{ couponDiscount.toFixed(2) }}</span>
          </div>
          <div class="summary-item total">
            <span>应付总额：</span>
            <span class="total-amount">¥{{ totalAmount }}</span>
          </div>
        </div>

        <div class="checkout-actions">
          <el-button @click="goBack">返回购物车</el-button>
          <el-button type="primary" @click="submitOrder" :disabled="!canSubmitOrder">提交订单</el-button>
        </div>
      </el-card>
    </div>

    <!-- 支付订单 -->
    <div v-else-if="activeStep === 1" class="checkout-content">
      <el-card class="payment-card">
        <template #header>
          <div class="card-header">
            <span>订单支付</span>
          </div>
        </template>

        <div class="payment-info">
          <div class="order-number">订单号：{{ orderNumber }}</div>
          <div class="payment-amount">支付金额：<span class="amount">¥{{ totalAmount }}</span></div>
          <div class="payment-time">请在 <span class="time">{{ paymentTimeLeft }}</span> 内完成支付</div>
        </div>

        <div class="payment-methods">
          <h3>选择支付方式</h3>
          <el-radio-group v-model="selectedPaymentMethod" @change="handlePaymentMethodChange">
            <el-radio :value="PaymentMethod.ALIPAY">
              <div class="payment-method-item">
                <img src="@/assets/images/alipay.png" alt="支付宝" />
                <span>支付宝</span>
              </div>
            </el-radio>
            <el-radio :value="PaymentMethod.WECHAT">
              <div class="payment-method-item">
                <img src="@/assets/images/wechat.png" alt="微信支付" />
                <span>微信支付</span>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <div class="payment-actions">
          <el-button @click="cancelPayment">取消支付</el-button>
          <el-button type="primary" @click="confirmPayment">确认支付</el-button>
        </div>
      </el-card>
    </div>

    <!-- 支付成功 -->
    <div v-else-if="activeStep === 2" class="checkout-content">
      <el-card class="success-card">
        <div class="payment-success">
          <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
          <h2>支付成功</h2>
          <p>您的订单已支付成功，我们将尽快为您发货</p>
          <div class="order-info">
            <p>订单号：{{ orderNumber }}</p>
            <p>支付金额：¥{{ totalAmount }}</p>
            <p>支付时间：{{ new Date().toLocaleString() }}</p>
          </div>
          <el-button type="primary" @click="router.push('/orders')">查看订单</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import type { Address } from '@/types/address'
import { OrderStatus, PaymentMethod, ShippingMethod } from '@/types/order'
import type { Order } from '@/types/order'
import type { Coupon } from '@/types/coupon'
import type { Product } from '@/types/product'

interface CheckoutItem {
  id: number
  productId: number
  productName: string
  productImage: string
  price: number
  quantity: number
}

// 模拟商品数据
const mockProduct: Product = {
  id: 1,
  name: '有机苹果',
  description: '新鲜采摘的有机苹果',
  price: 149.99,
  image: 'https://example.com/apple.jpg',
  images: ['https://example.com/apple.jpg'],
  categoryId: 1,
  category: {
    id: 1,
    name: '水果',
    icon: 'fruit-icon',
    level: 1,
    sort: 1
  },
  stock: 100,
  sales: 50,
  rating: 4.8,
  reviews: 20,
  tags: ['有机', '新鲜'],
  specifications: {},
  isOnSale: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const router = useRouter()
const activeStep = ref<number>(0)
const addresses = ref<Address[]>([])
const selectedAddressId = ref<number>(0)
const checkoutItems = ref<CheckoutItem[]>([])
const selectedShippingMethod = ref<ShippingMethod>(ShippingMethod.STANDARD)
const shippingFees: Record<ShippingMethod, number> = {
  [ShippingMethod.EXPRESS]: 20,
  [ShippingMethod.STANDARD]: 10,
  [ShippingMethod.SAME_DAY]: 30
}
const selectedCouponId = ref<number>(0)
const availableCoupons = ref<Coupon[]>([])
const orderRemark = ref<string>('')
const currentOrder = ref<Order | null>(null)
const selectedPaymentMethod = ref<PaymentMethod>(PaymentMethod.ALIPAY)
const paymentTimeLeft = ref<string>('29:59')

const productTotal = computed(() => {
  return checkoutItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
})

const currentShippingFee = computed(() => {
  return shippingFees[selectedShippingMethod.value]
})

const formattedShippingFee = computed(() => {
  return currentShippingFee.value.toFixed(2)
})

const couponDiscount = computed(() => {
  const selectedCoupon = availableCoupons.value.find(coupon => coupon.id === selectedCouponId.value)
  if (!selectedCoupon) return 0
  
  if (selectedCoupon.type === 'fixed') {
    return selectedCoupon.value
  } else {
    return productTotal.value * (selectedCoupon.value / 100)
  }
})

const totalAmount = computed(() => {
  const itemsTotal = checkoutItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
  return (itemsTotal + currentShippingFee.value).toFixed(2)
})

const canSubmitOrder = computed(() => {
  return selectedAddressId.value !== null && checkoutItems.value.length > 0
})

const addNewAddress = () => {
  // TODO: Implement address addition logic
}

const editAddress = (address: Address) => {
  // TODO: Implement address editing logic
}

const deleteAddress = (addressId: number) => {
  // TODO: Implement address deletion logic
}

const goBack = () => {
  router.push('/cart')
}

const submitOrder = async () => {
  try {
    // TODO: Implement order submission logic
    activeStep.value = 1
  } catch (error) {
    ElMessage.error('订单提交失败，请重试')
  }
}

const cancelPayment = () => {
  ElMessage.warning('支付已取消')
  router.push('/orders')
}

const confirmPayment = async () => {
  try {
    // TODO: Implement payment confirmation logic
    activeStep.value = 2
  } catch (error) {
    ElMessage.error('支付失败，请重试')
  }
}

const handleShippingMethodChange = () => {
  // TODO: Implement shipping method change logic
}

const handlePaymentMethodChange = () => {
  // TODO: Implement payment method change logic
}

const handleAddressSelect = (addressId: number) => {
  selectedAddressId.value = addressId
}

const orderNumber = computed(() => currentOrder.value?.orderNo || '')

const handleOrderCreated = (order: Order) => {
  currentOrder.value = order
  activeStep.value = 2
}
</script>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-steps {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-list {
  margin-top: 20px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.address-item:last-child {
  border-bottom: none;
}

.address-content {
  flex: 1;
  margin-left: 10px;
}

.address-info {
  margin-bottom: 5px;
}

.address-name {
  font-weight: bold;
  margin-right: 10px;
}

.address-phone {
  color: #666;
  margin-right: 10px;
}

.address-detail {
  color: #666;
}

.address-actions {
  margin-left: 20px;
}

.product-list {
  margin-top: 20px;
}

.product-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-weight: bold;
}

.product-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
}

.product-name {
  font-size: 14px;
}

.shipping-fee {
  color: #ff4d4f;
  margin-left: 10px;
}

.order-summary {
  padding: 20px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.total {
  font-size: 16px;
  font-weight: bold;
  border-top: 1px solid #eee;
  padding-top: 10px;
  margin-top: 10px;
}

.total-amount {
  color: #ff4d4f;
  font-size: 20px;
}

.checkout-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.payment-info {
  text-align: center;
  margin: 30px 0;
}

.payment-amount {
  font-size: 24px;
  margin: 15px 0;
}

.amount {
  color: #ff4d4f;
  font-weight: bold;
}

.payment-time {
  color: #666;
}

.time {
  color: #ff4d4f;
  font-weight: bold;
}

.payment-methods {
  margin: 30px 0;
}

.payment-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  vertical-align: middle;
}

.payment-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.payment-success {
  text-align: center;
  padding: 40px 0;
}

.success-icon {
  font-size: 60px;
  color: #52c41a;
  margin-bottom: 20px;
}

.order-info {
  margin-top: 20px;
  color: #666;
}

.shipping-method-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.shipping-method-name {
  font-size: 14px;
  margin-bottom: 5px;
}

.shipping-method-fee {
  font-size: 12px;
  color: #666;
}

.shipping-method-desc {
  font-size: 12px;
  color: #666;
}

.payment-method-item {
  display: flex;
  align-items: center;
}

.payment-method-item img {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}
</style>
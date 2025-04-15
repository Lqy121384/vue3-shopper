<template>
  <div class="order-detail-page" v-loading="orderStore.loading">
    <el-card class="order-card">
      <!-- 订单状态 -->
      <div class="order-status-section">
        <div class="status-info">
          <el-tag :type="getStatusType(orderStore.getOrderById(Number(route.params.id))?.status)" size="large">
            {{ getStatusText(orderStore.getOrderById(Number(route.params.id))?.status) }}
          </el-tag>
          <p class="status-desc">{{ getStatusDescription(orderStore.getOrderById(Number(route.params.id))?.status) }}</p>
        </div>
        <div class="status-actions">
          <el-button
            v-if="orderStore.getOrderById(Number(route.params.id))?.status === 'PENDING'"
            type="primary"
            @click="handlePay"
          >
            立即支付
          </el-button>
          <el-button
            v-if="orderStore.getOrderById(Number(route.params.id))?.status === 'PENDING'"
            @click="handleCancel"
          >
            取消订单
          </el-button>
          <el-button
            v-if="orderStore.getOrderById(Number(route.params.id))?.status === 'SHIPPED'"
            type="success"
            @click="handleConfirmReceipt"
          >
            确认收货
          </el-button>
          <el-button
            v-if="orderStore.getOrderById(Number(route.params.id))?.status === 'COMPLETED'"
            type="primary"
            @click="handleReview"
          >
            评价商品
          </el-button>
        </div>
      </div>

      <!-- 收货信息 -->
      <div class="section">
        <h3 class="section-title">收货信息</h3>
        <div class="address-info">
          <div class="info-item">
            <span class="label">收货人：</span>
            <span class="value">{{ orderStore.getOrderById(Number(route.params.id))?.address?.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span>
            <span class="value">{{ orderStore.getOrderById(Number(route.params.id))?.address?.phone }}</span>
          </div>
          <div class="info-item">
            <span class="label">收货地址：</span>
            <span class="value">{{ formatAddress(orderStore.getOrderById(Number(route.params.id))?.address) }}</span>
          </div>
          <div class="info-item">
            <span class="label">备注：</span>
            <span class="value">{{ orderStore.getOrderById(Number(route.params.id))?.remark || '无' }}</span>
          </div>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="section">
        <h3 class="section-title">商品信息</h3>
        <div class="product-list">
          <div v-for="item in orderStore.getOrderById(Number(route.params.id))?.items" :key="item.id" class="product-item">
            <img :src="item.image" :alt="item.name" class="product-image" />
            <div class="product-info">
              <h4 class="product-name">{{ item.name }}</h4>
              <div class="product-specs">
                <span v-for="(value, key) in item.specs" :key="key">
                  {{ key }}: {{ value }}
                </span>
              </div>
              <div class="product-price">
                <span class="price">¥{{ item.price }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
                <span class="subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="section">
        <h3 class="section-title">支付信息</h3>
        <div class="payment-info">
          <div class="info-item">
            <span class="label">支付方式：</span>
            <span class="value">{{ getPaymentMethodText(orderStore.getOrderById(Number(route.params.id))?.paymentMethod) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付时间：</span>
            <span class="value">{{ formatDate(orderStore.getOrderById(Number(route.params.id))?.paymentTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">交易流水号：</span>
            <span class="value">{{ orderStore.getOrderById(Number(route.params.id))?.paymentNo || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 物流信息 -->
      <div class="section" v-if="orderStore.getOrderById(Number(route.params.id))?.status !== 'PENDING'">
        <h3 class="section-title">物流信息</h3>
        <div class="shipping-info">
          <div class="info-item">
            <span class="label">物流公司：</span>
            <span class="value">{{ orderStore.getOrderById(Number(route.params.id))?.shippingCompany || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">物流单号：</span>
            <span class="value">{{ orderStore.getOrderById(Number(route.params.id))?.shippingNo || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">发货时间：</span>
            <span class="value">{{ formatDate(orderStore.getOrderById(Number(route.params.id))?.shippingTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">收货时间：</span>
            <span class="value">{{ formatDate(orderStore.getOrderById(Number(route.params.id))?.receiveTime) }}</span>
          </div>
        </div>
      </div>

      <!-- 订单金额 -->
      <div class="section">
        <h3 class="section-title">订单金额</h3>
        <div class="amount-info">
          <div class="amount-item">
            <span class="label">商品总额：</span>
            <span class="value">¥{{ orderStore.getOrderById(Number(route.params.id))?.totalAmount?.toFixed(2) || '--' }}</span>
          </div>
          <div class="amount-item">
            <span class="label">运费：</span>
            <span class="value">¥{{ orderStore.getOrderById(Number(route.params.id))?.shippingAmount?.toFixed(2) || '--' }}</span>
          </div>
          <div class="amount-item" v-if="orderStore.getOrderById(Number(route.params.id))?.discountAmount > 0">
            <span class="label">优惠金额：</span>
            <span class="value discount">-¥{{ orderStore.getOrderById(Number(route.params.id))?.discountAmount?.toFixed(2) || '--' }}</span>
          </div>
          <div class="amount-item total">
            <span class="label">实付金额：</span>
            <span class="value">¥{{ orderStore.getOrderById(Number(route.params.id))?.finalAmount?.toFixed(2) || '--' }}</span>
          </div>
        </div>
      </div>

      <!-- 订单日志 -->
      <div class="section">
        <h3 class="section-title">订单日志</h3>
        <el-timeline>
          <el-timeline-item
            v-for="log in orderStore.getOrderById(Number(route.params.id))?.logs"
            :key="log.id"
            :timestamp="formatDate(log.createdAt)"
            :type="getLogType(log.type)"
          >
            {{ log.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Order, OrderStatus, PaymentMethod } from '@/types/order'
import { useOrderStore } from '@/stores/order'
import {
  getOrderDetail,
  getOrderLogs,
  cancelOrder,
  confirmReceipt,
  deleteOrder
} from '@/api/order'

defineOptions({
  name: 'OrderDetailPage'
})

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    const orderId = Number(route.params.id)
    await orderStore.fetchOrderDetail(orderId)
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  }
}

// 格式化地址
const formatAddress = (address: Order['address']) => {
  if (!address) return '-'
  return `${address.province}${address.city}${address.district}${address.address}`
}

// 格式化日期
const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

// 获取状态类型
const getStatusType = (status: OrderStatus) => {
  const types = {
    PENDING: 'warning',
    PAID: 'primary',
    SHIPPED: 'info',
    COMPLETED: 'success',
    CANCELLED: 'danger'
  }
  return types[status]
}

// 获取状态文本
const getStatusText = (status: OrderStatus) => {
  const texts = {
    PENDING: '待付款',
    PAID: '待发货',
    SHIPPED: '待收货',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return texts[status]
}

// 获取状态描述
const getStatusDescription = (status: OrderStatus) => {
  const descriptions = {
    PENDING: '请在30分钟内完成支付，超时订单将自动取消',
    PAID: '商家正在处理您的订单，请耐心等待',
    SHIPPED: '商品已发出，请注意查收',
    COMPLETED: '订单已完成，感谢您的购买',
    CANCELLED: '订单已取消'
  }
  return descriptions[status]
}

// 获取支付方式文本
const getPaymentMethodText = (method: PaymentMethod) => {
  const texts = {
    ALIPAY: '支付宝',
    WECHAT: '微信支付'
  }
  return texts[method]
}

// 获取日志类型
const getLogType = (type: string) => {
  const types: Record<string, string> = {
    CREATE: 'primary',
    PAY: 'success',
    SHIP: 'info',
    RECEIVE: 'success',
    CANCEL: 'danger'
  }
  return types[type] || 'info'
}

// 处理支付
const handlePay = () => {
  router.push(`/payment/${orderStore.getOrderById(Number(route.params.id))?.id}`)
}

// 处理取消订单
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      type: 'warning'
    })
    await cancelOrder(Number(route.params.id))
    ElMessage.success('订单已取消')
    fetchOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

// 处理确认收货
const handleConfirmReceipt = async () => {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '确认收货', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await confirmReceipt(Number(route.params.id))
    ElMessage.success('确认收货成功')
    await fetchOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败:', error)
      ElMessage.error('确认收货失败')
    }
  }
}

// 处理评价
const handleReview = () => {
  router.push(`/review/${route.params.id}`)
}

// 生命周期钩子
onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-page {
  padding: 20px;
}

.order-card {
  max-width: 1000px;
  margin: 0 auto;
}

.order-status-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;

  .status-info {
    .status-desc {
      margin: 8px 0 0;
      color: #606266;
    }
  }

  .status-actions {
    display: flex;
    gap: 12px;
  }
}

.section {
  margin-bottom: 30px;

  .section-title {
    margin: 0 0 20px;
    font-size: 16px;
    font-weight: bold;
    color: #303133;
  }
}

.address-info,
.payment-info,
.shipping-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 8px;

  .label {
    color: #606266;
    min-width: 80px;
  }

  .value {
    color: #303133;
    flex: 1;
  }
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-item {
  display: flex;
  gap: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;

  .product-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
  }

  .product-info {
    flex: 1;

    .product-name {
      margin: 0 0 8px;
      font-size: 16px;
      line-height: 1.4;
    }

    .product-specs {
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;

      span {
        margin-right: 12px;
      }
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: 16px;

      .price {
        color: #f56c6c;
        font-weight: bold;
      }

      .quantity {
        color: #666;
      }

      .subtotal {
        color: #f56c6c;
        font-weight: bold;
        margin-left: auto;
      }
    }
  }
}

.amount-info {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .amount-item {
    display: flex;
    justify-content: flex-end;
    gap: 16px;

    .label {
      color: #606266;
    }

    .value {
      color: #303133;
      min-width: 100px;
      text-align: right;

      &.discount {
        color: #f56c6c;
      }
    }

    &.total {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #eee;
      font-size: 16px;
      font-weight: bold;

      .value {
        color: #f56c6c;
        font-size: 20px;
      }
    }
  }
}

:deep(.el-timeline) {
  padding-left: 20px;
}
</style> 
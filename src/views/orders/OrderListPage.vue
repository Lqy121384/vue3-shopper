<template>
  <div class="order-list-page">
    <!-- 订单筛选 -->
    <div class="filter-section">
      <el-form :inline="true" :model="orderStore.filter" class="filter-form">
        <el-form-item label="订单状态">
          <el-select v-model="orderStore.filter.status" placeholder="请选择订单状态" clearable>
            <el-option
              v-for="status in orderStatuses"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="orderStore.filter.paymentMethod" placeholder="请选择支付方式" clearable>
            <el-option
              v-for="method in paymentMethods"
              :key="method.value"
              :label="method.label"
              :value="method.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="orderStore.filter.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 订单列表 -->
    <div class="order-list" v-loading="orderStore.loading">
      <el-empty v-if="!orderStore.loading && orderStore.orders.length === 0" description="暂无订单" />
      
      <template v-else>
        <div v-for="order in orderStore.orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-no">订单号：{{ order.orderNo }}</span>
              <span class="order-time">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="order-status">
              <el-tag :type="getStatusType(order.status)">
                {{ getStatusText(order.status) }}
              </el-tag>
            </div>
          </div>

          <div class="order-content">
            <div class="product-list">
              <div v-for="item in order.items" :key="item.id" class="product-item">
                <img :src="item.image" :alt="item.name" class="product-image" />
                <div class="product-info">
                  <h3 class="product-name">{{ item.name }}</h3>
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

            <div class="order-summary">
              <div class="summary-item">
                <span>商品总额：</span>
                <span>¥{{ order.totalAmount?.toFixed(2) || '--' }}</span>
              </div>
              <div class="summary-item">
                <span>运费：</span>
                <span>¥{{ order.shippingAmount?.toFixed(2) || '--' }}</span>
              </div>
              <div class="summary-item" v-if="order.discountAmount > 0">
                <span>优惠金额：</span>
                <span class="discount">-¥{{ order.discountAmount.toFixed(2) }}</span>
              </div>
              <div class="summary-item total">
                <span>实付金额：</span>
                <span class="total-amount">¥{{ order.finalAmount?.toFixed(2) || '--' }}</span>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-actions">
              <el-button
                v-if="order.status === 'PENDING'"
                type="primary"
                @click="handlePay(order)"
              >
                立即支付
              </el-button>
              <el-button
                v-if="order.status === 'PENDING'"
                @click="handleCancel(order)"
              >
                取消订单
              </el-button>
              <el-button
                v-if="order.status === 'SHIPPED'"
                type="success"
                @click="handleConfirmReceipt(order)"
              >
                确认收货
              </el-button>
              <el-button
                v-if="['COMPLETED', 'CANCELLED'].includes(order.status)"
                @click="handleDelete(order)"
              >
                删除订单
              </el-button>
              <el-button @click="handleViewDetail(order)">查看详情</el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="orderStore.currentPage"
            v-model:page-size="orderStore.pageSize"
            :total="orderStore.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Order, OrderStatus, PaymentMethod } from '@/types/order'
import { useOrderStore } from '@/stores/order'
import {
  getOrderList,
  cancelOrder,
  confirmReceipt,
  deleteOrder
} from '@/api/order'

defineOptions({
  name: 'OrderListPage'
})

const router = useRouter()
const orderStore = useOrderStore()

// 订单状态选项
const orderStatuses = [
  { label: '待付款', value: 'PENDING' },
  { label: '待发货', value: 'PAID' },
  { label: '待收货', value: 'SHIPPED' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' }
]

// 支付方式选项
const paymentMethods = [
  { label: '支付宝', value: 'ALIPAY' },
  { label: '微信支付', value: 'WECHAT' }
]

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// 获取状态类型
const getStatusType = (status: OrderStatus): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  const types: Record<OrderStatus, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    PENDING: 'warning',
    PAID: 'primary',
    SHIPPED: 'info',
    COMPLETED: 'success',
    CANCELLED: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: OrderStatus): string => {
  const texts: Record<OrderStatus, string> = {
    PENDING: '待付款',
    PAID: '待发货',
    SHIPPED: '待收货',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return texts[status] || '未知状态'
}

// 处理搜索
const handleSearch = () => {
  orderStore.currentPage = 1
  orderStore.fetchOrders()
}

// 处理重置
const handleReset = () => {
  orderStore.updateFilter({
    status: '',
    paymentMethod: '',
    dateRange: []
  })
  handleSearch()
}

// 处理分页
const handlePageChange = (page: number) => {
  orderStore.updatePagination(page, orderStore.pageSize)
  orderStore.fetchOrders()
}

const handleSizeChange = (size: number) => {
  orderStore.updatePagination(orderStore.currentPage, size)
  orderStore.fetchOrders()
}

// 处理支付
const handlePay = (order: Order) => {
  router.push(`/payment/${order.id}`)
}

// 处理取消订单
const handleCancel = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      type: 'warning'
    })
    await cancelOrder(order.id)
    ElMessage.success('订单已取消')
    orderStore.fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

// 处理确认收货
const handleConfirmReceipt = async (order: Order) => {
  try {
    await confirmReceipt(order.id)
    ElMessage.success('确认收货成功')
    await orderStore.fetchOrders()
  } catch (error) {
    console.error('确认收货失败:', error)
    ElMessage.error('确认收货失败')
  }
}

// 处理删除订单
const handleDelete = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
      type: 'warning'
    })
    await deleteOrder(order.id)
    ElMessage.success('订单已删除')
    orderStore.fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除订单失败:', error)
      ElMessage.error('删除订单失败')
    }
  }
}

// 处理查看详情
const handleViewDetail = (order: Order) => {
  router.push(`/orders/${order.id}`)
}

// 生命周期钩子
onMounted(() => {
  orderStore.fetchOrders()
})
</script>

<style scoped>
.order-list-page {
  padding: 20px;
}

.filter-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;

  .order-info {
    display: flex;
    gap: 20px;
    color: #606266;

    .order-time {
      color: #909399;
    }
  }
}

.order-content {
  padding: 20px;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
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

.order-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  padding-top: 20px;
  border-top: 1px solid #eee;

  .summary-item {
    color: #606266;

    .discount {
      color: #f56c6c;
    }

    &.total {
      margin-top: 8px;
      font-size: 16px;
      font-weight: bold;
      color: #303133;

      .total-amount {
        color: #f56c6c;
        font-size: 20px;
      }
    }
  }
}

.order-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;

  .order-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 
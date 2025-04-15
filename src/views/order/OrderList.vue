<template>
  <div class="order-list">
    <h2>我的订单</h2>

    <!-- 订单状态筛选 -->
    <div class="order-filter">
      <el-radio-group v-model="currentStatus" @change="handleStatusChange">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button :value="OrderStatus.PENDING">待付款</el-radio-button>
        <el-radio-button :value="OrderStatus.PAID">待发货</el-radio-button>
        <el-radio-button :value="OrderStatus.SHIPPED">待收货</el-radio-button>
        <el-radio-button :value="OrderStatus.COMPLETED">已完成</el-radio-button>
        <el-radio-button :value="OrderStatus.CANCELLED">已取消</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 订单列表 -->
    <div class="order-items">
      <el-empty v-if="orders.length === 0" description="暂无订单" />
      <div v-else class="order-item" v-for="order in orders" :key="order.id">
        <div class="order-header">
          <div class="order-info">
            <span class="order-no">订单号：{{ order.orderNumber }}</span>
            <span class="order-time">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="order-status">
            {{ getStatusText(order.status) }}
          </div>
        </div>

        <div class="order-content">
          <div class="product-list">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="product-item"
            >
              <img :src="item.product.image" :alt="item.product.name" class="product-image" />
              <div class="product-info">
                <h3>{{ item.product.name }}</h3>
                <p class="description">{{ item.product.description }}</p>
                <div class="product-meta">
                  <span class="price">¥{{ item.price }}</span>
                  <span class="quantity">x{{ item.quantity }}</span>
                  <span class="subtotal">小计：¥{{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              共{{ getTotalQuantity(order) }}件商品，
              实付金额：<span class="amount">¥{{ order.totalAmount.toFixed(2) }}</span>
            </div>
            <div class="order-actions">
              <el-button
                v-if="order.status === OrderStatus.PENDING_PAYMENT"
                type="primary"
                @click="handlePay(order)"
              >
                立即支付
              </el-button>
              <el-button
                v-if="order.status === OrderStatus.PENDING_PAYMENT"
                @click="handleCancel(order)"
              >
                取消订单
              </el-button>
              <el-button
                v-if="order.status === OrderStatus.SHIPPED"
                type="primary"
                @click="handleConfirmReceive(order)"
              >
                确认收货
              </el-button>
              <el-button
                v-if="order.status === OrderStatus.DELIVERED"
                @click="handleDelete(order)"
              >
                删除订单
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import type { Order } from '@/types/product'
import { OrderStatus, ShippingMethod } from '@/types/product'

const router = useRouter()

// 订单状态
const currentStatus = ref<OrderStatus | ''>('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 订单列表
const orders = ref<Order[]>([])

// 模拟订单数据
const mockOrder: Order = {
  id: 1,
  userId: 1,
  orderNumber: 'ORD20240101001',
  status: OrderStatus.PENDING_PAYMENT,
  totalAmount: 299.99,
  items: [
    {
      id: 1,
      orderId: 1,
      productId: 1,
      quantity: 2,
      price: 149.99,
      product: {
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
    }
  ],
  address: {
    id: 1,
    userId: 1,
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '海淀区',
    address: '清华大学',
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  shippingMethod: ShippingMethod.EXPRESS,
  shippingFee: 10,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

// 获取状态文本
const statusMap: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: '待付款',
  [OrderStatus.PAID]: '待发货',
  [OrderStatus.SHIPPED]: '待收货',
  [OrderStatus.DELIVERED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消'
}

const getStatusText = (status: OrderStatus) => {
  return statusMap[status]
}

const getStatusType = (status: OrderStatus): 'info' | 'warning' | 'success' | 'danger' => {
  switch (status) {
    case OrderStatus.PENDING_PAYMENT:
      return 'warning'
    case OrderStatus.PAID:
      return 'info'
    case OrderStatus.SHIPPED:
      return 'info'
    case OrderStatus.DELIVERED:
      return 'success'
    case OrderStatus.CANCELLED:
      return 'danger'
    default:
      return 'info'
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 计算订单总数量
const getTotalQuantity = (order: Order) => {
  return order.items.reduce((total, item) => total + item.quantity, 0)
}

// 获取订单列表
const fetchOrders = async () => {
  try {
    // 这里应该调用实际的API
    // 模拟数据
    orders.value = [mockOrder]
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  }
}

// 处理状态变化
const handleStatusChange = () => {
  currentPage.value = 1
  fetchOrders()
}

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchOrders()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchOrders()
}

// 处理支付
const handlePay = (order: Order) => {
  router.push(`/order/payment?orderNo=${order.orderNumber}`)
}

// 处理取消订单
const handleCancel = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '提示', {
      type: 'warning'
    })
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch {
    // 用户取消操作
  }
}

// 处理确认收货
const handleConfirmReceive = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '提示', {
      type: 'warning'
    })
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('确认收货成功')
    fetchOrders()
  } catch {
    // 用户取消操作
  }
}

// 处理删除订单
const handleDelete = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要删除这个订单吗？', '提示', {
      type: 'warning'
    })
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('订单已删除')
    fetchOrders()
  } catch {
    // 用户取消操作
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped lang="scss">
.order-list {
  padding: 20px;

  h2 {
    margin: 0 0 20px;
  }

  .order-filter {
    margin-bottom: 20px;
  }

  .order-items {
    .order-item {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      overflow: hidden;

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: #f5f7fa;
        border-bottom: 1px solid #ebeef5;

        .order-info {
          .order-no {
            margin-right: 20px;
            color: #606266;
          }

          .order-time {
            color: #909399;
          }
        }

        .order-status {
          color: #f56c6c;
          font-weight: bold;
        }
      }

      .order-content {
        padding: 20px;

        .product-list {
          .product-item {
            display: flex;
            gap: 20px;
            padding: 10px 0;
            border-bottom: 1px solid #ebeef5;

            &:last-child {
              border-bottom: none;
            }

            .product-image {
              width: 80px;
              height: 80px;
              object-fit: cover;
              border-radius: 4px;
            }

            .product-info {
              flex: 1;

              h3 {
                margin: 0 0 8px;
                font-size: 16px;
              }

              .description {
                color: #909399;
                margin: 0 0 8px;
                font-size: 14px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }

              .product-meta {
                display: flex;
                align-items: center;
                gap: 20px;

                .price {
                  color: #f56c6c;
                  font-weight: bold;
                }

                .quantity {
                  color: #909399;
                }

                .subtotal {
                  color: #f56c6c;
                  font-weight: bold;
                }
              }
            }
          }
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #ebeef5;

          .order-total {
            color: #606266;

            .amount {
              color: #f56c6c;
              font-size: 20px;
              font-weight: bold;
            }
          }

          .order-actions {
            display: flex;
            gap: 10px;
          }
        }
      }
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 
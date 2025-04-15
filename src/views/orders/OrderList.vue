<template>
  <div class="order-list">
    <div class="order-header">
      <h2>我的订单</h2>
      <div class="order-filter">
        <el-select v-model="filter.status" placeholder="订单状态" clearable>
          <el-option label="全部" value="" />
          <el-option label="待付款" value="PENDING" />
          <el-option label="待发货" value="PAID" />
          <el-option label="待收货" value="SHIPPED" />
          <el-option label="已完成" value="COMPLETED" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select>
      </div>
    </div>

    <div class="order-content">
      <el-table
        v-loading="loading"
        :data="orderStore.orders"
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column label="商品信息">
          <template #default="{ row }">
            <div class="order-items">
              <div v-for="item in row.items" :key="item.id" class="order-item">
                <el-image
                  :src="item.image"
                  :alt="item.name"
                  class="item-image"
                />
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-specs">
                    <span v-for="(value, key) in item.specs" :key="key">
                      {{ key }}: {{ value }}
                    </span>
                  </div>
                  <div class="item-price">
                    ¥{{ item.price }} × {{ item.quantity }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="{ row }">
            ¥{{ row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'PENDING'"
              type="primary"
              size="small"
              @click="handlePay(row)"
            >
              立即付款
            </el-button>
            <el-button
              v-if="row.status === 'SHIPPED'"
              type="success"
              size="small"
              @click="handleConfirmReceive(row)"
            >
              确认收货
            </el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              type="danger"
              size="small"
              @click="handleCancel(row)"
            >
              取消订单
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import type { Order, OrderStatus } from '@/types/order'

const router = useRouter()
const orderStore = useOrderStore()

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const filter = ref({
  status: '' as OrderStatus | '',
  paymentMethod: '',
  dateRange: [] as string[]
})

// 订单状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '待付款', value: 'PENDING' },
  { label: '待发货', value: 'PAID' },
  { label: '待收货', value: 'SHIPPED' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' }
]

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    await orderStore.fetchOrders()
    total.value = orderStore.total
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 处理状态筛选
const handleStatusChange = async (status: OrderStatus | '') => {
  orderStore.updateFilter({ status })
  await loadOrders()
}

// 处理分页变化
const handlePageChange = async (page: number) => {
  orderStore.updatePagination(page, orderStore.pageSize)
  await loadOrders()
}

// 处理支付订单
const handlePay = async (order: Order) => {
  try {
    const success = await orderStore.handlePayOrder(order.id)
    if (success) {
      ElMessage.success('支付成功')
      await loadOrders()
    }
  } catch (error) {
    ElMessage.error('支付失败')
  }
}

// 处理确认收货
const handleConfirmReceive = async (order: Order) => {
  try {
    const success = await orderStore.handleConfirmReceive(order.id)
    if (success) {
      ElMessage.success('确认收货成功')
      await loadOrders()
    }
  } catch (error) {
    ElMessage.error('确认收货失败')
  }
}

// 处理取消订单
const handleCancel = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const success = await orderStore.handleCancelOrder(order.id)
    if (success) {
      ElMessage.success('取消订单成功')
      await loadOrders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消订单失败')
    }
  }
}

// 查看订单详情
const handleViewDetail = (order: Order) => {
  router.push(`/orders/${order.id}`)
}

// 获取状态类型
const getStatusType = (status: OrderStatus): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  const statusMap: Record<OrderStatus, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    PENDING: 'warning',
    PAID: 'primary',
    SHIPPED: 'success',
    COMPLETED: 'info',
    CANCELLED: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    PENDING: '待付款',
    PAID: '待发货',
    SHIPPED: '待收货',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadOrders()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadOrders()
}

// 初始化加载
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-list {
  padding: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.order-filter {
  display: flex;
  gap: 10px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item {
  display: flex;
  gap: 10px;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.item-name {
  font-weight: bold;
}

.item-specs {
  color: #666;
  font-size: 12px;
}

.item-price {
  color: #f56c6c;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 
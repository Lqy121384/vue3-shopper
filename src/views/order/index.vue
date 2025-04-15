<template>
  <div class="order-container">
    <!-- 订单筛选 -->
    <el-card class="filter-card">
      <div class="filter-header">
        <h3>订单筛选</h3>
        <el-button type="primary" link @click="showAdvancedSearch = !showAdvancedSearch">
          {{ showAdvancedSearch ? '收起高级搜索' : '展开高级搜索' }}
        </el-button>
      </div>
      <el-form :inline="true" :model="orderFilter" class="filter-form">
        <el-form-item label="订单号">
          <el-input
            v-model="orderFilter.orderNumber"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="searchOrders"
            @input="getSearchSuggestions"
          >
            <template #suffix>
              <el-icon class="search-icon" @click="searchOrders"><Search /></el-icon>
            </template>
          </el-input>
          <!-- 搜索建议 -->
          <div v-if="showSuggestions && searchSuggestions.length > 0" class="suggestions-dropdown">
            <div
              v-for="(suggestion, index) in searchSuggestions"
              :key="index"
              class="suggestion-item"
              @click="useSuggestion(suggestion)"
            >
              {{ suggestion }}
            </div>
          </div>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input
            v-model="orderFilter.productName"
            placeholder="请输入商品名称"
            clearable
            @keyup.enter="searchOrders"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="orderFilter.status" placeholder="全部状态" clearable>
            <el-option
              v-for="item in orderStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input-number
            v-model="orderFilter.minAmount"
            :min="0"
            :precision="2"
            placeholder="最低金额"
            class="amount-input"
          />
          <span class="separator">-</span>
          <el-input-number
            v-model="orderFilter.maxAmount"
            :min="0"
            :precision="2"
            placeholder="最高金额"
            class="amount-input"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="isLoading" @click="searchOrders">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button :disabled="isLoading" @click="resetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 高级搜索 -->
      <div v-if="showAdvancedSearch" class="advanced-search">
        <el-divider>高级搜索</el-divider>
        <el-form :inline="true" :model="advancedFilter" class="filter-form">
          <el-form-item label="支付方式">
            <el-select v-model="advancedFilter.paymentMethod" placeholder="请选择支付方式" clearable>
              <el-option
                v-for="method in Object.values(PaymentMethod)"
                :key="method"
                :label="getPaymentMethodText(method)"
                :value="method"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="配送方式">
            <el-select v-model="advancedFilter.shippingMethod" placeholder="请选择配送方式" clearable>
              <el-option
                v-for="method in Object.values(ShippingMethod)"
                :key="method"
                :label="getShippingMethodText(method)"
                :value="method"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="商品数量">
            <el-input-number
              v-model="advancedFilter.minQuantity"
              :min="1"
              placeholder="最小数量"
              class="quantity-input"
            />
            <span class="separator">-</span>
            <el-input-number
              v-model="advancedFilter.maxQuantity"
              :min="1"
              placeholder="最大数量"
              class="quantity-input"
            />
          </el-form-item>
          
          <el-form-item label="评价状态">
            <el-select v-model="advancedFilter.hasReview" placeholder="请选择评价状态" clearable>
              <el-option label="已评价" :value="true" />
              <el-option label="未评价" :value="false" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="物流状态">
            <el-select v-model="advancedFilter.hasTracking" placeholder="请选择物流状态" clearable>
              <el-option label="有物流信息" :value="true" />
              <el-option label="无物流信息" :value="false" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="applyAdvancedSearch">应用</el-button>
            <el-button @click="resetAdvancedFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 搜索历史 -->
      <div v-if="searchHistory.length > 0" class="search-history">
        <div class="history-header">
          <span>搜索历史</span>
          <el-button type="primary" link @click="clearSearchHistory">清空</el-button>
        </div>
        <div class="history-tags">
          <el-tag
            v-for="(keyword, index) in searchHistory"
            :key="index"
            closable
            @click="orderFilter.orderNumber = keyword; searchOrders()"
            @close="searchHistory.splice(index, 1)"
          >
            {{ keyword }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="order-list-card">
      <template #header>
        <div class="card-header">
          <span>我的订单</span>
          <el-button type="primary" link @click="refreshOrders" :loading="isLoading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部订单" name="all" />
        <el-tab-pane label="待付款" name="pending" />
        <el-tab-pane label="待发货" name="paid" />
        <el-tab-pane label="待收货" name="shipped" />
        <el-tab-pane label="已完成" name="completed" />
        <el-tab-pane label="已取消" name="cancelled" />
      </el-tabs>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <el-skeleton :rows="3" animated />
        <el-skeleton :rows="3" animated />
        <el-skeleton :rows="3" animated />
      </div>

      <!-- 空状态 -->
      <el-empty
        v-else-if="orders.length === 0"
        :image="emptyImage"
        :description="emptyDescription"
      >
        <template #image>
          <el-icon class="empty-icon"><ShoppingCart /></el-icon>
        </template>
        <template #description>
          <p>{{ emptyDescription }}</p>
          <el-button type="primary" @click="goShopping">去购物</el-button>
        </template>
      </el-empty>

      <!-- 订单列表 -->
      <div v-else class="order-list">
        <div v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">订单号: {{ order.orderNumber }}</span>
              <span class="order-date">下单时间: {{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="order-status">
              <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
            </div>
          </div>

          <div class="order-products">
            <div v-for="item in order.items" :key="item.id" class="product-item">
              <div class="product-image" @click="navigateToProduct(item.productId)">
                <el-image :src="item.product.image" :alt="item.product.name" fit="cover" />
              </div>
              <div class="product-info">
                <div class="product-name" @click="navigateToProduct(item.productId)">
                  {{ item.product.name }}
                </div>
                <div class="product-price-qty">
                  <span class="product-price">¥{{ item.price }}</span>
                  <span class="product-quantity">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-amount">
              <span>共{{ getTotalQuantity(order) }}件商品，总计：</span>
              <span class="total-amount">¥{{ order.totalAmount }}</span>
              <span class="shipping-fee">(含运费: ¥{{ order.shippingFee }})</span>
            </div>
            <div class="order-actions">
              <el-button 
                v-if="order.status === OrderStatus.PENDING_PAYMENT" 
                type="primary" 
                @click="payOrder(order)"
              >去支付</el-button>
              <el-button 
                v-if="order.status === OrderStatus.SHIPPED" 
                type="success" 
                @click="confirmReceive(order)"
              >确认收货</el-button>
              <el-button 
                v-if="order.status === OrderStatus.DELIVERED" 
                type="primary" 
                @click="reviewOrder(order)"
              >评价</el-button>
              <el-button 
                v-if="order.status === OrderStatus.PENDING_PAYMENT" 
                type="danger" 
                @click="cancelOrder(order)"
              >取消订单</el-button>
              <el-button 
                v-if="[OrderStatus.DELIVERED].includes(order.status)" 
                @click="buyAgain(order)"
              >再次购买</el-button>
              <el-button @click="viewOrderDetail(order)">订单详情</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="!isLoading && orders.length > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalOrders"
          :disabled="isLoading"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="orderDetailVisible" title="订单详情" width="700px">
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions title="订单信息" :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.orderNumber }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">{{ getStatusText(currentOrder.status) }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ currentOrder?.paymentMethod ? getPaymentMethodText(currentOrder.paymentMethod) : '' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-descriptions title="收货信息" :column="1" border>
          <el-descriptions-item label="收货人">
            {{ currentOrder.address.name }} {{ currentOrder.address.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="收货地址">
            {{ formatAddress(currentOrder.address) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-descriptions title="配送信息" :column="2" border>
          <el-descriptions-item label="配送方式">{{ getShippingMethodText(currentOrder.shippingMethod) }}</el-descriptions-item>
          <el-descriptions-item label="运费">¥{{ currentOrder.shippingFee }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <h3>商品信息</h3>
        <el-table :data="currentOrder.items" style="width: 100%">
          <el-table-column label="商品图片" width="80">
            <template #default="scope">
              <el-image 
                :src="scope.row.product.image" 
                :alt="scope.row.product.name"
                style="width: 60px; height: 60px"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="scope">
              ¥{{ scope.row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column label="小计" width="120">
            <template #default="scope">
              ¥{{ scope.row.subtotal }}
            </template>
          </el-table-column>
        </el-table>

        <div class="order-summary">
          <div class="summary-item">
            <span>商品总价：</span>
            <span>¥{{ calculateProductTotal(currentOrder) }}</span>
          </div>
          <div class="summary-item">
            <span>运费：</span>
            <span>¥{{ currentOrder.shippingFee }}</span>
          </div>
          <div class="summary-item total">
            <span>订单总计：</span>
            <span>¥{{ currentOrder.totalAmount }}</span>
          </div>
        </div>

        <div v-if="currentOrder.remark" class="order-remark">
          <h3>订单备注</h3>
          <p>{{ currentOrder.remark }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- 物流跟踪对话框 -->
    <el-dialog v-model="trackingDialogVisible" title="物流跟踪" width="600px">
      <div v-if="trackingInfo.length > 0" class="tracking-info">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in trackingInfo"
            :key="index"
            :timestamp="activity.time"
            type="primary"
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
      <el-empty v-else description="暂无物流信息" />
    </el-dialog>

    <!-- 评价对话框 -->
    <el-dialog v-model="reviewDialogVisible" title="订单评价" width="600px">
      <div v-if="currentOrder" class="review-form">
        <div v-for="item in currentOrder.items" :key="item.id" class="review-item">
          <div class="product-info">
            <el-image :src="item.product.image" :alt="item.product.name" class="product-image" fit="cover" />
            <span class="product-name">{{ item.product.name }}</span>
          </div>
          
          <div class="rating-section">
            <div class="rating-label">商品评分：</div>
            <el-rate v-model="reviewForms[item.id].rating" />
          </div>
          
          <div class="content-section">
            <el-input
              v-model="reviewForms[item.id].content"
              type="textarea"
              :rows="3"
              placeholder="请输入您对商品的评价"
            />
          </div>
          
          <div class="image-upload-section">
            <div class="upload-label">上传图片：</div>
            <el-upload
              action="/api/upload"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :on-success="(res) => handleUploadSuccess(res, item.id)"
              :limit="5"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </div>
          
          <el-divider v-if="item.id !== currentOrder.items[currentOrder.items.length - 1].id" />
        </div>
        
        <div class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview">提交评价</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="OrderList">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, ShoppingCart, Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { OrderStatus, PaymentMethod, ShippingMethod, type Order, type OrderItem, type OrderFilter } from '@/types/order'
import type { Address } from '@/types/address'
import type { Product } from '@/types/product'
import type { UploadFile, UploadFiles } from 'element-plus'
import dayjs from 'dayjs'
import type { FormItemRule } from 'element-plus'
import type { DateModelType } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 订单列表数据
const orders = ref<Order[]>([])
const totalOrders = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)

// 当前选中的标签页
const activeTab = ref('all')

// 订单筛选条件
const orderFilter = reactive<OrderFilter>({
  status: undefined,
  startDate: undefined,
  endDate: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  orderNumber: undefined,
  productName: undefined
})

// 日期范围
const dateRange = ref()

// 订单状态选项
const orderStatusOptions = [
  { label: '待付款', value: OrderStatus.PENDING_PAYMENT },
  { label: '已付款', value: OrderStatus.PAID },
  { label: '已发货', value: OrderStatus.SHIPPED },
  { label: '已送达', value: OrderStatus.DELIVERED },
  { label: '已取消', value: OrderStatus.CANCELLED }
]

// 订单详情相关
const orderDetailVisible = ref(false)
const currentOrder = ref<Order | null>(null)

// 物流跟踪相关
const trackingDialogVisible = ref(false)
const trackingInfo = ref<{ time: string; content: string }[]>([])

// 评价相关
const reviewDialogVisible = ref(false)
const reviewForms = reactive<Record<number, { rating: number; content: string; images: string[] }>>({})
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 空状态相关
const emptyImage = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return 'https://example.com/pending.png'
    case 'paid':
      return 'https://example.com/paid.png'
    case 'shipped':
      return 'https://example.com/shipped.png'
    case 'completed':
      return 'https://example.com/completed.png'
    case 'cancelled':
      return 'https://example.com/cancelled.png'
    default:
      return 'https://example.com/empty.png'
  }
})

const emptyDescription = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return '暂无待付款订单'
    case 'paid':
      return '暂无待发货订单'
    case 'shipped':
      return '暂无待收货订单'
    case 'completed':
      return '暂无已完成订单'
    case 'cancelled':
      return '暂无已取消订单'
    default:
      return '暂无订单'
  }
})

// 高级搜索相关
const showAdvancedSearch = ref(false)
const advancedFilter = reactive({
  paymentMethod: undefined,
  shippingMethod: undefined,
  minQuantity: undefined,
  maxQuantity: undefined,
  hasReview: undefined,
  hasTracking: undefined
})

// 搜索历史记录
const searchHistory = ref<string[]>([])
const MAX_HISTORY = 10

// 搜索建议
const searchSuggestions = ref<string[]>([])
const showSuggestions = ref(false)

// 初始化搜索历史
const initSearchHistory = () => {
  const history = localStorage.getItem('orderSearchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史
const saveSearchHistory = (keyword: string) => {
  if (!keyword.trim()) return
  
  // 移除已存在的相同关键词
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  
  // 添加到开头
  searchHistory.value.unshift(keyword)
  
  // 限制历史记录数量
  if (searchHistory.value.length > MAX_HISTORY) {
    searchHistory.value.pop()
  }
  
  // 保存到本地存储
  localStorage.setItem('orderSearchHistory', JSON.stringify(searchHistory.value))
}

// 清除搜索历史
const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('orderSearchHistory')
}

// 获取搜索建议
const getSearchSuggestions = async (keyword: string) => {
  if (!keyword.trim()) {
    searchSuggestions.value = []
    showSuggestions.value = false
    return
  }
  
  try {
    // 这里应该调用实际的API获取搜索建议
    // const { data } = await orderApi.getSearchSuggestions(keyword)
    
    // 模拟搜索建议数据
    searchSuggestions.value = [
      `${keyword} - 待付款`,
      `${keyword} - 已发货`,
      `${keyword} - 已完成`
    ]
    showSuggestions.value = true
  } catch (error) {
    console.error('获取搜索建议失败:', error)
  }
}

// 使用搜索建议
const useSuggestion = (suggestion: string) => {
  orderFilter.orderNumber = suggestion
  showSuggestions.value = false
  searchOrders()
}

// 重置高级搜索
const resetAdvancedFilter = () => {
  Object.keys(advancedFilter).forEach(key => {
    advancedFilter[key as keyof typeof advancedFilter] = undefined
  })
}

// 应用高级搜索
const applyAdvancedSearch = () => {
  // 合并高级搜索条件
  Object.assign(orderFilter, advancedFilter)
  showAdvancedSearch.value = false
  searchOrders()
}

// 获取订单列表
const fetchOrders = async () => {
  try {
    isLoading.value = true
    
    // 构建请求参数
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...orderFilter
    }
    
    // 发送请求获取订单列表
    // 这里应该调用实际的API
    // const { data } = await orderApi.getOrders(params)
    
    // 模拟数据
    setTimeout(() => {
      orders.value = Array.from({ length: 5 }, (_, i) => ({
        ...mockOrder,
        id: i + 1,
        orderNumber: `ORD${Date.now().toString().slice(-8)}${i}`,
        status: [
          OrderStatus.PENDING_PAYMENT,
          OrderStatus.PAID,
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED,
          OrderStatus.CANCELLED
        ][i % 5],
        totalAmount: Math.floor(Math.random() * 500) + 50,
        items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
          ...mockOrder.items[0],
          id: i * 10 + j + 1,
          orderId: i + 1,
          productId: j + 1,
          quantity: Math.floor(Math.random() * 5) + 1,
          price: Math.floor(Math.random() * 50) + 10
        }))
      }))
      
      totalOrders.value = 28
      isLoading.value = false
    }, 500)
  } catch (error) {
    console.error('获取订单列表失败', error)
    ElMessage.error('获取订单列表失败')
    isLoading.value = false
  }
}

// 处理日期范围变化
const handleDateChange = (dates: any) => {
  if (dates) {
    orderFilter.startDate = dayjs(dates[0]).format('YYYY-MM-DD')
    orderFilter.endDate = dayjs(dates[1]).format('YYYY-MM-DD')
  } else {
    orderFilter.startDate = undefined
    orderFilter.endDate = undefined
  }
}

// 搜索订单
const searchOrders = () => {
  currentPage.value = 1
  fetchOrders()
}

// 重置筛选条件
const resetFilter = () => {
  Object.keys(orderFilter).forEach(key => {
    orderFilter[key as keyof OrderFilter] = undefined
  })
  dateRange.value = null
  currentPage.value = 1
  fetchOrders()
}

// 处理标签页点击
const handleTabClick = () => {
  switch (activeTab.value) {
    case 'all':
      orderFilter.status = undefined
      break
    case 'pending':
      orderFilter.status = OrderStatus.PENDING_PAYMENT
      break
    case 'paid':
      orderFilter.status = OrderStatus.PAID
      break
    case 'shipped':
      orderFilter.status = OrderStatus.SHIPPED
      break
    case 'completed':
      orderFilter.status = OrderStatus.DELIVERED
      break
    case 'cancelled':
      orderFilter.status = OrderStatus.CANCELLED
      break
  }
  currentPage.value = 1
  fetchOrders()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchOrders()
}

// 处理每页数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchOrders()
}

// 获取订单状态文本
const getStatusText = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING_PAYMENT]: '待付款',
    [OrderStatus.PAID]: '待发货',
    [OrderStatus.SHIPPED]: '待收货',
    [OrderStatus.DELIVERED]: '已送达',
    [OrderStatus.CANCELLED]: '已取消'
  }
  return statusMap[status]
}

// 获取订单状态类型
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

// 获取支付方式文本
const getPaymentMethodText = (method: PaymentMethod) => {
  const methodMap: Record<PaymentMethod, string> = {
    [PaymentMethod.ALIPAY]: '支付宝',
    [PaymentMethod.WECHAT_PAY]: '微信支付',
    [PaymentMethod.CREDIT_CARD]: '信用卡'
  }
  return methodMap[method]
}

// 获取配送方式文本
const getShippingMethodText = (method: ShippingMethod) => {
  const methodMap: Record<ShippingMethod, string> = {
    [ShippingMethod.EXPRESS]: '快递',
    [ShippingMethod.STANDARD]: '标准',
    [ShippingMethod.ECONOMY]: '经济'
  }
  return methodMap[method]
}

// 格式化日期
const formatDate = (date?: string) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 格式化地址
const formatAddress = (address: Address) => {
  return `${address.province} ${address.city} ${address.district} ${address.detail}`
}

// 获取订单商品总数量
const getTotalQuantity = (order: Order) => {
  return order.items.reduce((total, item) => total + item.quantity, 0)
}

// 计算商品总价（不含运费）
const calculateProductTotal = (order: Order) => {
  return order.totalAmount - order.shippingFee
}

// 查看订单详情
const viewOrderDetail = (order: Order) => {
  currentOrder.value = order
  orderDetailVisible.value = true
}

// 支付订单
const payOrder = (order: Order) => {
  ElMessageBox.confirm('确定要支付该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 发送请求支付订单
    // 这里应该调用实际的API
    // await orderApi.payOrder(order.id)
    
    // 模拟成功
    ElMessage.success('支付成功')
    // 刷新订单列表
    fetchOrders()
  }).catch(() => {
    // 用户取消操作
  })
}

// 确认收货
const confirmReceive = (order: Order) => {
  ElMessageBox.confirm('确认已收到商品吗？', '提示', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 发送请求确认收货
    // 这里应该调用实际的API
    // await orderApi.confirmReceive(order.id)
    
    // 模拟成功
    ElMessage.success('确认收货成功')
    // 刷新订单列表
    fetchOrders()
  }).catch(() => {
    // 用户取消操作
  })
}

// 取消订单
const cancelOrder = (order: Order) => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 发送请求取消订单
    // 这里应该调用实际的API
    // await orderApi.cancelOrder(order.id)
    
    // 模拟成功
    ElMessage.success('订单已取消')
    // 刷新订单列表
    fetchOrders()
  }).catch(() => {
    // 用户取消操作
  })
}

// 再次购买
const buyAgain = (order: Order) => {
  router.push(`/order/confirm?orderId=${order.id}`)
}

// 查看物流跟踪
const trackShipment = async (order: Order) => {
  if (!order.trackingNumber) {
    ElMessage.warning('暂无物流单号')
    return
  }

  try {
    // 这里应该调用实际的API
    // const { data } = await orderApi.getTrackingInfo(order.trackingNumber)
    
    // 模拟物流数据
    trackingInfo.value = [
      {
        time: '2024-03-20 14:30',
        content: '快件已签收，签收人：前台代签'
      },
      {
        time: '2024-03-20 09:15',
        content: '快件已到达【北京市海淀区清华园营业点】'
      },
      {
        time: '2024-03-19 20:30',
        content: '快件已到达【北京市转运中心】'
      },
      {
        time: '2024-03-19 15:20',
        content: '快件已从【上海市转运中心】发出'
      },
      {
        time: '2024-03-19 10:00',
        content: '快件已到达【上海市转运中心】'
      },
      {
        time: '2024-03-19 08:30',
        content: '快件已从【上海市浦东新区陆家嘴营业点】发出'
      }
    ]
    
    trackingDialogVisible.value = true
  } catch (error) {
    console.error('获取物流信息失败:', error)
    ElMessage.error('获取物流信息失败')
  }
}

// 打开评价对话框
const reviewOrder = (order: Order) => {
  currentOrder.value = order
  // 初始化评价表单
  order.items.forEach(item => {
    reviewForms[item.id] = {
      rating: 5,
      content: '',
      images: []
    }
  })
  reviewDialogVisible.value = true
}

// 处理图片预览
const handlePictureCardPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url || ''
  dialogVisible.value = true
}

// 处理图片移除
const handleRemove = (file: UploadFile, uploadFiles: UploadFiles) => {
  const index = uploadFiles.indexOf(file)
  if (index !== -1) {
    uploadFiles.splice(index, 1)
  }
}

// 处理图片上传成功
const handleUploadSuccess = (res: any, itemId: number) => {
  if (res.code === 0 && res.data?.url) {
    reviewForms[itemId].images.push(res.data.url)
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败')
  }
}

// 提交评价
const submitReview = async () => {
  if (!currentOrder.value) return

  try {
    // 验证评价表单
    for (const item of currentOrder.value.items) {
      const form = reviewForms[item.id]
      if (!form.content.trim()) {
        ElMessage.warning('请填写评价内容')
        return
      }
    }

    // 这里应该调用实际的API
    // await orderApi.submitReview(currentOrder.value.id, reviewForms)

    // 模拟成功
    ElMessage.success('评价提交成功')
    reviewDialogVisible.value = false
    // 刷新订单列表
    fetchOrders()
  } catch (error) {
    console.error('提交评价失败:', error)
    ElMessage.error('提交评价失败')
  }
}

// 导航到商品详情
const navigateToProduct = (productId: number) => {
  router.push(`/product/${productId}`)
}

// 刷新订单列表
const refreshOrders = () => {
  fetchOrders()
}

// 去购物
const goShopping = () => {
  router.push('/products')
}

// 监听筛选条件变化
watch(
  () => ({ ...orderFilter }),
  () => {
    // 当筛选条件变化时，重置页码并重新获取数据
    currentPage.value = 1
    fetchOrders()
  },
  { deep: true }
)

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-header {
  margin-bottom: 20px;
}

.filter-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.filter-form :deep(.el-input),
.filter-form :deep(.el-select),
.filter-form :deep(.el-date-picker) {
  width: 200px;
}

.amount-input {
  width: 120px;
}

.separator {
  margin: 0 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-container {
  padding: 20px;
}

.order-list {
  margin-top: 20px;
}

.order-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.order-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.order-info {
  display: flex;
  gap: 20px;
}

.order-number {
  color: #606266;
  font-weight: 500;
}

.order-date {
  color: #909399;
}

.order-products {
  padding: 15px;
}

.product-item {
  display: flex;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-image:hover img {
  transform: scale(1.05);
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  cursor: pointer;
}

.product-name:hover {
  color: #409eff;
}

.product-price-qty {
  display: flex;
  justify-content: space-between;
  color: #909399;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-top: 1px solid #ebeef5;
}

.order-amount {
  color: #606266;
}

.total-amount {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 500;
  margin: 0 8px;
}

.shipping-fee {
  color: #909399;
  font-size: 12px;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.empty-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

:deep(.el-skeleton) {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 20px;
}

:deep(.el-skeleton__item) {
  background-color: #f5f7fa;
}

:deep(.el-skeleton__p) {
  margin: 0;
}

.advanced-search {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.quantity-input {
  width: 120px;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.suggestion-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
}

.search-history {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tags .el-tag {
  cursor: pointer;
}

.search-icon {
  cursor: pointer;
  color: #909399;
}

.search-icon:hover {
  color: #409eff;
}
</style>
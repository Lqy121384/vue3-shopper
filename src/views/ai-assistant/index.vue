<template>
  <div class="ai-assistant-page">
    <el-card class="assistant-card">
      <template #header>
        <div class="card-header">
          <h2>智能助手</h2>
          <el-button type="primary" link @click="clearMessages">
            <el-icon><Delete /></el-icon>
            清空对话
          </el-button>
        </div>
      </template>

      <!-- 消息列表 -->
      <div class="message-list" ref="messageList">
        <div v-for="(message, index) in messages" :key="index" 
             :class="['message', message.type === 'user' ? 'user' : 'assistant']">
          <div class="avatar">
            <el-avatar :size="40" :src="message.type === 'user' ? userAvatar : assistantAvatar" />
          </div>
          <div class="content">
            <div class="text">{{ message.content }}</div>
            <!-- 商品推荐 -->
            <div v-if="message.products" class="product-list">
              <el-card v-for="product in message.products" :key="product.id" class="product-card">
                <img :src="product.image" :alt="product.name" class="product-image">
                <div class="product-info">
                  <h4>{{ product.name }}</h4>
                  <p class="price">¥{{ product.price }}</p>
                </div>
              </el-card>
            </div>
            <!-- 订单信息 -->
            <div v-if="message.order" class="order-info">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="订单号">{{ message.order.orderNumber }}</el-descriptions-item>
                <el-descriptions-item label="订单状态">{{ getOrderStatusText(message.order.status) }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatDate(message.order.createdAt) }}</el-descriptions-item>
                <el-descriptions-item label="总金额">¥{{ message.order.totalAmount }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="input-area">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题..."
          @keyup.enter.ctrl="sendMessage"
          resize="none"
        />
        <el-button type="primary" @click="sendMessage" :loading="loading">
          发送
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import type { OrderStatus, Order } from '@/types/order'
import type { Product } from '@/types/product'
import { sendMessage as sendAIMessage, analyzeIntentAndRecommend, getProductRecommendations } from '@/api/ai'

// 状态
const inputMessage = ref('')
const messages = ref<Array<{
  type: 'user' | 'assistant'
  content: string
  products?: Product[]
  order?: Order
}>>([])
const loading = ref(false)
const messageList = ref<HTMLElement | null>(null)

// 头像
const userAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const assistantAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

// 清空消息
const clearMessages = () => {
  messages.value = []
  ElMessage.success('对话已清空')
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: inputMessage.value
  })
  
  const userMessage = inputMessage.value
  inputMessage.value = ''
  loading.value = true
  
  try {
    // 分析用户意图
    const intentResult = await analyzeIntentAndRecommend(userMessage)
    
    // 根据意图生成响应
    let response: any = {
      type: 'assistant',
      content: ''
    }
    
    // 根据意图类型生成不同的响应
    switch (intentResult.intent) {
      case 'order_query':
        // 模拟订单查询
        response.order = {
          id: '1',
          orderNumber: 'ORDER202403150001',
          status: OrderStatus.PENDING_PAYMENT,
          createdAt: new Date(),
          totalAmount: 299.00,
          items: []
        }
        response.content = '我找到了您的订单信息，请查看：'
        break
        
      case 'product_recommendation':
        // 模拟商品推荐
        response.products = [
          {
            id: '1',
            name: '商品1',
            price: 99.00,
            image: 'https://via.placeholder.com/150'
          },
          {
            id: '2',
            name: '商品2',
            price: 199.00,
            image: 'https://via.placeholder.com/150'
          }
        ]
        response.content = await getProductRecommendations(intentResult.intent, intentResult.recommendations)
        break
        
      default:
        // 获取AI回复
        response.content = await sendAIMessage(userMessage)
    }
    
    messages.value.push(response)
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请重试')
  } finally {
    loading.value = false
  }
}

// 监听消息列表变化，自动滚动到底部
watch(messages, async () => {
  await nextTick()
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
  }
})

// 格式化日期
const formatDate = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取订单状态文本
const getOrderStatusText = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING_PAYMENT]: '待付款',
    [OrderStatus.PENDING_SHIPMENT]: '待发货',
    [OrderStatus.SHIPPED]: '已发货',
    [OrderStatus.DELIVERED]: '已送达',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消'
  }
  return statusMap[status]
}

// 组件挂载时初始化
onMounted(() => {
  // 添加欢迎消息
  messages.value.push({
    type: 'assistant',
    content: '您好！我是智能助手，很高兴为您服务。我可以帮您：\n1. 查询订单信息\n2. 推荐商品\n3. 解答常见问题\n4. 处理售后问题\n\n请问有什么可以帮您？'
  })
})
</script>

<style scoped>
.ai-assistant-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.assistant-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.message .content {
  flex: 1;
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  white-space: pre-wrap;
}

.message.user .content {
  background-color: #ecf5ff;
}

.product-list {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.product-card {
  cursor: pointer;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 4px;
}

.product-info {
  padding: 12px 0;
}

.product-info h4 {
  margin: 0;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  margin: 8px 0 0;
  color: #f56c6c;
  font-weight: 500;
  font-size: 18px;
}

.order-info {
  margin-top: 16px;
}

.input-area {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 16px;
}

.input-area .el-input {
  flex: 1;
}
</style> 
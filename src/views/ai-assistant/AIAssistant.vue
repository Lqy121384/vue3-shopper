<template>
  <div class="ai-assistant-container">
    <div class="chat-container">
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.type]"
        >
          <div class="message-content">
            <el-avatar
              :src="message.type === 'user' ? userAvatar : aiAvatar"
              :size="40"
            />
            <div class="message-text">
              <div class="text-content">{{ message.content }}</div>
              <div v-if="message.products" class="product-suggestions">
                <h4>为您推荐以下商品：</h4>
                <el-row :gutter="20">
                  <el-col
                    :span="8"
                    v-for="product in message.products"
                    :key="product.id"
                  >
                    <el-card
                      class="product-card"
                      @click="handleProductClick(product)"
                    >
                      <img
                        :src="product.image"
                        :alt="product.name"
                        class="product-image"
                      />
                      <div class="product-info">
                        <h5>{{ product.name }}</h5>
                        <p class="price">¥{{ product.price }}</p>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="input-container">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        placeholder="请输入您的问题，AI助手将为您推荐合适的农产品..."
        @keyup.enter.ctrl="handleSend"
      />
      <el-button
        type="primary"
        :loading="loading"
        @click="handleSend"
        class="send-button"
      >
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Product } from '@/types/product'

const router = useRouter()
const messagesContainer = ref<HTMLElement | null>(null)
const inputMessage = ref('')
const loading = ref(false)
const messages = ref<Array<{
  type: 'user' | 'ai'
  content: string
  products?: Array<{
    id: number
    name: string
    price: number
    image: string
  }>
}>>([])

const userAvatar = '/user-avatar.png'
const aiAvatar = '/ai-avatar.png'

interface AIResponse {
  content: string
  products: Product[]
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  products?: Product[]
}

// 模拟AI响应
const mockAIResponse = (userMessage: string) => {
  // 这里应该调用实际的AI API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        content: `根据您的需求"${userMessage}"，我为您推荐以下商品：`,
        products: [
          {
            id: 1,
            name: '有机草莓',
            price: 39.9,
            image: '/strawberry.jpg'
          },
          {
            id: 2,
            name: '新鲜蓝莓',
            price: 49.9,
            image: '/blueberry.jpg'
          },
          {
            id: 3,
            name: '红心火龙果',
            price: 29.9,
            image: '/dragon-fruit.jpg'
          }
        ]
      })
    }, 1000)
  })
}

const handleSend = async () => {
  if (!inputMessage.value.trim()) return

  const userMessage = inputMessage.value.trim()
  messages.value.push({
    type: 'user',
    content: userMessage
  })

  inputMessage.value = ''
  loading.value = true

  try {
    const response = await mockAIResponse(userMessage)
    handleResponse(response)
  } catch (error) {
    ElMessage.error('AI助手暂时无法响应，请稍后再试')
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const handleProductClick = (product: any) => {
  router.push(`/product/${product.id}`)
}

const handleResponse = (response: unknown) => {
  const aiResponse = response as AIResponse
  messages.value.push({
    type: 'ai',
    content: aiResponse.content,
    products: aiResponse.products
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  // 添加欢迎消息
  messages.value.push({
    type: 'ai',
    content: '您好！我是您的农产品AI助手，我可以为您推荐最适合的农产品。请告诉我您的需求，比如：想要购买新鲜水果、有机蔬菜等。'
  })
})
</script>

<style scoped lang="scss">
.ai-assistant-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  padding: 20px;
  background-color: #f5f7fa;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .message {
    margin-bottom: 20px;

    &.user {
      .message-content {
        flex-direction: row-reverse;
      }

      .message-text {
        margin-right: 12px;
        margin-left: 0;
      }
    }
  }

  .message-content {
    display: flex;
    align-items: flex-start;
  }

  .message-text {
    margin-left: 12px;
    max-width: 70%;

    .text-content {
      padding: 12px 16px;
      background-color: #f4f4f5;
      border-radius: 8px;
      word-break: break-word;
    }

    .product-suggestions {
      margin-top: 12px;

      h4 {
        margin: 0 0 12px;
        color: #606266;
      }

      .product-card {
        cursor: pointer;
        transition: transform 0.3s;

        &:hover {
          transform: translateY(-5px);
        }

        .product-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .product-info {
          padding: 8px;

          h5 {
            margin: 0 0 8px;
            font-size: 14px;
          }

          .price {
            color: #f56c6c;
            margin: 0;
            font-weight: bold;
          }
        }
      }
    }
  }
}

.input-container {
  display: flex;
  gap: 12px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .el-input {
    flex: 1;
  }

  .send-button {
    align-self: flex-end;
  }
}
</style> 
<template>
  <div class="ai-assistant">
    <!-- 悬浮按钮 -->
    <el-button
      v-if="!isOpen"
      class="float-button"
      type="primary"
      circle
      @click="toggleAssistant"
    >
      <el-icon><ChatDotRound /></el-icon>
    </el-button>

    <!-- 助手面板 -->
    <div v-else class="assistant-panel">
      <!-- 面板头部 -->
      <div class="panel-header">
        <div class="title">
          <el-icon><ChatDotRound /></el-icon>
          <span>AI助手</span>
        </div>
        <div class="actions">
          <el-button type="primary" link @click="clearMessages">
            <el-icon><Delete /></el-icon>
            清空对话
          </el-button>
          <el-button type="primary" link @click="toggleAssistant">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 聊天记录 -->
      <div class="chat-container">
        <div class="messages" ref="messagesContainer">
          <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.type]">
            <div class="avatar">
              <img :src="msg.type === 'user' ? userAvatar : aiAvatar" :alt="msg.type === 'user' ? '用户头像' : 'AI助手头像'" />
            </div>
            <div class="message-content" v-html="msg.content"></div>
          </div>
          <!-- 思考状态 -->
          <div v-if="isThinking" class="message assistant">
            <div class="avatar">
              <img :src="aiAvatar" alt="AI Assistant" />
            </div>
            <div class="message-content thinking">
              <span class="thinking-dot"></span>
              <span class="thinking-dot"></span>
              <span class="thinking-dot"></span>
            </div>
          </div>
        </div>
        <div class="input-container">
          <textarea
            v-model="userInput"
            placeholder="请输入您的问题..."
            @keyup.enter="handleSend"
            :disabled="isThinking"
          ></textarea>
          <button @click="handleSend" :disabled="isThinking || !userInput.trim()">
            {{ isThinking ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChatDotRound, Close, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Product } from '@/types/product'
import { sendMessage } from '@/api/ai'
import userAvatarSrc from '../assets/user-avatar.svg'
import aiAvatarSrc from '../assets/ai-avatar.svg'
import { formatDate } from '@/utils/format'
import axios from 'axios'
import { marked } from 'marked'

interface Message {
  type: 'user' | 'assistant'
  content: string | Promise<string>
  timestamp: number
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

const router = useRouter()

// 状态
const isOpen = ref(false)
const isMinimized = ref(false)
const userInput = ref('')
const isLoading = ref(false)
const unreadCount = ref(0)
const messages = ref<Message[]>([])
const messagesContainer = ref<HTMLElement | null>(null)
const isThinking = ref(false)

// 头像
const userAvatar = userAvatarSrc
const aiAvatar = aiAvatarSrc

// 切换助手面板
const toggleAssistant = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    unreadCount.value = 0
    if (messages.value.length === 0) {
      messages.value.push({
        type: 'assistant',
        content: '您好！我是您的AI购物助手，有什么可以帮您的吗？',
        timestamp: Date.now()
      })
    }
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 切换最小化状态
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 监听消息变化
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// 获取AI响应
const getAIResponse = async (message: string): Promise<string> => {
  try {
    const history = messages.value.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    console.log('发送请求:', { message, history })

    const response = await axios.post<ApiResponse<{ message: string }>>('/chat', {
      message,
      history
    }, {
      timeout: 60000, // 设置60秒超时
      headers: {
        'Content-Type': 'application/json'
      }
    } as any) // 临时使用 any 类型解决类型错误

    console.log('收到响应:', response.data)

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'AI服务返回错误')
    }

    if (!response.data.data?.message) {
      throw new Error('AI响应格式错误：缺少消息内容')
    }

    // 使用 marked 处理 Markdown 格式
    const formattedResponse = marked(response.data.data.message, {
      breaks: true, // 启用换行符
      gfm: true, // 启用 GitHub Flavored Markdown
      headerIds: false, // 禁用标题 ID
      mangle: false // 禁用邮箱地址混淆
    })

    return formattedResponse
  } catch (error) {
    console.error('AI响应错误:', error)
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('AI服务响应超时，请稍后重试')
      }
      if (error.response) {
        throw new Error(error.response.data?.message || 'AI服务请求失败')
      }
      if (error.request) {
        throw new Error('无法连接到AI服务，请检查网络连接')
      }
    }
    throw error
  }
}

// 处理发送消息
const handleSend = async () => {
  if (!userInput.value.trim() || isThinking.value) return

  const userMessage = userInput.value.trim()
  userInput.value = ''

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: userMessage,
    timestamp: Date.now()
  })

  await scrollToBottom()
  isThinking.value = true

  try {
    const aiResponse = await getAIResponse(userMessage)
    messages.value.push({
      type: 'assistant',
      content: aiResponse,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('AI响应错误:', error)
    messages.value.push({
      type: 'assistant',
      content: `<p>${error instanceof Error ? error.message : 'AI服务暂时不可用，请稍后重试'}</p>`,
      timestamp: Date.now()
    })
  } finally {
    isThinking.value = false
    await scrollToBottom()
  }
}

// 处理商品点击
const handleProductClick = (product: Product) => {
  router.push(`/product/${product.id}`)
}

// 处理最小化
const handleMinimize = () => {
  isMinimized.value = true
  isOpen.value = false
}

// 处理关闭
const handleClose = () => {
  isOpen.value = false
  isMinimized.value = false
}

// 处理打开
const handleOpen = () => {
  isOpen.value = true
  isMinimized.value = false
}

// 清空消息
const clearMessages = () => {
  messages.value = []
  localStorage.removeItem('ai-assistant-messages')
  ElMessage.success('对话已清空')
}

// 监听新消息
watch(messages, (newMessages) => {
  if (!isOpen.value && newMessages.length > 0) {
    const lastMessage = newMessages[newMessages.length - 1]
    if (lastMessage.type === 'assistant') {
      unreadCount.value++
    }
  }
})

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 初始化欢迎消息
onMounted(() => {
  messages.value.push({
    type: 'assistant',
    content: `<p>嘿呀～ 您好！这里是小田，您身边的农产品小专家哦！</p>
              <p>有什么我能帮到您的吗？比如说，想要尝鲜的水果、健康的杂粮还是其他什么好吃的呢？😊🍎🌾</p>`,
    timestamp: Date.now()
  })
})
</script>

<style scoped lang="scss">
.ai-assistant {
  .float-button {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 9999;
    width: 56px;
    height: 56px;
    font-size: 24px;
    background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
      background: linear-gradient(135deg, #45a049 0%, #7cb342 100%);
    }
  }

  .assistant-panel {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 380px;
    height: 600px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    z-index: 9999;
    overflow: hidden;
    border: 1px solid rgba(76, 175, 80, 0.1);

    .panel-header {
      padding: 16px;
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="rgba(255,255,255,0.1)" d="M50 0 L100 50 L50 100 L0 50 Z"/></svg>');
        background-size: 20px 20px;
        opacity: 0.1;
      }

      .title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        position: relative;
        z-index: 1;

        .el-icon {
          font-size: 20px;
        }
      }

      .actions {
        display: flex;
        gap: 8px;
        position: relative;
        z-index: 1;

        .el-button {
          color: white;
          opacity: 0.8;
          
          &:hover {
            opacity: 1;
          }
        }
      }
    }

    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #f8f9fa;
      padding: 16px;
      overflow: hidden;
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="rgba(76,175,80,0.05)" d="M50 0 L100 50 L50 100 L0 50 Z"/></svg>');
      background-size: 40px 40px;

      .messages {
        flex: 1;
        overflow-y: auto;
        padding-right: 8px;
        scrollbar-width: thin;
        scrollbar-color: rgba(76, 175, 80, 0.5) transparent;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background-color: rgba(76, 175, 80, 0.5);
          border-radius: 3px;
        }

        .message {
          margin-bottom: 16px;
          display: flex;
          flex-direction: row;
          gap: 12px;
          align-items: flex-start;

          &.user {
            flex-direction: row-reverse;

            .message-content {
              background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
              color: white;
              border-radius: 16px 0 16px 16px;
              box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
            }

            .avatar {
              order: 2;
            }
          }

          &.assistant {
            .message-content {
              background: white;
              color: #333;
              border-radius: 0 16px 16px 16px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
              border: 1px solid rgba(76, 175, 80, 0.1);
            }
          }

          .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid rgba(76, 175, 80, 0.2);
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .message-content {
            max-width: calc(100% - 100px);
            padding: 12px 16px;
            font-size: 14px;
            line-height: 1.5;
            word-break: break-word;

            :deep(p) {
              margin: 0 0 8px 0;
            }

            :deep(strong) {
              font-weight: 600;
              color: #4CAF50;
            }

            :deep(em) {
              font-style: italic;
            }

            :deep(ul), :deep(ol) {
              margin: 8px 0;
              padding-left: 20px;
            }

            :deep(li) {
              margin: 4px 0;
            }

            :deep(code) {
              background-color: rgba(76, 175, 80, 0.1);
              padding: 2px 4px;
              border-radius: 4px;
              font-family: monospace;
              color: #4CAF50;
            }

            :deep(pre) {
              background-color: rgba(76, 175, 80, 0.1);
              padding: 12px;
              border-radius: 8px;
              overflow-x: auto;
              margin: 8px 0;
              border: 1px solid rgba(76, 175, 80, 0.2);
            }

            :deep(blockquote) {
              border-left: 4px solid #4CAF50;
              padding-left: 12px;
              margin: 8px 0;
              color: #666;
              background-color: rgba(76, 175, 80, 0.05);
            }
          }
        }
      }

      .input-container {
        margin-top: 16px;
        display: flex;
        gap: 8px;
        padding: 8px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(76, 175, 80, 0.1);

        textarea {
          flex: 1;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          resize: none;
          outline: none;
          font-size: 14px;
          line-height: 1.5;
          background: transparent;
          min-height: 40px;
          max-height: 120px;

          &::placeholder {
            color: #999;
          }
        }

        button {
          padding: 8px 16px;
          background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: linear-gradient(135deg, #45a049 0%, #7cb342 100%);
            box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
          }

          &:disabled {
            background: #cccccc;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}

@keyframes el-skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

/* 思考状态样式 */
.thinking {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 12px;
  min-height: 40px;
}

.thinking-dot {
  width: 8px;
  height: 8px;
  background: #4CAF50;
  border-radius: 50%;
  animation: thinking 1.4s infinite ease-in-out;
}

.thinking-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes thinking {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 禁用状态样式 */
textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 
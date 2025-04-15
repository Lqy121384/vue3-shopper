<template>
  <div class="payment-page">
    <el-card>
      <template #header>
        <div class="payment-header">
          <h2>订单支付</h2>
        </div>
      </template>
      
      <!-- 订单信息 -->
      <div class="order-info">
        <div class="info-item">
          <span class="label">订单号：</span>
          <span class="value">{{ orderId }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付金额：</span>
          <span class="value price">¥{{ amount.toFixed(2) }}</span>
        </div>
      </div>
      
      <!-- 支付方式 -->
      <div class="payment-method">
        <h3>支付方式</h3>
        <el-radio-group v-model="paymentMethod">
          <el-radio label="alipay">支付宝支付</el-radio>
          <el-radio label="wechat">微信支付</el-radio>
        </el-radio-group>
      </div>
      
      <!-- 支付二维码 -->
      <div class="payment-qrcode">
        <div class="qrcode-container">
          <el-image
            v-if="qrcodeUrl"
            :src="qrcodeUrl"
            :alt="paymentMethod === 'alipay' ? '支付宝支付' : '微信支付'"
            fit="contain"
          />
          <div v-else class="qrcode-placeholder">
            <el-icon><Picture /></el-icon>
            <p>加载中...</p>
          </div>
        </div>
        <p class="qrcode-tip">
          请使用{{ paymentMethod === 'alipay' ? '支付宝' : '微信' }}扫码支付
        </p>
      </div>
      
      <!-- 支付状态 -->
      <div class="payment-status">
        <el-result
          v-if="paymentStatus === 'success'"
          icon="success"
          title="支付成功"
          sub-title="订单支付已完成"
        >
          <template #extra>
            <el-button type="primary" @click="handleViewOrder">
              查看订单
            </el-button>
            <el-button @click="handleBackToHome">
              返回首页
            </el-button>
          </template>
        </el-result>
        
        <el-result
          v-else-if="paymentStatus === 'failed'"
          icon="error"
          title="支付失败"
          sub-title="订单支付未完成，请重试"
        >
          <template #extra>
            <el-button type="primary" @click="handleRetryPayment">
              重新支付
            </el-button>
            <el-button @click="handleCancelOrder">
              取消订单
            </el-button>
          </template>
        </el-result>
        
        <div v-else class="payment-countdown">
          <el-icon><Timer /></el-icon>
          <span>支付剩余时间：{{ formatTime(countdown) }}</span>
        </div>
      </div>
      
      <!-- 支付说明 -->
      <div class="payment-tips">
        <h3>支付说明</h3>
        <ul>
          <li>请在{{ paymentMethod === 'alipay' ? '支付宝' : '微信' }}中完成支付</li>
          <li>支付完成后请勿关闭页面，等待系统自动跳转</li>
          <li>如遇支付问题，请联系客服</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, Timer } from '@element-plus/icons-vue'

defineOptions({
  name: 'PaymentPage'
})

const router = useRouter()
const route = useRoute()

// 订单信息
const orderId = ref(route.query.orderId as string)
const amount = ref(Number(route.query.amount) || 0)

// 验证订单参数
if (!orderId.value || !amount.value) {
  ElMessage.error('订单信息不完整')
  router.push('/cart')
}

// 支付方式
const paymentMethod = ref('alipay')

// 支付二维码
const qrcodeUrl = ref('')

// 支付状态
const paymentStatus = ref<'pending' | 'success' | 'failed'>('pending')

// 倒计时
const countdown = ref(1800) // 30分钟
let timer: number | null = null

// 格式化时间
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 开始倒计时
const startCountdown = () => {
  timer = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      stopCountdown()
      handlePaymentTimeout()
    }
  }, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 处理支付超时
const handlePaymentTimeout = () => {
  paymentStatus.value = 'failed'
  ElMessage.warning('支付超时，请重新支付')
}

// 获取支付二维码
const getPaymentQrcode = async () => {
  try {
    // TODO: 调用获取支付二维码API
    await new Promise(resolve => setTimeout(resolve, 1000))
    qrcodeUrl.value = '/qrcode.png'
  } catch (error) {
    console.error('获取支付二维码失败:', error)
    ElMessage.error('获取支付二维码失败，请重试')
  }
}

// 检查支付状态
const checkPaymentStatus = async () => {
  try {
    // TODO: 调用检查支付状态API
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 模拟支付成功
    paymentStatus.value = 'success'
    stopCountdown()
    ElMessage.success('支付成功')
  } catch (error) {
    console.error('检查支付状态失败:', error)
  }
}

// 处理查看订单
const handleViewOrder = () => {
  router.push({
    path: '/orders',
    query: {
      orderId: orderId.value
    }
  })
}

// 处理返回首页
const handleBackToHome = () => {
  router.push('/')
}

// 处理重新支付
const handleRetryPayment = () => {
  paymentStatus.value = 'pending'
  countdown.value = 1800
  startCountdown()
  getPaymentQrcode()
}

// 处理取消订单
const handleCancelOrder = () => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 调用取消订单API
    ElMessage.success('订单已取消')
    router.push('/orders')
  })
}

// 监听支付方式变化
watch(paymentMethod, () => {
  qrcodeUrl.value = ''
  getPaymentQrcode()
})

// 页面加载
onMounted(() => {
  getPaymentQrcode()
  startCountdown()
  // 定时检查支付状态
  const statusTimer = setInterval(checkPaymentStatus, 5000)
  onUnmounted(() => {
    clearInterval(statusTimer)
  })
})

// 页面卸载
onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
.payment-page {
  padding: 20px;
}

.payment-header {
  h2 {
    margin: 0;
    font-size: 20px;
    color: #303133;
  }
}

.order-info {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  
  .info-item {
    display: flex;
    margin-bottom: 10px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      color: #606266;
      margin-right: 10px;
    }
    
    .value {
      color: #303133;
      
      &.price {
        color: #f56c6c;
        font-size: 20px;
        font-weight: bold;
      }
    }
  }
}

.payment-method {
  margin-bottom: 30px;
  
  h3 {
    margin: 0 0 20px;
    font-size: 16px;
    color: #303133;
  }
}

.payment-qrcode {
  margin-bottom: 30px;
  text-align: center;
  
  .qrcode-container {
    width: 200px;
    height: 200px;
    margin: 0 auto 15px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
    
    .el-image {
      width: 100%;
      height: 100%;
    }
    
    .qrcode-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #909399;
      
      .el-icon {
        font-size: 40px;
        margin-bottom: 10px;
      }
    }
  }
  
  .qrcode-tip {
    color: #606266;
    margin: 0;
  }
}

.payment-status {
  margin-bottom: 30px;
  text-align: center;
  
  .payment-countdown {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #f56c6c;
    font-size: 18px;
    
    .el-icon {
      font-size: 20px;
    }
  }
}

.payment-tips {
  h3 {
    margin: 0 0 20px;
    font-size: 16px;
    color: #303133;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    color: #606266;
    
    li {
      margin-bottom: 10px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style> 
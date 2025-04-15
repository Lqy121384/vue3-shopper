<template>
  <div class="payment-page">
    <div class="payment-container">
      <!-- 支付状态 -->
      <div class="payment-status">
        <el-result
          :icon="paymentStatus === 'pending' ? 'warning' : paymentStatus === 'success' ? 'success' : 'error'"
          :title="statusTitle"
          :sub-title="statusSubTitle"
        >
          <template #extra>
            <div v-if="paymentStatus === 'pending'" class="countdown">
              支付剩余时间：{{ formatTime(countdown) }}
            </div>
          </template>
        </el-result>
      </div>

      <!-- 支付二维码 -->
      <div class="payment-qrcode">
        <div class="qrcode-container">
          <img :src="qrcodeUrl" alt="支付二维码" class="qrcode-image" />
          <div class="qrcode-tip">
            <p>请使用{{ paymentMethod === 'alipay' ? '支付宝' : '微信' }}扫码支付</p>
            <p class="amount">¥{{ orderAmount.toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="order-info">
        <h3>订单信息</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单编号">
            {{ orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(orderCreateTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ paymentMethod === 'alipay' ? '支付宝支付' : '微信支付' }}
          </el-descriptions-item>
          <el-descriptions-item label="支付金额">
            <span class="amount">¥{{ orderAmount.toFixed(2) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 支付操作 -->
      <div class="payment-actions">
        <el-button
          v-if="paymentStatus === 'pending'"
          type="primary"
          @click="handleCheckPayment"
        >
          我已支付
        </el-button>
        <el-button
          v-if="paymentStatus === 'pending'"
          @click="handleCancelPayment"
        >
          取消支付
        </el-button>
        <el-button
          v-if="paymentStatus === 'success'"
          type="primary"
          @click="handleViewOrder"
        >
          查看订单
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { cancelPayment } from '@/api/payment'

const router = useRouter()

const props = defineProps<{
  paymentId: string
}>()

// 支付状态
const paymentStatus = ref<'pending' | 'success' | 'failed'>('pending')

// 支付方式
const paymentMethod = ref<'alipay' | 'wechat'>('alipay')

// 订单信息
const orderNo = ref('202403200001')
const orderAmount = ref(99.8)
const orderCreateTime = ref(new Date().toISOString())

// 支付二维码
const qrcodeUrl = ref('/qrcode.png')

// 倒计时
const countdown = ref(1800) // 30分钟
const timer = ref<number | undefined>(undefined)

// 状态标题
const statusTitle = computed(() => {
  switch (paymentStatus.value) {
    case 'pending':
      return '等待支付'
    case 'success':
      return '支付成功'
    case 'failed':
      return '支付失败'
    default:
      return ''
  }
})

// 状态副标题
const statusSubTitle = computed(() => {
  switch (paymentStatus.value) {
    case 'pending':
      return '请在30分钟内完成支付'
    case 'success':
      return '您的订单已支付成功'
    case 'failed':
      return '支付失败，请重新尝试'
    default:
      return ''
  }
})

// 格式化时间
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 检查支付状态
const handleCheckPayment = async () => {
  try {
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    paymentStatus.value = 'success'
    ElMessage.success('支付成功')
    clearInterval(timer.value)
  } catch (error) {
    ElMessage.error('支付失败，请重试')
  }
}

// 取消支付
const handleCancelPayment = async () => {
  try {
    await ElMessageBox.confirm('确定要取消支付吗？', '提示', {
      type: 'warning'
    })
    
    await cancelPayment(props.paymentId)
    paymentStatus.value = 'failed'
    ElMessage.success('已取消支付')
    clearInterval(timer.value)
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(`取消支付失败: ${error.message}`)
    }
  }
}

// 查看订单
const handleViewOrder = () => {
  router.push('/order/list')
}

const startTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  timer.value = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      if (timer.value) {
        clearInterval(timer.value)
        timer.value = undefined
      }
      paymentStatus.value = 'failed'
      ElMessage.warning('支付超时，请重新下单')
    }
  }, 1000)
}

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = undefined
  }
})
</script>

<style scoped lang="scss">
.payment-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 40px 20px;

  .payment-container {
    max-width: 800px;
    margin: 0 auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 40px;

    .payment-status {
      margin-bottom: 40px;
      text-align: center;

      .countdown {
        font-size: 18px;
        color: #f56c6c;
        margin-top: 20px;
      }
    }

    .payment-qrcode {
      display: flex;
      justify-content: center;
      margin-bottom: 40px;

      .qrcode-container {
        text-align: center;

        .qrcode-image {
          width: 200px;
          height: 200px;
          margin-bottom: 20px;
        }

        .qrcode-tip {
          p {
            margin: 5px 0;
            color: #606266;

            &.amount {
              font-size: 24px;
              color: #f56c6c;
              font-weight: bold;
            }
          }
        }
      }
    }

    .order-info {
      margin-bottom: 40px;

      h3 {
        margin: 0 0 20px;
      }

      .amount {
        color: #f56c6c;
        font-weight: bold;
      }
    }

    .payment-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
  }
}
</style> 
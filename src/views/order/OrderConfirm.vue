<template>
  <div class="order-confirm">
    <h2>确认订单</h2>

    <!-- 收货地址 -->
    <el-card class="address-card">
      <template #header>
        <div class="card-header">
          <span>收货地址</span>
          <el-button type="primary" link @click="handleAddAddress">
            添加新地址
          </el-button>
        </div>
      </template>

      <div v-if="addresses.length > 0" class="address-list">
        <el-radio-group v-model="selectedAddressId">
          <el-radio
            v-for="address in addresses"
            :key="address.id"
            :label="address.id"
            class="address-item"
          >
            <div class="address-info">
              <div class="contact">
                <span class="name">{{ address.name }}</span>
                <span class="phone">{{ address.phone }}</span>
              </div>
              <div class="address">
                {{ address.province }}{{ address.city }}{{ address.district }}{{ address.address }}
              </div>
            </div>
            <div class="address-actions">
              <el-button type="primary" link @click.stop="handleEditAddress(address)">
                编辑
              </el-button>
              <el-button type="danger" link @click.stop="handleDeleteAddress(address)">
                删除
              </el-button>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <el-empty v-else description="暂无收货地址">
        <el-button type="primary" @click="handleAddAddress">
          添加收货地址
        </el-button>
      </el-empty>
    </el-card>

    <!-- 商品清单 -->
    <el-card class="products-card">
      <template #header>
        <div class="card-header">
          <span>商品清单</span>
        </div>
      </template>

      <el-table :data="orderItems" style="width: 100%">
        <el-table-column label="商品信息" min-width="400">
          <template #default="{ row }">
            <div class="product-info">
              <img :src="row.product.image" :alt="row.product.name" class="product-image" />
              <div class="product-detail">
                <h3>{{ row.product.name }}</h3>
                <p class="description">{{ row.product.description }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="120">
          <template #default="{ row }">
            {{ row.quantity }}
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            <span class="subtotal">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 订单金额 -->
      <div class="order-amount">
        <div class="amount-item">
          <span class="label">商品总额</span>
          <span class="value">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
        <div class="amount-item">
          <span class="label">运费</span>
          <span class="value">¥{{ shippingFee.toFixed(2) }}</span>
        </div>
        <div class="amount-item total">
          <span class="label">实付金额</span>
          <span class="value">¥{{ finalAmount.toFixed(2) }}</span>
        </div>
      </div>
    </el-card>

    <!-- 支付方式 -->
    <el-card class="payment-card">
      <template #header>
        <div class="card-header">
          <span>支付方式</span>
        </div>
      </template>

      <el-radio-group v-model="paymentMethod">
        <el-radio value="alipay">
          <img src="/alipay.png" alt="支付宝" class="payment-icon" />
          支付宝
        </el-radio>
        <el-radio value="wechat">
          <img src="/wechat.png" alt="微信支付" class="payment-icon" />
          微信支付
        </el-radio>
      </el-radio-group>
    </el-card>

    <!-- 订单备注 -->
    <el-card class="remark-card">
      <template #header>
        <div class="card-header">
          <span>订单备注</span>
        </div>
      </template>

      <el-input
        v-model="remark"
        type="textarea"
        :rows="3"
        placeholder="请输入订单备注（选填）"
      />
    </el-card>

    <!-- 提交订单 -->
    <div class="submit-order">
      <div class="order-total">
        <span class="label">实付金额：</span>
        <span class="amount">¥{{ finalAmount.toFixed(2) }}</span>
      </div>
      <el-button
        type="primary"
        size="large"
        :disabled="!selectedAddressId"
        @click="handleSubmitOrder"
      >
        提交订单
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { OrderItem, Address, Product } from '@/types/product'

const route = useRoute()
const router = useRouter()

// 收货地址
const addresses = ref<Address[]>([])
const selectedAddressId = ref<number>()

// 订单商品
const orderItems = ref<OrderItem[]>([])

// 支付方式
const paymentMethod = ref('alipay')

// 订单备注
const remark = ref('')

// 计算订单金额
const totalAmount = computed(() => {
  return orderItems.value.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)
})

const shippingFee = computed(() => {
  return totalAmount.value > 99 ? 0 : 10
})

const finalAmount = computed(() => {
  return totalAmount.value + shippingFee.value
})

// 获取收货地址列表
const fetchAddresses = async () => {
  // 这里应该调用实际的API
  // 模拟数据
  const mockAddress: Address = {
    id: 1,
    userId: 1,
    name: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    address: '科技园中路888号',
    isDefault: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  }

  addresses.value = [mockAddress]
  selectedAddressId.value = addresses.value[0].id
}

// 获取订单商品
const fetchOrderItems = async () => {
  const productIds = route.query.productIds?.toString().split(',') || []
  const quantities = route.query.quantities?.toString().split(',') || []

  // 这里应该调用实际的API
  // 模拟数据
  const mockProduct: Product = {
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
    specifications: {
      weight: '500g',
      origin: '陕西'
    },
    isOnSale: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  const mockOrderItems: OrderItem[] = [
    {
      id: 1,
      orderId: 1,
      productId: 1,
      quantity: 2,
      price: 149.50,
      product: mockProduct
    }
  ]

  orderItems.value = mockOrderItems
}

// 处理添加地址
const handleAddAddress = () => {
  // TODO: 实现添加地址功能
  ElMessage.info('添加地址功能开发中')
}

// 处理编辑地址
const handleEditAddress = (address: Address) => {
  // TODO: 实现编辑地址功能
  ElMessage.info('编辑地址功能开发中')
}

// 处理删除地址
const handleDeleteAddress = async (address: Address) => {
  try {
    await ElMessageBox.confirm('确定要删除这个地址吗？', '提示', {
      type: 'warning'
    })
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = addresses.value.findIndex(a => a.id === address.id)
    if (index > -1) {
      addresses.value.splice(index, 1)
    }
    ElMessage.success('已删除')
  } catch {
    // 用户取消操作
  }
}

// 处理提交订单
const handleSubmitOrder = async () => {
  try {
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('订单提交成功')
    router.push('/order/payment')
  } catch (error) {
    ElMessage.error('订单提交失败，请重试')
  }
}

onMounted(() => {
  fetchAddresses()
  fetchOrderItems()
})
</script>

<style scoped lang="scss">
.order-confirm {
  padding: 20px;

  h2 {
    margin: 0 0 20px;
  }

  .el-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .address-card {
    .address-list {
      .address-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;

        &:last-child {
          margin-bottom: 0;
        }

        .address-info {
          flex: 1;

          .contact {
            margin-bottom: 5px;

            .name {
              font-weight: bold;
              margin-right: 10px;
            }

            .phone {
              color: #606266;
            }
          }

          .address {
            color: #606266;
          }
        }

        .address-actions {
          margin-left: 20px;
        }
      }
    }
  }

  .products-card {
    .product-info {
      display: flex;
      align-items: center;
      gap: 20px;

      .product-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
      }

      .product-detail {
        h3 {
          margin: 0 0 8px;
          font-size: 16px;
        }

        .description {
          color: #909399;
          margin: 0;
          font-size: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }

    .price,
    .subtotal {
      color: #f56c6c;
      font-weight: bold;
    }

    .order-amount {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;

      .amount-item {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          margin-right: 20px;
          color: #606266;
        }

        .value {
          color: #f56c6c;
          font-weight: bold;
        }

        &.total {
          .value {
            font-size: 20px;
          }
        }
      }
    }
  }

  .payment-card {
    .payment-icon {
      width: 24px;
      height: 24px;
      margin-right: 8px;
      vertical-align: middle;
    }
  }

  .submit-order {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 20px;
    background-color: white;
    box-shadow: 0 -2px 12px 0 rgba(0, 0, 0, 0.1);

    .order-total {
      margin-right: 20px;

      .label {
        color: #606266;
      }

      .amount {
        color: #f56c6c;
        font-size: 20px;
        font-weight: bold;
      }
    }
  }
}
</style> 
<template>
  <div class="user-center">
    <el-row :gutter="20">
      <!-- 左侧导航 -->
      <el-col :span="6">
        <el-card class="user-nav">
          <div class="user-info">
            <el-avatar :size="80" :src="userInfo.avatar" />
            <h3 class="username">{{ userInfo.username }}</h3>
            <p class="user-role">{{ userInfo.role === 'farmer' ? '农户' : '普通用户' }}</p>
          </div>
          
          <el-menu
            :default-active="activeMenu"
            class="user-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="profile">
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </el-menu-item>
            
            <el-menu-item index="orders">
              <el-icon><List /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            
            <el-menu-item index="favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            
            <el-menu-item index="address">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </el-menu-item>
            
            <el-menu-item index="coupons">
              <el-icon><Ticket /></el-icon>
              <span>我的优惠券</span>
            </el-menu-item>
            
            <el-menu-item index="points">
              <el-icon><Coin /></el-icon>
              <span>我的积分</span>
            </el-menu-item>
            
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>账号安全</span>
            </el-menu-item>
            
            <el-menu-item index="settings">
              <el-icon><Setting /></el-icon>
              <span>账号设置</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      
      <!-- 右侧内容 -->
      <el-col :span="18">
        <el-card class="user-content">
          <!-- 个人资料 -->
          <div v-if="activeMenu === 'profile'" class="profile-section">
            <h2>个人资料</h2>
            <el-form
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
            >
              <el-form-item label="头像">
                <el-upload
                  class="avatar-uploader"
                  action="/api/upload"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                >
                  <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              
              <el-form-item label="用户名" prop="username">
                <el-input v-model="profileForm.username" />
              </el-form-item>
              
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="profileForm.phone" />
              </el-form-item>
              
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" />
              </el-form-item>
              
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="profileForm.gender">
                  <el-radio value="male">男</el-radio>
                  <el-radio value="female">女</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="生日" prop="birthday">
                <el-date-picker
                  v-model="profileForm.birthday"
                  type="date"
                  placeholder="选择日期"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="handleSaveProfile">
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 我的订单 -->
          <div v-if="activeMenu === 'orders'" class="orders-section">
            <h2>我的订单</h2>
            <el-tabs v-model="orderTab">
              <el-tab-pane label="全部订单" name="all" />
              <el-tab-pane label="待付款" name="unpaid" />
              <el-tab-pane label="待发货" name="unshipped" />
              <el-tab-pane label="待收货" name="unreceived" />
              <el-tab-pane label="已完成" name="completed" />
            </el-tabs>
            
            <div class="order-list">
              <el-card v-for="order in orders" :key="order.id" class="order-item">
                <div class="order-header">
                  <span class="order-id">订单号：{{ order.id }}</span>
                  <span class="order-status">{{ order.statusText }}</span>
                </div>
                
                <div class="order-products">
                  <div v-for="product in order.products" :key="product.id" class="product-item">
                    <el-image :src="product.image" :alt="product.name" />
                    <div class="product-info">
                      <h4>{{ product.name }}</h4>
                      <p class="product-price">¥{{ product.price }}</p>
                      <p class="product-quantity">x{{ product.quantity }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="order-footer">
                  <div class="order-total">
                    共{{ order.totalQuantity }}件商品
                    实付款：<span class="price">¥{{ order.totalAmount }}</span>
                  </div>
                  <div class="order-actions">
                    <el-button
                      v-if="order.status === 'unpaid'"
                      type="primary"
                      @click="handlePayOrder(order)"
                    >
                      立即付款
                    </el-button>
                    <el-button
                      v-if="order.status === 'unreceived'"
                      type="success"
                      @click="handleConfirmReceive(order)"
                    >
                      确认收货
                    </el-button>
                    <el-button
                      v-if="['completed', 'unreceived'].includes(order.status)"
                      @click="handleDeleteOrder(order)"
                    >
                      删除订单
                    </el-button>
                  </div>
                </div>
              </el-card>
            </div>
            
            <div class="pagination">
              <el-pagination
                v-model:current-page="orderPage"
                v-model:page-size="orderPageSize"
                :total="orderTotal"
                layout="prev, pager, next"
                @current-change="handleOrderPageChange"
              />
            </div>
          </div>
          
          <!-- 我的收藏 -->
          <div v-if="activeMenu === 'favorites'" class="favorites-section">
            <h2>我的收藏</h2>
            <el-row :gutter="20">
              <el-col
                v-for="product in favorites"
                :key="product.id"
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
              >
                <el-card class="favorite-item" :body-style="{ padding: '0px' }">
                  <el-image :src="product.image" :alt="product.name" />
                  <div class="favorite-info">
                    <h4>{{ product.name }}</h4>
                    <p class="price">¥{{ product.price }}</p>
                  </div>
                  <div class="favorite-actions">
                    <el-button type="primary" @click="handleAddToCart(product)">
                      加入购物车
                    </el-button>
                    <el-button @click="handleRemoveFavorite(product)">
                      取消收藏
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            
            <div class="pagination">
              <el-pagination
                v-model:current-page="favoritePage"
                v-model:page-size="favoritePageSize"
                :total="favoriteTotal"
                layout="prev, pager, next"
                @current-change="handleFavoritePageChange"
              />
            </div>
          </div>
          
          <!-- 收货地址 -->
          <div v-if="activeMenu === 'address'" class="address-section">
            <h2>收货地址</h2>
            <el-button type="primary" @click="handleAddAddress">
              新增收货地址
            </el-button>
            
            <div class="address-list">
              <el-card v-for="address in addresses" :key="address.id" class="address-item">
                <div class="address-info">
                  <div class="contact">
                    <span class="name">{{ address.name }}</span>
                    <span class="phone">{{ address.phone }}</span>
                  </div>
                  <div class="location">
                    {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
                  </div>
                </div>
                <div class="address-actions">
                  <el-button
                    :type="address.isDefault ? 'success' : 'default'"
                    @click="handleSetDefaultAddress(address)"
                  >
                    {{ address.isDefault ? '默认地址' : '设为默认' }}
                  </el-button>
                  <el-button @click="handleEditAddress(address)">
                    编辑
                  </el-button>
                  <el-button type="danger" @click="handleDeleteAddress(address)">
                    删除
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>
          
          <!-- 我的优惠券 -->
          <div v-if="activeMenu === 'coupons'" class="coupons-section">
            <h2>我的优惠券</h2>
            <el-tabs v-model="couponTab">
              <el-tab-pane label="可使用" name="available" />
              <el-tab-pane label="已使用" name="used" />
              <el-tab-pane label="已过期" name="expired" />
            </el-tabs>
            
            <div class="coupon-list">
              <el-card
                v-for="coupon in coupons"
                :key="coupon.id"
                class="coupon-item"
                :class="{ 'coupon-used': coupon.status === 'used' }"
              >
                <div class="coupon-amount">
                  <span class="currency">¥</span>
                  <span class="number">{{ coupon.amount }}</span>
                </div>
                <div class="coupon-info">
                  <h4>{{ coupon.name }}</h4>
                  <p class="condition">满{{ coupon.minAmount }}元可用</p>
                  <p class="validity">
                    {{ coupon.startDate }} 至 {{ coupon.endDate }}
                  </p>
                </div>
                <div class="coupon-status">
                  {{ coupon.statusText }}
                </div>
              </el-card>
            </div>
            
            <div class="pagination">
              <el-pagination
                v-model:current-page="couponPage"
                v-model:page-size="couponPageSize"
                :total="couponTotal"
                layout="prev, pager, next"
                @current-change="handleCouponPageChange"
              />
            </div>
          </div>
          
          <!-- 我的积分 -->
          <div v-if="activeMenu === 'points'" class="points-section">
            <h2>我的积分</h2>
            <div class="points-overview">
              <div class="points-card">
                <div class="points-amount">{{ userInfo.points }}</div>
                <div class="points-label">当前积分</div>
              </div>
              <div class="points-card">
                <div class="points-amount">{{ userInfo.pointsHistory }}</div>
                <div class="points-label">历史积分</div>
              </div>
            </div>
            
            <div class="points-history">
              <h3>积分明细</h3>
              <el-table :data="pointsHistory" style="width: 100%">
                <el-table-column prop="date" label="时间" width="180" />
                <el-table-column prop="type" label="类型" width="120">
                  <template #default="{ row }">
                    <el-tag :type="row.type === 'add' ? 'success' : 'danger'">
                      {{ row.type === 'add' ? '获得' : '使用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="amount" label="积分" width="120" />
                <el-table-column prop="description" label="说明" />
              </el-table>
            </div>
            
            <div class="pagination">
              <el-pagination
                v-model:current-page="pointsPage"
                v-model:page-size="pointsPageSize"
                :total="pointsTotal"
                layout="prev, pager, next"
                @current-change="handlePointsPageChange"
              />
            </div>
          </div>
          
          <!-- 账号安全 -->
          <div v-if="activeMenu === 'security'" class="security-section">
            <h2>账号安全</h2>
            <el-form label-width="120px">
              <el-form-item label="登录密码">
                <el-button @click="handleChangePassword">
                  修改密码
                </el-button>
              </el-form-item>
              
              <el-form-item label="手机号">
                <span>{{ userInfo.phone }}</span>
                <el-button @click="handleChangePhone">
                  修改手机号
                </el-button>
              </el-form-item>
              
              <el-form-item label="邮箱">
                <span>{{ userInfo.email }}</span>
                <el-button @click="handleChangeEmail">
                  修改邮箱
                </el-button>
              </el-form-item>
              
              <el-form-item label="账号注销">
                <el-button type="danger" @click="handleDeleteAccount">
                  注销账号
                </el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 账号设置 -->
          <div v-if="activeMenu === 'settings'" class="settings-section">
            <h2>账号设置</h2>
            <el-form label-width="120px">
              <el-form-item label="消息通知">
                <el-switch v-model="settings.notifications" />
              </el-form-item>
              
              <el-form-item label="隐私设置">
                <el-switch v-model="settings.privacy" />
              </el-form-item>
              
              <el-form-item label="主题设置">
                <el-radio-group v-model="settings.theme">
                  <el-radio value="light">浅色</el-radio>
                  <el-radio value="dark">深色</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="handleSaveSettings">
                  保存设置
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import {
  User,
  List,
  Star,
  Location,
  Ticket,
  Coin,
  Lock,
  Setting,
  Plus
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'UserCenterPage'
})

const router = useRouter()

// 用户信息
const userInfo = ref({
  id: 1,
  username: '测试用户',
  role: 'user',
  avatar: '/avatar.jpg',
  phone: '13800138000',
  email: 'test@example.com',
  points: 1000,
  pointsHistory: 5000
})

// 当前激活的菜单
const activeMenu = ref('profile')

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

// 个人资料表单
const profileFormRef = ref<FormInstance>()
const profileForm = reactive({
  username: userInfo.value.username,
  phone: userInfo.value.phone,
  email: userInfo.value.email,
  avatar: userInfo.value.avatar,
  gender: 'male',
  birthday: ''
})

const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 处理头像上传
const handleAvatarSuccess = (response: any) => {
  profileForm.avatar = response.url
}

// 保存个人资料
const handleSaveProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    // TODO: 调用保存API
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 订单相关
const orderTab = ref('all')
const orderPage = ref(1)
const orderPageSize = ref(10)
const orderTotal = ref(100)

const orders = ref([
  {
    id: '202403200001',
    status: 'unpaid',
    statusText: '待付款',
    products: [
      {
        id: 1,
        name: '红富士苹果',
        price: 29.9,
        quantity: 2,
        image: '/apple.jpg'
      }
    ],
    totalQuantity: 2,
    totalAmount: 59.8
  }
])

// 处理订单分页
const handleOrderPageChange = (val: number) => {
  orderPage.value = val
  // TODO: 获取订单列表
}

// 处理订单操作
const handlePayOrder = (order: any) => {
  // TODO: 跳转到支付页面
  ElMessage.success('正在跳转到支付页面...')
}

const handleConfirmReceive = (order: any) => {
  ElMessageBox.confirm('确认已收到商品？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 调用确认收货API
    ElMessage.success('确认收货成功')
  })
}

const handleDeleteOrder = (order: any) => {
  ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 调用删除订单API
    ElMessage.success('删除成功')
  })
}

// 收藏相关
const favoritePage = ref(1)
const favoritePageSize = ref(12)
const favoriteTotal = ref(50)

const favorites = ref([
  {
    id: 1,
    name: '红富士苹果',
    price: 29.9,
    image: '/apple.jpg'
  }
])

// 处理收藏分页
const handleFavoritePageChange = (val: number) => {
  favoritePage.value = val
  // TODO: 获取收藏列表
}

// 处理收藏操作
const handleAddToCart = (product: any) => {
  // TODO: 调用加入购物车API
  ElMessage.success('已加入购物车')
}

const handleRemoveFavorite = (product: any) => {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 调用取消收藏API
    ElMessage.success('已取消收藏')
  })
}

// 地址相关
const addresses = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '山东省',
    city: '烟台市',
    district: '芝罘区',
    detail: '某某街道某某号',
    isDefault: true
  }
])

// 处理地址操作
const handleAddAddress = () => {
  // TODO: 打开新增地址对话框
  ElMessage.success('打开新增地址对话框')
}

const handleSetDefaultAddress = (address: any) => {
  // TODO: 调用设置默认地址API
  ElMessage.success('设置成功')
}

const handleEditAddress = (address: any) => {
  // TODO: 打开编辑地址对话框
  ElMessage.success('打开编辑地址对话框')
}

const handleDeleteAddress = (address: any) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 调用删除地址API
    ElMessage.success('删除成功')
  })
}

// 优惠券相关
const couponTab = ref('available')
const couponPage = ref(1)
const couponPageSize = ref(10)
const couponTotal = ref(50)

const coupons = ref([
  {
    id: 1,
    name: '新人优惠券',
    amount: 10,
    minAmount: 100,
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    status: 'available',
    statusText: '可使用'
  }
])

// 处理优惠券分页
const handleCouponPageChange = (val: number) => {
  couponPage.value = val
  // TODO: 获取优惠券列表
}

// 积分相关
const pointsPage = ref(1)
const pointsPageSize = ref(10)
const pointsTotal = ref(100)

const pointsHistory = ref([
  {
    date: '2024-03-20',
    type: 'add',
    amount: 100,
    description: '购物获得积分'
  }
])

// 处理积分分页
const handlePointsPageChange = (val: number) => {
  pointsPage.value = val
  // TODO: 获取积分历史
}

// 账号设置
const settings = reactive({
  notifications: true,
  privacy: false,
  theme: 'light'
})

// 保存设置
const handleSaveSettings = () => {
  // TODO: 调用保存设置API
  ElMessage.success('保存成功')
}

// 账号安全操作
const handleChangePassword = () => {
  // TODO: 打开修改密码对话框
  ElMessage.success('打开修改密码对话框')
}

const handleChangePhone = () => {
  // TODO: 打开修改手机号对话框
  ElMessage.success('打开修改手机号对话框')
}

const handleChangeEmail = () => {
  // TODO: 打开修改邮箱对话框
  ElMessage.success('打开修改邮箱对话框')
}

const handleDeleteAccount = () => {
  ElMessageBox.confirm('确定要注销账号吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 调用注销账号API
    ElMessage.success('账号已注销')
  })
}

// 页面加载
onMounted(() => {
  // TODO: 获取用户信息
})
</script>

<style scoped>
.user-center {
  padding: 20px;
}

.user-nav {
  .user-info {
    text-align: center;
    padding: 20px 0;
    
    .username {
      margin: 10px 0 5px;
      font-size: 18px;
      color: #303133;
    }
    
    .user-role {
      margin: 0;
      color: #909399;
    }
  }
  
  .user-menu {
    border-right: none;
  }
}

.user-content {
  h2 {
    margin: 0 0 20px;
    font-size: 20px;
    color: #303133;
  }
}

.profile-section {
  .avatar-uploader {
    text-align: center;
    
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
    }
    
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100px;
      height: 100px;
      line-height: 100px;
      text-align: center;
      border: 1px dashed #d9d9d9;
      border-radius: 50%;
      cursor: pointer;
      
      &:hover {
        border-color: #409eff;
      }
    }
  }
}

.orders-section {
  .order-list {
    .order-item {
      margin-bottom: 20px;
      
      .order-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #ebeef5;
        
        .order-id {
          color: #606266;
        }
        
        .order-status {
          color: #f56c6c;
        }
      }
      
      .order-products {
        .product-item {
          display: flex;
          margin-bottom: 15px;
          
          .el-image {
            width: 80px;
            height: 80px;
            margin-right: 15px;
          }
          
          .product-info {
            flex: 1;
            
            h4 {
              margin: 0 0 10px;
              font-size: 16px;
              color: #303133;
            }
            
            .product-price {
              color: #f56c6c;
              margin: 0 0 5px;
            }
            
            .product-quantity {
              color: #909399;
              margin: 0;
            }
          }
        }
      }
      
      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 15px;
        border-top: 1px solid #ebeef5;
        
        .order-total {
          color: #606266;
          
          .price {
            color: #f56c6c;
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

.favorites-section {
  .favorite-item {
    margin-bottom: 20px;
    
    .el-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .favorite-info {
      padding: 15px;
      
      h4 {
        margin: 0 0 10px;
        font-size: 16px;
        color: #303133;
      }
      
      .price {
        color: #f56c6c;
        margin: 0;
      }
    }
    
    .favorite-actions {
      padding: 15px;
      border-top: 1px solid #ebeef5;
      display: flex;
      gap: 10px;
    }
  }
}

.address-section {
  .address-list {
    margin-top: 20px;
    
    .address-item {
      margin-bottom: 20px;
      
      .address-info {
        margin-bottom: 15px;
        
        .contact {
          margin-bottom: 10px;
          
          .name {
            font-weight: bold;
            margin-right: 10px;
            color: #303133;
          }
          
          .phone {
            color: #606266;
          }
        }
        
        .location {
          color: #606266;
        }
      }
      
      .address-actions {
        display: flex;
        gap: 10px;
      }
    }
  }
}

.coupons-section {
  .coupon-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
    
    .coupon-item {
      position: relative;
      display: flex;
      align-items: center;
      padding: 20px;
      background: linear-gradient(to right, #f56c6c, #f78989);
      color: #fff;
      border-radius: 4px;
      
      &.coupon-used {
        opacity: 0.5;
        background: linear-gradient(to right, #909399, #a6a9ad);
      }
      
      .coupon-amount {
        margin-right: 20px;
        
        .currency {
          font-size: 20px;
        }
        
        .number {
          font-size: 36px;
          font-weight: bold;
        }
      }
      
      .coupon-info {
        flex: 1;
        
        h4 {
          margin: 0 0 10px;
          font-size: 16px;
        }
        
        .condition {
          margin: 0 0 5px;
          font-size: 14px;
        }
        
        .validity {
          margin: 0;
          font-size: 12px;
        }
      }
      
      .coupon-status {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 14px;
      }
    }
  }
}

.points-section {
  .points-overview {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    
    .points-card {
      flex: 1;
      text-align: center;
      padding: 20px;
      background: linear-gradient(to right, #409eff, #79bbff);
      color: #fff;
      border-radius: 4px;
      
      .points-amount {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      
      .points-label {
        font-size: 14px;
      }
    }
  }
  
  .points-history {
    h3 {
      margin: 0 0 20px;
      font-size: 16px;
      color: #303133;
    }
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 
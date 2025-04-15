<template>
  <div class="user-center-container">
    <el-row :gutter="20">
      <!-- 左侧导航 -->
      <el-col :span="6">
        <el-card class="user-sidebar">
          <div class="user-info">
            <el-avatar :size="80" :src="userStore.userInfo?.avatar || defaultAvatar" />
            <h3>{{ userStore.userInfo?.nickname || '未登录' }}</h3>
            <p>{{ userStore.userInfo?.role === 'admin' ? '管理员' : '普通用户' }}</p>
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
            <el-menu-item index="address">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </el-menu-item>
            <el-menu-item index="favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="coupons">
              <el-icon><Ticket /></el-icon>
              <span>优惠券</span>
            </el-menu-item>
            <el-menu-item index="messages">
              <el-icon><Message /></el-icon>
              <span>消息中心</span>
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
        <!-- 个人资料 -->
        <el-card v-if="activeMenu === 'profile'" class="content-card">
          <template #header>
            <div class="card-header">
              <span>个人资料</span>
              <el-button type="primary" @click="editProfile">编辑资料</el-button>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">{{ userStore.userInfo?.username }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ userStore.userInfo?.nickname }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userStore.userInfo?.email }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ userStore.userInfo?.phone }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatDate(userStore.userInfo?.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="上次登录">{{ formatDate(userStore.userInfo?.updatedAt) }}</el-descriptions-item>
          </el-descriptions>
          
          <!-- 修改头像 -->
          <div class="avatar-section">
            <h3>修改头像</h3>
            <div class="avatar-upload">
              <el-avatar :size="100" :src="userStore.userInfo?.avatar || defaultAvatar" />
              <el-upload
                class="avatar-uploader"
                action="/api/user/avatar"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <el-button type="primary">上传新头像</el-button>
              </el-upload>
            </div>
          </div>
          
          <!-- 修改密码 -->
          <div class="password-section">
            <h3>修改密码</h3>
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
              <el-form-item label="当前密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="changePassword">修改密码</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
        
        <!-- 收货地址 -->
        <el-card v-if="activeMenu === 'address'" class="content-card">
          <template #header>
            <div class="card-header">
              <span>收货地址</span>
              <el-button type="primary" @click="addNewAddress">新增地址</el-button>
            </div>
          </template>
          
          <el-empty v-if="addresses.length === 0" description="暂无收货地址" />
          
          <div v-else class="address-list">
            <el-card v-for="address in addresses" :key="address.id" class="address-item">
              <div class="address-content">
                <div class="address-info">
                  <span class="address-name">{{ address.name }}</span>
                  <span class="address-phone">{{ address.phone }}</span>
                  <el-tag v-if="address.isDefault" type="success" size="small">默认地址</el-tag>
                </div>
                <div class="address-detail">
                  {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
                </div>
              </div>
              <div class="address-actions">
                <el-button type="text" @click="editAddress(address)">编辑</el-button>
                <el-button type="text" @click="setDefaultAddress(address.id)" :disabled="address.isDefault">设为默认</el-button>
                <el-button type="text" @click="deleteAddress(address.id)" :disabled="address.isDefault">删除</el-button>
              </div>
            </el-card>
          </div>
        </el-card>
        
        <!-- 我的收藏 -->
        <el-card v-if="activeMenu === 'favorites'" class="content-card">
          <template #header>
            <div class="card-header">
              <span>我的收藏</span>
            </div>
          </template>
          
          <el-empty v-if="favorites.length === 0" description="暂无收藏商品" />
          
          <div v-else class="favorites-list">
            <el-row :gutter="20">
              <el-col :span="8" v-for="product in favorites" :key="product.id">
                <el-card class="favorite-item" @click="navigateToProduct(product.id)">
                  <img :src="product.image" :alt="product.name" class="product-image" />
                  <div class="product-info">
                    <h3 class="product-name">{{ product.name }}</h3>
                    <div class="product-price">¥{{ product.price }}</div>
                  </div>
                  <div class="favorite-actions">
                    <el-button type="danger" circle @click.stop="removeFavorite(product.id)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                    <el-button type="primary" circle @click.stop="addToCart(product.id)">
                      <el-icon><ShoppingCart /></el-icon>
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="favoritesPage"
              v-model:page-size="favoritesPageSize"
              :page-sizes="[12, 24, 36, 48]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalFavorites"
              @size-change="handleFavoriteSizeChange"
              @current-change="handleFavoritePageChange"
            />
          </div>
        </el-card>
        
        <!-- 优惠券 -->
        <el-card v-if="activeMenu === 'coupons'" class="content-card">
          <template #header>
            <div class="card-header">
              <span>优惠券</span>
            </div>
          </template>
          
          <el-tabs v-model="couponTab">
            <el-tab-pane label="未使用" name="unused">
              <el-empty v-if="unusedCoupons.length === 0" description="暂无未使用优惠券" />
              <div v-else class="coupon-list">
                <div v-for="coupon in unusedCoupons" :key="coupon.id" class="coupon-item">
                  <div class="coupon-amount">¥{{ coupon.type === 'fixed' ? coupon.value : coupon.value + '%' }}</div>
                  <div class="coupon-info">
                    <div class="coupon-name">{{ coupon.name }}</div>
                    <div class="coupon-condition">满{{ coupon.minAmount }}元可用</div>
                    <div class="coupon-time">{{ formatDate(coupon.startTime) }} - {{ formatDate(coupon.endTime) }}</div>
                  </div>
                  <div class="coupon-action">
                    <el-button type="primary" @click="useCoupon(coupon)">去使用</el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="已使用" name="used">
              <el-empty v-if="usedCoupons.length === 0" description="暂无已使用优惠券" />
              <div v-else class="coupon-list used-coupons">
                <div v-for="coupon in usedCoupons" :key="coupon.id" class="coupon-item">
                  <div class="coupon-amount">¥{{ coupon.type === 'fixed' ? coupon.value : coupon.value + '%' }}</div>
                  <div class="coupon-info">
                    <div class="coupon-name">{{ coupon.name }}</div>
                    <div class="coupon-condition">满{{ coupon.minAmount }}元可用</div>
                    <div class="coupon-time">{{ formatDate(coupon.startTime) }} - {{ formatDate(coupon.endTime) }}</div>
                    <div class="coupon-used-time">使用时间: {{ formatDate(coupon.usedTime) }}</div>
                  </div>
                  <div class="coupon-status">已使用</div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="已过期" name="expired">
              <el-empty v-if="expiredCoupons.length === 0" description="暂无已过期优惠券" />
              <div v-else class="coupon-list expired-coupons">
                <div v-for="coupon in expiredCoupons" :key="coupon.id" class="coupon-item">
                  <div class="coupon-amount">¥{{ coupon.type === 'fixed' ? coupon.value : coupon.value + '%' }}</div>
                  <div class="coupon-info">
                    <div class="coupon-name">{{ coupon.name }}</div>
                    <div class="coupon-condition">满{{ coupon.minAmount }}元可用</div>
                    <div class="coupon-time">{{ formatDate(coupon.startTime) }} - {{ formatDate(coupon.endTime) }}</div>
                  </div>
                  <div class="coupon-status">已过期</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
        
        <!-- 消息中心 -->
        <el-card v-if="activeMenu === 'messages'" class="content-card">
          <template #header>
            <div class="card-header">
              <span>消息中心</span>
              <el-button type="primary" @click="markAllAsRead" :disabled="unreadMessages.length === 0">全部标为已读</el-button>
            </div>
          </template>
          
          <el-tabs v-model="messageTab">
            <el-tab-pane label="未读消息" name="unread">
              <el-empty v-if="unreadMessages.length === 0" description="暂无未读消息" />
              <div v-else class="message-list">
                <div v-for="message in unreadMessages" :key="message.id" class="message-item unread">
                  <div class="message-header">
                    <span class="message-title">{{ message.title }}</span>
                    <span class="message-time">{{ formatDate(message.createdAt) }}</span>
                  </div>
                  <div class="message-content">{{ message.content }}</div>
                  <div class="message-actions">
                    <el-button type="text" @click="markAsRead(message.id)">标为已读</el-button>
                    <el-button type="text" @click="deleteMessage(message.id)">删除</el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="已读消息" name="read">
              <el-empty v-if="readMessages.length === 0" description="暂无已读消息" />
              <div v-else class="message-list">
                <div v-for="message in readMessages" :key="message.id" class="message-item">
                  <div class="message-header">
                    <span class="message-title">{{ message.title }}</span>
                    <span class="message-time">{{ formatDate(message.createdAt) }}</span>
                  </div>
                  <div class="message-content">{{ message.content }}</div>
                  <div class="message-actions">
                    <el-button type="text" @click="deleteMessage(message.id)">删除</el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="messagesPage"
              v-model:page-size="messagesPageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalMessages"
              @size-change="handleMessageSizeChange"
              @current-change="handleMessagePageChange"
            />
          </div>
        </el-card>
        
        <!-- 账号设置 -->
        <el-card v-if="activeMenu === 'settings'" class="content-card">
          <template #header>
            <div class="card-header">
              <span>账号设置</span>
            </div>
          </template>
          
          <el-form :model="settingsForm" label-width="100px">
            <el-form-item label="消息通知">
              <el-switch v-model="settingsForm.enableNotification" />
              <span class="setting-desc">接收订单和活动相关的消息通知</span>
            </el-form-item>
            <el-form-item label="邮件订阅">
              <el-switch v-model="settingsForm.enableEmailSubscription" />
              <span class="setting-desc">接收促销和新品信息的邮件</span>
            </el-form-item>
            <el-form-item label="隐私设置">
              <el-switch v-model="settingsForm.enablePrivacy" />
              <span class="setting-desc">允许系统记录您的浏览历史用于个性化推荐</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
          
          <el-divider />
          
          <div class="danger-zone">
            <h3>危险操作</h3>
            <el-button type="danger" @click="confirmLogout">退出登录</el-button>
            <el-button type="danger" @click="confirmDeleteAccount">注销账号</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 编辑个人资料对话框 -->
    <el-dialog v-model="profileDialogVisible" title="编辑个人资料" width="500px">
      <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="80px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="profileForm.nickname" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="profileForm.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="profileDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 新增/编辑地址对话框 -->
    <el-dialog v-model="addressDialogVisible" :title="isEditingAddress ? '编辑地址' : '新增地址'" width="500px">
      <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="80px">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="addressRegion"
            :options="regionOptions"
            placeholder="请选择所在地区"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="addressForm.detail" type="textarea" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">设为默认收货地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAddress">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, List, Location, Star, Ticket, Message, Setting, Delete, ShoppingCart } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import type { Address } from '@/types/address'
import type { UserMessage } from '@/types/message'
import dayjs from 'dayjs'
import type { Product } from '@/types/product'
import type { Coupon } from '@/types/coupon'

const router = useRouter()
const userStore = useUserStore()

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 当前选中的菜单
const activeMenu = ref('profile')

// 处理菜单选择
const handleMenuSelect = (key: string) => {
  activeMenu.value = key
}

// 格式化日期
const formatDate = (date?: string) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 个人资料相关
const profileDialogVisible = ref(false)
const profileFormRef = ref<FormInstance>()
const profileForm = reactive({
  nickname: '',
  email: '',
  phone: ''
})
const profileRules = reactive<FormRules>({
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
})

// 打开编辑个人资料对话框
const editProfile = () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  
  profileForm.nickname = userStore.userInfo.nickname
  profileForm.email = userStore.userInfo.email
  profileForm.phone = userStore.userInfo.phone
  
  profileDialogVisible.value = true
}

// 保存个人资料
const saveProfile = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 发送请求更新个人资料
        // 这里应该调用实际的API
        // await userApi.updateProfile(profileForm)
        
        // 模拟成功
        setTimeout(() => {
          if (userStore.userInfo) {
            userStore.setUserInfo({
              ...userStore.userInfo,
              nickname: profileForm.nickname,
              email: profileForm.email,
              phone: profileForm.phone
            })
          }
          
          profileDialogVisible.value = false
          ElMessage.success('个人资料更新成功')
        }, 500)
      } catch (error) {
        console.error('更新个人资料失败', error)
        ElMessage.error('更新个人资料失败')
      }
    }
  })
}

// 处理头像上传成功
const handleAvatarSuccess = (response: any) => {
  if (userStore.userInfo) {
    userStore.setUserInfo({
      ...userStore.userInfo,
      avatar: response.data.url
    })
  }
  ElMessage.success('头像上传成功')
}

// 头像上传前的校验
const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isJPG && !isPNG) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 修改密码相关
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 发送请求修改密码
        // 这里应该调用实际的API
        // await userApi.changePassword(passwordForm)
        
        // 模拟成功
        setTimeout(() => {
          passwordForm.oldPassword = ''
          passwordForm.newPassword = ''
          passwordForm.confirmPassword = ''
          
          ElMessage.success('密码修改成功')
        }, 500)
      } catch (error) {
        console.error('修改密码失败', error)
        ElMessage.error('修改密码失败')
      }
    }
  })
}

// 收货地址相关
const addresses = ref<Address[]>([])
const addressDialogVisible = ref(false)
const isEditingAddress = ref(false)
const addressFormRef = ref<FormInstance>()
const addressForm = reactive<Partial<Address>>({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})
const addressRegion = ref<string[]>([])
const addressRules = {
  name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  region: [{ required: true, message: '请选择所在地区', trigger: 'change' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

// 地区选项（模拟数据）
const regionOptions = ref([
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '东城区', label: '东城区' },
          { value: '西城区', label: '西城区' },
          { value: '朝阳区', label: '朝阳区' },
          { value: '海淀区', label: '海淀区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '黄浦区', label: '黄浦区' },
          { value: '徐汇区', label: '徐汇区' },
          { value: '长宁区', label: '长宁区' },
          { value: '静安区', label: '静安区' }
        ]
      }
    ]
  }
])

// 获取收货地址列表
const fetchAddresses = async () => {
  try {
    // 这里应该调用实际的API
    // 模拟数据
    addresses.value = [
      {
        id: 1,
        userId: 1,
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '海淀区',
        detail: '清华大学',
        isDefault: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        userId: 1,
        name: '李四',
        phone: '13900139000',
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        detail: '陆家嘴',
        isDefault: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  } catch (error) {
    console.error('获取收货地址失败:', error)
  }
}

// 新增地址
const addNewAddress = () => {
  addressForm.name = ''
  addressForm.phone = ''
  addressForm.province = ''
  addressForm.city = ''
  addressForm.district = ''
  addressForm.detail = ''
  addressForm.isDefault = false
  addressRegion.value = []
  addressDialogVisible.value = true
}

// 编辑地址
const editAddress = (address: Address) => {
  addressForm.name = address.name
  addressForm.phone = address.phone
  addressForm.province = address.province
  addressForm.city = address.city
  addressForm.district = address.district
  addressForm.detail = address.detail
  addressForm.isDefault = address.isDefault
  addressRegion.value = [address.province, address.city, address.district]
  addressDialogVisible.value = true
}

// 保存地址
const saveAddress = () => {
  if (!addressFormRef.value) return
  
  addressFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 发送请求保存地址
        // 这里应该调用实际的API
        // await userApi.saveAddress(addressForm)
        
        // 模拟成功
        setTimeout(() => {
          if (userStore.userInfo) {
            userStore.setUserInfo({
              ...userStore.userInfo,
              addresses: [
                ...userStore.userInfo.addresses,
                addressForm as Address
              ]
            })
          }
          
          addressDialogVisible.value = false
          ElMessage.success('地址保存成功')
        }, 500)
      } catch (error) {
        console.error('保存地址失败', error)
        ElMessage.error('保存地址失败')
      }
    }
  })
}

// 设置默认地址
const setDefaultAddress = (addressId: number) => {
  if (userStore.userInfo) {
    userStore.setUserInfo({
      ...userStore.userInfo,
      addresses: userStore.userInfo.addresses.map((address) =>
        address.id === addressId ? { ...address, isDefault: true } : { ...address, isDefault: false }
      )
    })
  }
}

// 删除地址
const deleteAddress = (addressId: number) => {
  if (userStore.userInfo) {
    userStore.setUserInfo({
      ...userStore.userInfo,
      addresses: userStore.userInfo.addresses.filter((address) => address.id !== addressId)
    })
  }
}

// 导航到产品详情
const navigateToProduct = (id: number) => {
  router.push(`/products/${id}`)
}

// 处理收藏
const favorites = ref<Product[]>([])
const favoritesPage = ref(1)
const favoritesPageSize = ref(12)
const totalFavorites = ref(0)

// 获取收藏列表
const fetchFavorites = async () => {
  try {
    // 这里应该调用实际的API
    // 模拟数据
    favorites.value = [
      {
        id: 1,
        name: '红富士苹果',
        description: '新鲜采摘，甜脆可口',
        price: 29.9,
        image: '/apple.jpg',
        images: ['/apple-1.jpg', '/apple-2.jpg'],
        categoryId: 11,
        category: {
          id: 11,
          name: '苹果',
          icon: 'apple-icon',
          level: 2,
          sort: 1,
          description: '新鲜水果',
          parentId: 1,
          children: []
        },
        stock: 100,
        sales: 500,
        rating: 4.5,
        reviews: 128,
        tags: ['新鲜', '甜脆', '有机'],
        specifications: {
          '产地': '山东烟台',
          '规格': '500g/份',
          '保质期': '7天'
        },
        isOnSale: true,
        createdAt: '2024-03-20',
        updatedAt: '2024-03-20'
      }
    ]
    totalFavorites.value = 100
  } catch (error) {
    console.error('获取收藏列表失败:', error)
  }
}

// 处理收藏列表分页
const handleFavoriteSizeChange = (size: number) => {
  favoritesPageSize.value = size
  fetchFavorites()
}

const handleFavoritePageChange = (page: number) => {
  favoritesPage.value = page
  fetchFavorites()
}

// 处理收藏
const addToCart = (id: number) => {
  // 实现添加到购物车逻辑
  console.log(`添加商品到购物车: ${id}`)
}

const removeFavorite = (id: number) => {
  // 实现移除收藏逻辑
  console.log(`移除收藏: ${id}`)
}

// 优惠券相关
const couponTab = ref('unused')
const unusedCoupons = ref<Coupon[]>([])
const usedCoupons = ref<Coupon[]>([])
const expiredCoupons = ref<Coupon[]>([])

// 获取优惠券列表
const fetchCoupons = async () => {
  try {
    // 这里应该调用实际的API
    // 模拟数据
    unusedCoupons.value = [
      {
        id: 1,
        name: '满100减20',
        type: 'fixed',
        value: 20,
        minAmount: 100,
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-12-31T23:59:59Z',
        isUsed: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
    usedCoupons.value = []
    expiredCoupons.value = []
  } catch (error) {
    console.error('获取优惠券列表失败:', error)
  }
}

// 使用优惠券
const useCoupon = (coupon: Coupon) => {
  // 实现使用优惠券的逻辑
}

// 消息中心相关
const messageTab = ref('unread')
const unreadMessages = ref<UserMessage[]>([])
const readMessages = ref<UserMessage[]>([])
const messagesPage = ref(1)
const messagesPageSize = ref(10)
const totalMessages = ref(0)

// 获取消息列表
const fetchMessages = async () => {
  try {
    // 这里应该调用实际的API
    // 模拟数据
    unreadMessages.value = [
      {
        id: 1,
        title: '新订单通知',
        content: '您有一个新的订单待处理',
        createdAt: '2024-03-20'
      }
    ]
    readMessages.value = []
    totalMessages.value = 100
  } catch (error) {
    console.error('获取消息列表失败:', error)
  }
}

// 处理消息列表分页
const handleMessageSizeChange = (size: number) => {
  messagesPageSize.value = size
  fetchMessages()
}

const handleMessagePageChange = (page: number) => {
  messagesPage.value = page
  fetchMessages()
}

// 处理消息
const markAsRead = (id: number) => {
  // 实现标记为已读逻辑
  console.log(`标记消息为已读: ${id}`)
}

const deleteMessage = (id: number) => {
  // 实现删除消息逻辑
  console.log(`删除消息: ${id}`)
}

// 处理所有未读消息标记为已读
const markAllAsRead = () => {
  // 实现标记所有未读消息为已读逻辑
  console.log('标记所有未读消息为已读')
}

// 账号设置相关
const settingsForm = reactive({
  enableNotification: true,
  enableEmailSubscription: true,
  enablePrivacy: true
})

// 保存账号设置
const saveSettings = () => {
  // 实现保存账号设置逻辑
  console.log('保存账号设置')
}

// 确认退出登录
const confirmLogout = () => {
  // 实现确认退出登录逻辑
  console.log('确认退出登录')
}

// 确认注销账号
const confirmDeleteAccount = () => {
  // 实现确认注销账号逻辑
  console.log('确认注销账号')
}

onMounted(() => {
  fetchAddresses()
  fetchFavorites()
  fetchMessages()
})
</script>

<style scoped lang="scss">
.user-center-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;

  .user-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;

    .user-card {
      grid-row: span 2;

      .user-info {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;

        .user-detail {
          h2 {
            margin: 0 0 5px;
            font-size: 20px;
          }

          .user-id {
            margin: 0;
            color: #909399;
            font-size: 14px;
          }
        }
      }

      .user-stats {
        display: flex;
        justify-content: space-around;
        text-align: center;

        .stat-item {
          .value {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 5px;
          }

          .label {
            color: #909399;
            font-size: 14px;
          }
        }
      }
    }

    .order-card {
      .order-status {
        display: flex;
        justify-content: space-around;
        padding: 20px 0;

        .status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;

          span {
            color: #606266;
            font-size: 14px;
          }
        }
      }
    }

    .service-card {
      .service-list {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        padding: 20px 0;

        .service-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;

          span {
            color: #606266;
            font-size: 14px;
          }
        }
      }
    }

    .recent-card {
      .recent-products {
        .product-list {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;

          .product-item {
            cursor: pointer;

            .product-image {
              width: 100%;
              height: 200px;
              object-fit: cover;
              border-radius: 4px;
              margin-bottom: 10px;
            }

            .product-info {
              h3 {
                margin: 0 0 5px;
                font-size: 14px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }

              .price {
                margin: 0;
                color: #f56c6c;
                font-weight: bold;
              }
            }
          }
        }
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
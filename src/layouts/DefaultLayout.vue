<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="router.push('/')">
          <img src="@/assets/logo.svg" alt="Logo" />
          <span>电子商城</span>
        </div>
        <nav class="nav-menu">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/products" class="nav-item">全部商品</router-link>
          <router-link to="/cart" class="nav-item">
            购物车
            <el-badge v-if="cartCount > 0" :value="cartCount" class="cart-badge" />
          </router-link>
          <router-link to="/orders" class="nav-item">我的订单</router-link>
        </nav>
        <div class="user-menu">
          <template v-if="isLoggedIn">
            <el-dropdown trigger="click">
              <div class="user-info">
                <el-avatar :size="32" :src="userInfo.avatar || defaultAvatar">
                  {{ userInfo.nickname?.[0]?.toUpperCase() || userInfo.username?.[0]?.toUpperCase() }}
                </el-avatar>
                <span class="username">{{ userInfo.nickname || userInfo.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/profile')">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="router.push('/favorites')">
                    <el-icon><Star /></el-icon>我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item @click="router.push('/address')">
                    <el-icon><Location /></el-icon>收货地址
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" @click="router.push('/auth/login')">登录</el-button>
            <el-button @click="router.push('/auth/register')">注册</el-button>
          </template>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>电子商城致力于为您提供优质的购物体验</p>
        </div>
        <div class="footer-section">
          <h3>客户服务</h3>
          <ul>
            <li><a href="#">帮助中心</a></li>
            <li><a href="#">联系我们</a></li>
            <li><a href="#">售后服务</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>关注我们</h3>
          <div class="social-links">
            <a href="#"><el-icon><Message /></el-icon></a>
            <a href="#"><el-icon><Star /></el-icon></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 电子商城. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Star, Location, SwitchButton, Message } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { getCartCount } from '@/api/cart'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => {
  if (!userStore.userInfo) return { nickname: '', avatar: '', username: '' }
  return {
    nickname: userStore.userInfo.nickname || '',
    avatar: userStore.userInfo.avatar || '',
    username: userStore.userInfo.username || ''
  }
})
const cartCount = ref(0)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 获取购物车数量
const fetchCartCount = async () => {
  try {
    const response = await getCartCount()
    if (response.code === 0) {
      cartCount.value = response.data
    }
  } catch (error) {
    console.error('获取购物车数量失败:', error)
  }
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await userStore.handleLogout()
    ElMessage.success('已退出登录')
    router.push('/auth/login')
  } catch (error) {
    // 用户取消操作
  }
}

onMounted(() => {
  if (userStore.token && !userStore.userInfo) {
    userStore.fetchUserInfo()
  }
  fetchCartCount()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  transition: transform 0.3s ease;
}

.header.hide {
  transform: translateY(-100%);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 8px;
}

.logo:hover {
  transform: scale(1.05);
  background-color: rgba(64, 158, 255, 0.1);
}

.logo img {
  height: 32px;
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.logo:hover img {
  transform: rotate(5deg);
}

.logo span {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  background: linear-gradient(45deg, #409EFF, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  display: flex;
  gap: 32px;
}

.nav-item {
  color: #666;
  text-decoration: none;
  font-size: 16px;
  position: relative;
  padding: 8px 0;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #409EFF;
  transform: translateY(-2px);
}

.nav-item.router-link-active {
  color: #409EFF;
  font-weight: 500;
}

.nav-item.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #409EFF, #36cfc9);
  border-radius: 2px;
  transform: scaleX(1);
  transition: transform 0.3s ease;
}

.nav-item:hover::after {
  transform: scaleX(1.1);
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -16px;
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.nav-item:hover .cart-badge {
  transform: scale(1);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.user-info:hover {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  transform: translateY(-2px);
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 84px auto 40px;
  padding: 0 20px;
  width: 100%;
  animation: fadeIn 0.5s ease;
}

.footer {
  background: #fff;
  padding: 40px 0 20px;
  margin-top: auto;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  padding: 0 20px;
}

.footer-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
  position: relative;
  padding-bottom: 8px;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #409EFF, #36cfc9);
  border-radius: 2px;
}

.footer-section p {
  color: #666;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 12px;
}

.footer-section ul li a {
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.footer-section ul li a:hover {
  color: #409EFF;
  transform: translateX(4px);
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-links a {
  color: #666;
  font-size: 24px;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 50%;
  background: #f5f7fa;
}

.social-links a:hover {
  color: #409EFF;
  transform: translateY(-4px);
  background: #ecf5ff;
}

.footer-bottom {
  max-width: 1200px;
  margin: 40px auto 0;
  padding: 20px;
  text-align: center;
  border-top: 1px solid #eee;
  color: #999;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .nav-menu {
    gap: 16px;
  }

  .nav-item {
    font-size: 14px;
  }

  .main-content {
    padding: 0 16px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .logo span {
    font-size: 18px;
  }

  .user-info {
    padding: 4px 8px;
  }

  .username {
    display: none;
  }
}
</style> 
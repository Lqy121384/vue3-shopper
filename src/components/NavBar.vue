<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <img src="@/assets/logo.png" alt="Logo" />
        <span>电子商城</span>
      </router-link>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索商品"
          :prefix-icon="Search"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- 导航菜单 -->
      <div class="nav-menu">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/categories" class="nav-item">分类</router-link>
        <router-link to="/flash-sale" class="nav-item">限时特惠</router-link>
        <router-link to="/new-arrivals" class="nav-item">新品上市</router-link>
        <router-link to="/brands" class="nav-item">品牌</router-link>
      </div>

      <!-- 用户操作区 -->
      <div class="user-actions">
        <router-link to="/cart" class="action-item">
          <el-badge :value="cartCount" :hidden="cartCount === 0">
            <el-icon :size="24"><ShoppingCart /></el-icon>
          </el-badge>
        </router-link>
        <router-link to="/orders" class="action-item">
          <el-icon :size="24"><List /></el-icon>
        </router-link>
        <template v-if="isLoggedIn">
          <el-dropdown>
            <span class="user-profile">
              <el-avatar :size="32" :src="userAvatar" />
              <span class="username">{{ username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">个人中心</el-dropdown-item>
                <el-dropdown-item @click="router.push('/settings')">设置</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" @click="router.push('/login')">登录</el-button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Search, ShoppingCart, List } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const searchQuery = ref('')
const cartCount = ref(0)

const isLoggedIn = computed(() => userStore.isLoggedIn)
const username = computed(() => userStore.userInfo?.username || '')
const userAvatar = computed(() => userStore.userInfo?.avatar || '')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value }
    })
  }
}

const handleLogout = async () => {
  try {
    await userStore.handleLogout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    ElMessage.error('退出登录失败')
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #303133;
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
}

.logo img {
  height: 32px;
  margin-right: 8px;
}

.search-box {
  width: 300px;
  margin-right: 40px;
}

.nav-menu {
  display: flex;
  gap: 20px;
  margin-right: 40px;
}

.nav-item {
  text-decoration: none;
  color: #606266;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-item:hover {
  color: #409EFF;
  background-color: #ecf5ff;
}

.nav-item.router-link-active {
  color: #409EFF;
  font-weight: 500;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
}

.action-item {
  color: #606266;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
}

.action-item:hover {
  color: #409EFF;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #606266;
}
</style> 
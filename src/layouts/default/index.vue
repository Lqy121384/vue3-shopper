<template>
  <el-container class="layout-container">
    <el-header height="60px">
      <div class="header-content">
        <div class="logo">
          <router-link to="/">
            <img src="@/assets/logo.png" alt="Logo" />
            <span>农产品商城</span>
          </router-link>
        </div>
        <el-menu
          mode="horizontal"
          :router="true"
          :default-active="activeMenu"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/products">商品列表</el-menu-item>
          <el-menu-item index="/ai-assistant">AI助手</el-menu-item>
        </el-menu>
        <div class="user-actions">
          <template v-if="userStore.userInfo">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :src="userStore.userInfo.avatar" />
                {{ userStore.userInfo.nickname }}
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <router-link to="/user">个人中心</router-link>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <router-link to="/order">我的订单</router-link>
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/auth/login">
              <el-button type="primary">登录</el-button>
            </router-link>
            <router-link to="/auth/register">
              <el-button>注册</el-button>
            </router-link>
          </template>
        </div>
      </div>
    </el-header>
    <el-main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
    <el-footer height="60px">
      <div class="footer-content">
        <p>© 2024 农产品电子商城. All rights reserved.</p>
      </div>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    })
    // 清除用户状态
    userStore.$reset()
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('user-store')
    router.push('/auth/login')
  } catch {
    // 用户取消操作
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  min-height: 100vh;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;

  .logo {
    a {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: #333;

      img {
        height: 40px;
        margin-right: 10px;
      }

      span {
        font-size: 20px;
        font-weight: bold;
      }
    }
  }

  .user-actions {
    display: flex;
    align-items: center;
    gap: 10px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
  }
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 
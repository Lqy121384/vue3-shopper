<template>
  <div class="auth-layout">
    <div class="container">
      <div class="logo">
        <el-icon :size="64" color="#409EFF"><Shop /></el-icon>
        <h1>{{ title }}</h1>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Shop } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const title = computed(() => {
  switch (route.name) {
    case 'login':
      return '欢迎回来'
    case 'register':
      return '创建账号'
    case 'forgot-password':
      return '找回密码'
    default:
      return '欢迎'
  }
})

onMounted(() => {
  // 如果已登录，跳转到首页
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color-light);
}

.container {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: var(--el-bg-color);
  border-radius: var(--el-border-radius-base);
  box-shadow: var(--el-box-shadow-light);
}

.logo {
  text-align: center;
  margin-bottom: 40px;
}

.logo h1 {
  margin: 16px 0 0;
  color: var(--el-text-color-primary);
  font-size: 24px;
  font-weight: 500;
}
</style> 
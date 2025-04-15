<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <img src="@/assets/error/404.svg" alt="404" class="error-image" />
      <h1>页面不存在</h1>
      <p>抱歉，您访问的页面不存在或已被删除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.not-found-content {
  text-align: center;
  padding: 40px;
}

.error-image {
  width: 300px;
  margin-bottom: 30px;
}

h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 20px;
}

p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 30px;
}
</style>
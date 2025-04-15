<script setup lang="ts">
import { RouterView } from 'vue-router'
import AIAssistant from '@/components/AIAssistant.vue'
</script>

<template>
  <div class="app">
    <router-view />
    <AIAssistant />
  </div>
</template>

<style>
:root {
  --el-color-primary: #409eff;
  --el-color-success: #67c23a;
  --el-color-warning: #e6a23c;
  --el-color-danger: #f56c6c;
  --el-color-info: #909399;
  
  --el-text-color-primary: #303133;
  --el-text-color-regular: #606266;
  --el-text-color-secondary: #909399;
  
  --el-border-radius-base: 4px;
  --el-transition-duration: 0.3s;
  --el-transition-timing-function: ease-in-out;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}

a {
  color: var(--el-color-primary);
  text-decoration: none;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>

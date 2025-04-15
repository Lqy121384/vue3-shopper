<template>
  <div class="not-found">
    <div class="container">
      <div class="content">
        <h1>404</h1>
        <h2>页面未找到</h2>
        <p>抱歉，您访问的页面不存在。</p>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  text-align: center;
}

h1 {
  font-size: 120px;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: var(--font-size-extra-large);
  color: var(--color-text-primary);
  margin: 16px 0;
}

p {
  color: var(--color-text-regular);
  margin-bottom: 24px;
}
</style> 
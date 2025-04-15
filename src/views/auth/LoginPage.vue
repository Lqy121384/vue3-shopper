<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    @submit.prevent="handleSubmit"
    class="login-form"
  >
    <h2 class="form-title">登录</h2>
    
    <el-form-item prop="username">
      <el-input 
        v-model="form.username" 
        placeholder="用户名"
        :prefix-icon="User"
      />
    </el-form-item>
    
    <el-form-item prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="密码"
        show-password
        :prefix-icon="Lock"
      />
    </el-form-item>
    
    <el-form-item>
      <el-button
        type="primary"
        native-type="submit"
        :loading="loading"
        class="submit-btn"
      >
        登录
      </el-button>
    </el-form-item>
    
    <div class="action-links">
      <router-link to="/auth/register">注册账号</router-link>
      <router-link to="/auth/forgot-password">忘记密码？</router-link>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 先进行表单验证
    const valid = await formRef.value.validate()
    if (!valid) {
      console.error('Form validation failed:', formRef.value.validate())
      return
    }
    
    loading.value = true
    
    console.log('Attempting login with:', { username: form.username })
    const success = await userStore.handleLogin(form.username, form.password)
    
    if (success) {
      console.log('Login successful, redirecting to home page')
      // 如果有重定向地址，跳转到重定向地址
      const redirectPath = route.query.redirect as string
      router.push(redirectPath || '/')
      ElMessage.success('登录成功')
    } else {
      console.error('Login failed')
      ElMessage.error('登录失败，请检查用户名和密码')
    }
  } catch (error: any) {
    console.error('Login error:', error)
    // 如果是表单验证错误，显示具体的错误信息
    if (error.username || error.password) {
      const errorMessages = []
      if (error.username) errorMessages.push(error.username.join('，'))
      if (error.password) errorMessages.push(error.password.join('，'))
      ElMessage.error(errorMessages.join('；'))
    } else {
      ElMessage.error(error.message || '登录失败，请重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-form {
  width: 100%;
  padding: 20px;
}

.form-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.submit-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.action-links {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.action-links a {
  color: var(--el-color-primary);
  text-decoration: none;
}

.action-links a:hover {
  opacity: 0.8;
}

:deep(.el-form-item__label) {
  font-size: 16px;
}

:deep(.el-input__wrapper) {
  padding: 4px 11px;
}

:deep(.el-input__inner) {
  height: 40px;
  font-size: 16px;
}
</style> 
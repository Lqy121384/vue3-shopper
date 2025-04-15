<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <h2>农产品电子商城</h2>
      </div>
      
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
          >
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="loginForm.username" 
                placeholder="请输入用户名"
                prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item label="密码" prop="password">
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <div class="remember-forgot">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-button type="text" @click="forgotPassword">忘记密码？</el-button>
            </div>
            
            <el-form-item>
              <el-button type="primary" class="login-button" @click="handleLogin" :loading="isLoading">登录</el-button>
            </el-form-item>
            
            <div class="other-login">
              <p>其他登录方式</p>
              <div class="social-login">
                <el-button circle>
                  <el-icon><i-ep-apple /></el-icon>
                </el-button>
                <el-button circle>
                  <el-icon><i-ep-basketball /></el-icon>
                </el-button>
                <el-button circle>
                  <el-icon><i-ep-baseball /></el-icon>
                </el-button>
              </div>
            </div>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="注册" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-position="top"
          >
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="registerForm.username" 
                placeholder="请输入用户名"
                prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item label="密码" prop="password">
              <el-input 
                v-model="registerForm.password" 
                type="password" 
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input 
                v-model="registerForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入密码"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input 
                v-model="registerForm.email" 
                placeholder="请输入邮箱"
                prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input 
                v-model="registerForm.phone" 
                placeholder="请输入手机号"
                prefix-icon="Phone"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" class="register-button" @click="handleRegister" :loading="isLoading">注册</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, Message, Phone } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import type { LoginForm, RegisterForm } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()

// 标签页
const activeTab = ref('login')

// 记住我
const rememberMe = ref(false)

// 加载状态
const isLoading = ref(false)

// 登录表单
const loginFormRef = ref<FormInstance>()
const loginForm = reactive<LoginForm>({
  username: '',
  password: ''
})

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

// 注册表单
const registerFormRef = ref<FormInstance>()
const registerForm = reactive<RegisterForm>({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: ''
})

// 注册表单验证规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号格式',
      trigger: 'blur'
    }
  ]
}

// 模拟用户数据
const mockUserInfo = {
  id: 1,
  username: 'test',
  nickname: '测试用户',
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  email: 'test@example.com',
  phone: '13800138000',
  role: 'user' as const,
  addresses: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        isLoading.value = true
        
        // 发送登录请求
        // 这里应该调用实际的API
        // const { data } = await authApi.login(loginForm)
        
        // 模拟登录成功
        setTimeout(() => {
          // 保存token和用户信息
          userStore.setToken('mock-token')
          userStore.setUserInfo(mockUserInfo)
          
          ElMessage.success('登录成功')
          router.push('/')
          isLoading.value = false
        }, 1000)
      } catch (error) {
        console.error('登录失败', error)
        ElMessage.error('登录失败，请重试')
        isLoading.value = false
      }
    }
  })
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        isLoading.value = true
        
        // 发送注册请求
        // 这里应该调用实际的API
        // const { data } = await authApi.register(registerForm)
        
        // 模拟注册成功
        setTimeout(() => {
          ElMessage.success('注册成功，请登录')
          activeTab.value = 'login'
          loginForm.username = registerForm.username
          loginForm.password = ''
          
          // 清空注册表单
          registerForm.username = ''
          registerForm.password = ''
          registerForm.confirmPassword = ''
          registerForm.email = ''
          registerForm.phone = ''
          
          isLoading.value = false
        }, 1000)
      } catch (error) {
        console.error('注册失败', error)
        ElMessage.error('注册失败，请稍后再试')
        isLoading.value = false
      }
    }
  })
}

// 忘记密码
const forgotPassword = () => {
  ElMessage.info('忘记密码功能暂未实现，请联系管理员')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  width: 80px;
  height: 80px;
}

.login-tabs {
  margin-top: 20px;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-button,
.register-button {
  width: 100%;
}

.other-login {
  margin-top: 20px;
  text-align: center;
}

.other-login p {
  color: #909399;
  margin-bottom: 10px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>
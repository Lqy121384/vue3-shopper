<template>
  <div class="profile">
    <div class="container">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="user-card">
            <div class="user-info">
              <el-avatar :size="100" :src="userInfo?.avatar" />
              <h3>{{ userInfo?.username }}</h3>
              <p>{{ userInfo?.email }}</p>
              <p>{{ userInfo?.phone }}</p>
            </div>
            <el-divider />
            <div class="user-stats">
              <div class="stat-item">
                <h4>订单数</h4>
                <p>{{ orderStats?.total || 0 }}</p>
              </div>
              <div class="stat-item">
                <h4>待付款</h4>
                <p>{{ orderStats?.pending || 0 }}</p>
              </div>
              <div class="stat-item">
                <h4>待发货</h4>
                <p>{{ orderStats?.paid || 0 }}</p>
              </div>
              <div class="stat-item">
                <h4>待收货</h4>
                <p>{{ orderStats?.shipped || 0 }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>个人信息</span>
                <el-button type="primary" @click="handleEdit">编辑</el-button>
              </div>
            </template>
            
            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-width="100px"
              :disabled="!isEditing"
            >
              <el-form-item label="用户名" prop="nickname">
                <el-input v-model="form.nickname" />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="form.phone" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" />
              </el-form-item>
              <el-form-item label="头像">
                <el-upload
                  class="avatar-uploader"
                  action="/api/upload"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                  :disabled="!isEditing"
                >
                  <img v-if="form.avatar" :src="form.avatar" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              <el-form-item v-if="isEditing">
                <el-button type="primary" @click="handleSave">保存</el-button>
                <el-button @click="handleCancel">取消</el-button>
              </el-form-item>
            </el-form>
          </el-card>
          
          <el-card class="mt-4">
            <template #header>
              <div class="card-header">
                <span>修改密码</span>
              </div>
            </template>
            
            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
            >
              <el-form-item label="当前密码" prop="oldPassword">
                <el-input
                  v-model="passwordForm.oldPassword"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleChangePassword">
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { User } from '@/types/user'
import type { UpdateProfileRequest } from '@/types/user'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const isEditing = ref(false)

const userInfo = computed(() => userStore.userInfo)
const orderStats = computed(() => userStore.orderStats)

onMounted(async () => {
  await userStore.fetchOrderStats()
})

const form = reactive({
  nickname: userInfo.value?.nickname || '',
  phone: userInfo.value?.phone || '',
  email: userInfo.value?.email || '',
  avatar: userInfo.value?.avatar || ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else {
    if (passwordForm.confirmPassword !== '') {
      passwordFormRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  nickname: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度必须在2-20个字符之间', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/, message: '用户名只能包含中文、英文、数字和下划线', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
    { max: 50, message: '邮箱长度不能超过50个字符', trigger: 'blur' }
  ]
})

const passwordRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
})

const handleEdit = () => {
  isEditing.value = true
}

const handleCancel = () => {
  isEditing.value = false
  form.nickname = userInfo.value?.nickname || ''
  form.phone = userInfo.value?.phone || ''
  form.email = userInfo.value?.email || ''
  form.avatar = userInfo.value?.avatar || ''
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    const updateData: UpdateProfileRequest = {
      nickname: form.nickname.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      avatar: form.avatar
    }
    const success = await userStore.handleUpdateProfile(updateData)
    if (success) {
      isEditing.value = false
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      Object.entries(errors).forEach(([field, msgs]) => {
        ElMessage.error(`${field}: ${(msgs as string[]).join(', ')}`)
      })
    } else {
      ElMessage.error('保存失败，请检查输入是否正确')
    }
  }
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    await userStore.handleChangePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    ElMessage.success('密码修改成功')
  } catch (error) {
    console.error('密码修改失败:', error)
  }
}

const handleAvatarSuccess = (response: any) => {
  form.avatar = response.url
}

const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传头像图片只能是 JPG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}
</script>

<style scoped>
.profile {
  padding: 20px 0;
}

.user-card {
  text-align: center;
}

.user-info {
  padding: 20px 0;
}

.user-info h3 {
  margin: 10px 0;
  color: var(--color-text-primary);
}

.user-info p {
  margin: 5px 0;
  color: var(--color-text-secondary);
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-item h4 {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.stat-item p {
  margin: 5px 0 0;
  color: var(--color-text-primary);
  font-size: 24px;
  font-weight: bold;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.mt-4 {
  margin-top: 16px;
}
</style> 
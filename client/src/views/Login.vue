<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">团队成员系统</h1>
        <h2 class="login-subtitle">管理员登录</h2>
        
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input 
              v-model="form.email_private" 
              type="email" 
              class="form-control" 
              required 
              placeholder="请输入邮箱"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">密码</label>
            <input 
              v-model="form.password" 
              type="password" 
              class="form-control" 
              required 
              placeholder="请输入密码"
            />
          </div>
          
          <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="login-hint">
          <p>默认管理员账户：</p>
          <p>邮箱：admin@team.com</p>
          <p>密码：admin123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email_private: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

// 处理登录
const handleLogin = async () => {
  if (!form.value.email_private || !form.value.password) {
    error.value = '请填写邮箱和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(form.value)
    
    if (result.success) {
      // 登录成功，根据用户角色跳转
      if (authStore.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      error.value = result.error
    }
  } catch (err) {
    console.error('登录错误:', err)
    error.value = '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 如果已经登录，重定向到对应页面
onMounted(() => {
  if (authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #495057;
  text-align: center;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 18px;
  color: #6c757d;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 400;
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
}

.login-hint {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.login-hint p {
  margin: 4px 0;
  font-size: 14px;
  color: #6c757d;
}

.login-hint p:first-child {
  font-weight: 600;
  color: #495057;
}
</style>
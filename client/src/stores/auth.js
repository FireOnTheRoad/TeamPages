import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.is_admin || false)

  // 登录
  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token: newToken, user: userData } = response.data

      token.value = newToken
      user.value = userData

      // 存储到localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))

      // 设置API默认token
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      return { success: true }
    } catch (error) {
      console.error('登录失败:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || '登录失败' 
      }
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    user.value = null

    // 清除localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // 清除API默认token
    delete api.defaults.headers.common['Authorization']
  }

  // 初始化认证状态
  const initAuth = () => {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    initAuth
  }
})
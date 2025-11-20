<template>
  <div class="home">
    <header class="header">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <h1>团队成员</h1>
          <nav v-if="authStore.isAuthenticated">
            <router-link to="/admin" class="btn btn-primary" v-if="authStore.isAdmin">
              管理后台
            </router-link>
            <button @click="logout" class="btn btn-secondary ml-3">
              退出登录
            </button>
          </nav>
        </div>
      </div>
    </header>

    <main class="container">
      <div v-if="loading" class="loading">
        加载中...
      </div>

      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-else>
        <div v-for="group in groups" :key="group.group_id" class="group-section">
          <h2 class="group-title">{{ group.name }}</h2>
          
          <div class="members-grid">
            <div 
              v-for="member in group.members" 
              :key="member.member_id"
              class="member-card"
              @click="goToMember(member.member_id)"
            >
              <div class="text-center">
                <img 
                  :src="getAvatarUrl(member)" 
                  :alt="member.name"
                  class="member-avatar"
                  @error="handleImageError"
                />
                <div class="member-name">{{ member.name }}</div>
                <div class="member-position">{{ member.position }}</div>
                <div class="member-bio" v-if="member.bio">
                  {{ truncateText(member.bio, 100) }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="group.members.length === 0" class="text-center text-muted">
            该分组暂无成员
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const groups = ref([])
const loading = ref(true)
const error = ref('')

// 获取成员数据
const fetchMembers = async () => {
  try {
    loading.value = true
    const response = await api.get('/public/members')
    groups.value = response.data
    error.value = ''
  } catch (err) {
    console.error('获取成员数据失败:', err)
    error.value = '获取成员数据失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 跳转到成员详情页
const goToMember = (memberId) => {
  router.push(`/member/${memberId}`)
}

// 文本截取
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 获取头像URL
const getAvatarUrl = (member) => {
  if (member.photo_filename) {
    return `/api/upload/avatar/${member.photo_filename}`
  }
  if (member.photo_url) {
    return member.photo_url
  }
  return 'https://via.placeholder.com/80x80?text=Avatar'
}

// 处理图片加载错误
const handleImageError = (event) => {
  // 设置默认占位符
  event.target.src = 'https://via.placeholder.com/80x80?text=Avatar'
}

// 退出登录
const logout = () => {
  authStore.logout()
  // 刷新页面以更新状态
  window.location.reload()
}

onMounted(() => {
  fetchMembers()
})
</script>

<style scoped>
.header {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 30px;
}

.header h1 {
  color: #495057;
  font-size: 28px;
  font-weight: 600;
}

.ml-3 {
  margin-left: 1rem;
}

.text-muted {
  color: #6c757d;
}
</style>
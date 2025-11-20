<template>
  <div class="member-detail">
    <div class="container">
      <button @click="goBack" class="btn btn-secondary mb-3">
        ← 返回
      </button>

      <div v-if="loading" class="loading">
        加载中...
      </div>

      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-else-if="member" class="card">
        <div class="member-header d-flex">
          <div class="member-avatar-container">
            <img 
              :src="getAvatarUrl(member)" 
              :alt="member.name"
              class="member-avatar-large"
              @error="handleImageError"
            />
          </div>
          
          <div class="member-info">
            <h1 class="member-name-large">{{ member.name }}</h1>
            <div class="member-position-large">{{ member.position }}</div>
            <div class="member-group" v-if="member.group_name">
              所属分组：{{ member.group_name }}
            </div>
          </div>
        </div>

        <div class="member-bio-section" v-if="member.bio">
          <h3>个人简介</h3>
          <p class="member-bio-full">{{ member.bio }}</p>
        </div>

        <!-- 公开信息 -->
        <div class="member-contact-section" v-if="member.email_public">
          <h3>公开联系方式</h3>
          <p><strong>公开邮箱：</strong> {{ member.email_public }}</p>
        </div>

        <!-- 隐私信息（只有登录用户可见） -->
        <div v-if="showPrivateInfo" class="private-info-section">
          <h3>隐私信息</h3>
          <p v-if="member.email_private">
            <strong>私有邮箱：</strong> {{ member.email_private }}
          </p>
          <p v-if="member.phone_number">
            <strong>电话号码：</strong> {{ member.phone_number }}
          </p>
          
          <!-- 编辑按钮（只有本人可见） -->
          <div v-if="canEdit" class="mt-3">
            <button @click="showEditModal = true" class="btn btn-primary">
              编辑个人信息
            </button>
          </div>
        </div>

        <!-- 提示登录 -->
        <div v-else-if="authStore.isAuthenticated && !showPrivateInfo" class="alert alert-error">
          您无权查看该成员的隐私信息
        </div>
      </div>
    </div>

    <!-- 编辑模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <h3>编辑个人信息</h3>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label class="form-label">姓名</label>
            <input v-model="editForm.name" class="form-control" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">职位</label>
            <input v-model="editForm.position" class="form-control" />
          </div>
          
          <div class="form-group">
            <label class="form-label">个人简介</label>
            <textarea v-model="editForm.bio" class="form-control" rows="4"></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">头像URL</label>
            <input v-model="editForm.photo_url" class="form-control" />
          </div>
          
          <div class="form-group">
            <label class="form-label">公开邮箱</label>
            <input v-model="editForm.email_public" class="form-control" type="email" />
          </div>
          
          <div class="form-group d-flex">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
            <button type="button" @click="showEditModal = false" class="btn btn-secondary ml-3">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const member = ref(null)
const loading = ref(true)
const error = ref('')
const showEditModal = ref(false)
const saving = ref(false)

const editForm = ref({
  name: '',
  position: '',
  bio: '',
  photo_url: '',
  email_public: ''
})

// 计算属性
const showPrivateInfo = computed(() => {
  return authStore.isAuthenticated && (
    authStore.user?.member_id == route.params.id || authStore.isAdmin
  )
})

const canEdit = computed(() => {
  return authStore.user?.member_id == route.params.id
})

// 获取成员信息
const fetchMember = async () => {
  try {
    loading.value = true
    const endpoint = showPrivateInfo.value ? 
      `/members/${route.params.id}` : 
      `/public/members/${route.params.id}`
    
    const response = await api.get(endpoint)
    member.value = response.data
    
    // 初始化编辑表单
    editForm.value = {
      name: member.value.name,
      position: member.value.position || '',
      bio: member.value.bio || '',
      photo_url: member.value.photo_url || '',
      email_public: member.value.email_public || ''
    }
    
    error.value = ''
  } catch (err) {
    console.error('获取成员信息失败:', err)
    if (err.response?.status === 404) {
      error.value = '成员不存在'
    } else {
      error.value = '获取成员信息失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

// 更新个人信息
const updateProfile = async () => {
  try {
    saving.value = true
    await api.put('/member/self', editForm.value)
    
    // 更新本地数据
    Object.assign(member.value, editForm.value)
    showEditModal.value = false
    
  } catch (err) {
    console.error('更新个人信息失败:', err)
    error.value = err.response?.data?.error || '更新失败，请稍后重试'
  } finally {
    saving.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/')
}

// 获取头像URL
const getAvatarUrl = (member) => {
  if (member.photo_filename) {
    return `/api/upload/avatar/${member.photo_filename}`
  }
  if (member.photo_url) {
    return member.photo_url
  }
  return 'https://via.placeholder.com/150x150?text=Avatar'
}

// 处理图片加载错误
const handleImageError = (event) => {
  // 设置默认占位符
  event.target.src = 'https://via.placeholder.com/150x150?text=Avatar'
}

// 监听认证状态变化，重新获取数据
const refreshData = () => {
  fetchMember()
}

onMounted(() => {
  fetchMember()
})
</script>

<style scoped>
.member-detail {
  padding: 20px 0;
}

.member-header {
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 30px;
}

.member-avatar-container {
  flex-shrink: 0;
}

.member-avatar-large {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e9ecef;
}

.member-info {
  flex-grow: 1;
}

.member-name-large {
  font-size: 32px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.member-position-large {
  font-size: 18px;
  color: #6c757d;
  margin-bottom: 8px;
}

.member-group {
  font-size: 16px;
  color: #495057;
  font-weight: 500;
}

.member-bio-section,
.member-contact-section,
.private-info-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.member-bio-section h3,
.member-contact-section h3,
.private-info-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
}

.member-bio-full {
  font-size: 16px;
  line-height: 1.6;
  color: #495057;
}

.private-info-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-bottom: 20px;
  color: #495057;
}

.ml-3 {
  margin-left: 1rem;
}
</style>
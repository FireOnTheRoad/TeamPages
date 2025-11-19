<template>
  <div class="admin-page">
    <header class="admin-header">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <h1>管理后台</h1>
          <button @click="logout" class="btn btn-secondary">
            退出登录
          </button>
        </div>
      </div>
    </header>

    <main class="container">
      <div class="admin-tabs">
        <button 
          @click="activeTab = 'members'" 
          :class="['tab-btn', { active: activeTab === 'members' }]"
        >
          成员管理
        </button>
        <button 
          @click="activeTab = 'groups'" 
          :class="['tab-btn', { active: activeTab === 'groups' }]"
        >
          分组管理
        </button>
      </div>

      <!-- 成员管理 -->
      <div v-if="activeTab === 'members'" class="admin-section">
        <div class="section-header">
          <h2>成员管理</h2>
          <button @click="showAddMemberModal = true" class="btn btn-primary">
            添加成员
          </button>
        </div>

        <div v-if="loading" class="loading">加载中...</div>

        <div v-else-if="error" class="alert alert-error">{{ error }}</div>

        <div v-else>
          <div class="members-table-container">
            <table class="members-table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>职位</th>
                  <th>分组</th>
                  <th>公开邮箱</th>
                  <th>私有邮箱</th>
                  <th>管理员</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in members" :key="member.member_id">
                  <td>{{ member.name }}</td>
                  <td>{{ member.position || '-' }}</td>
                  <td>{{ member.group_name || '-' }}</td>
                  <td>{{ member.email_public || '-' }}</td>
                  <td>{{ member.email_private }}</td>
                  <td>{{ member.is_admin ? '是' : '否' }}</td>
                  <td>
                    <button @click="editMember(member)" class="btn btn-sm btn-primary">
                      编辑
                    </button>
                    <button 
                      @click="deleteMember(member)" 
                      class="btn btn-sm btn-danger"
                      :disabled="member.member_id === authStore.user?.member_id"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 分组管理 -->
      <div v-if="activeTab === 'groups'" class="admin-section">
        <div class="section-header">
          <h2>分组管理</h2>
          <button @click="showAddGroupModal = true" class="btn btn-primary">
            添加分组
          </button>
        </div>

        <div v-if="groupsLoading" class="loading">加载中...</div>

        <div v-else-if="groupsError" class="alert alert-error">{{ groupsError }}</div>

        <div v-else>
          <div class="groups-grid">
            <div v-for="group in groups" :key="group.group_id" class="group-card">
              <h3>{{ group.name }}</h3>
              <div class="group-actions">
                <button @click="editGroup(group)" class="btn btn-sm btn-primary">
                  编辑
                </button>
                <button @click="deleteGroup(group)" class="btn btn-sm btn-danger">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 添加/编辑成员模态框 -->
    <div v-if="showMemberModal" class="modal-overlay" @click="closeMemberModal">
      <div class="modal-content" @click.stop>
        <h3>{{ editingMember ? '编辑成员' : '添加成员' }}</h3>
        <form @submit.prevent="saveMember">
          <div class="form-group">
            <label class="form-label">姓名 *</label>
            <input v-model="memberForm.name" class="form-control" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">分组</label>
            <select v-model="memberForm.group_id" class="form-control">
              <option value="">请选择分组</option>
              <option v-for="group in groups" :key="group.group_id" :value="group.group_id">
                {{ group.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">职位</label>
            <input v-model="memberForm.position" class="form-control" />
          </div>
          
          <div class="form-group">
            <label class="form-label">个人简介</label>
            <textarea v-model="memberForm.bio" class="form-control" rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">头像URL</label>
            <input v-model="memberForm.photo_url" class="form-control" />
          </div>
          
          <div class="form-group">
            <label class="form-label">公开邮箱</label>
            <input v-model="memberForm.email_public" class="form-control" type="email" />
          </div>
          
          <div class="form-group">
            <label class="form-label">私有邮箱 *</label>
            <input v-model="memberForm.email_private" class="form-control" type="email" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">电话号码</label>
            <input v-model="memberForm.phone_number" class="form-control" />
          </div>
          
          <div class="form-group" v-if="!editingMember">
            <label class="form-label">密码 *</label>
            <input v-model="memberForm.password" class="form-control" type="password" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">管理员权限</label>
            <select v-model="memberForm.is_admin" class="form-control">
              <option :value="false">否</option>
              <option :value="true">是</option>
            </select>
          </div>
          
          <div class="form-group d-flex">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
            <button type="button" @click="closeMemberModal" class="btn btn-secondary ml-3">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 添加/编辑分组模态框 -->
    <div v-if="showGroupModal" class="modal-overlay" @click="closeGroupModal">
      <div class="modal-content" @click.stop>
        <h3>{{ editingGroup ? '编辑分组' : '添加分组' }}</h3>
        <form @submit.prevent="saveGroup">
          <div class="form-group">
            <label class="form-label">分组名称 *</label>
            <input v-model="groupForm.name" class="form-control" required />
          </div>
          
          <div class="form-group d-flex">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
            <button type="button" @click="closeGroupModal" class="btn btn-secondary ml-3">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('members')
const members = ref([])
const groups = ref([])
const loading = ref(false)
const error = ref('')
const groupsLoading = ref(false)
const groupsError = ref('')
const saving = ref(false)

// 成员模态框相关
const showMemberModal = ref(false)
const editingMember = ref(null)
const memberForm = ref({
  name: '',
  group_id: '',
  position: '',
  bio: '',
  photo_url: '',
  email_public: '',
  email_private: '',
  phone_number: '',
  password: '',
  is_admin: false
})

// 分组模态框相关
const showGroupModal = ref(false)
const editingGroup = ref(null)
const groupForm = ref({
  name: ''
})

// 获取成员列表
const fetchMembers = async () => {
  try {
    loading.value = true
    const response = await api.get('/admin/members')
    members.value = response.data
    error.value = ''
  } catch (err) {
    console.error('获取成员列表失败:', err)
    error.value = '获取成员列表失败'
  } finally {
    loading.value = false
  }
}

// 获取分组列表
const fetchGroups = async () => {
  try {
    groupsLoading.value = true
    const response = await api.get('/admin/groups')
    groups.value = response.data
    groupsError.value = ''
  } catch (err) {
    console.error('获取分组列表失败:', err)
    groupsError.value = '获取分组列表失败'
  } finally {
    groupsLoading.value = false
  }
}

// 编辑成员
const editMember = (member) => {
  editingMember.value = member
  memberForm.value = {
    name: member.name,
    group_id: member.group_id || '',
    position: member.position || '',
    bio: member.bio || '',
    photo_url: member.photo_url || '',
    email_public: member.email_public || '',
    email_private: member.email_private,
    phone_number: member.phone_number || '',
    password: '',
    is_admin: member.is_admin
  }
  showMemberModal.value = true
}

// 保存成员
const saveMember = async () => {
  try {
    saving.value = true
    const data = { ...memberForm.value }
    
    if (editingMember.value) {
      // 编辑成员（密码为空时不更新密码）
      if (!data.password) {
        delete data.password
      }
      await api.put(`/admin/members/${editingMember.value.member_id}`, data)
    } else {
      // 添加成员
      await api.post('/admin/members', data)
    }
    
    closeMemberModal()
    await fetchMembers()
  } catch (err) {
    console.error('保存成员失败:', err)
    error.value = err.response?.data?.error || '保存成员失败'
  } finally {
    saving.value = false
  }
}

// 删除成员
const deleteMember = async (member) => {
  if (!confirm(`确定要删除成员 "${member.name}" 吗？`)) return
  
  try {
    await api.delete(`/admin/members/${member.member_id}`)
    await fetchMembers()
  } catch (err) {
    console.error('删除成员失败:', err)
    error.value = err.response?.data?.error || '删除成员失败'
  }
}

// 编辑分组
const editGroup = (group) => {
  editingGroup.value = group
  groupForm.value = {
    name: group.name
  }
  showGroupModal.value = true
}

// 保存分组
const saveGroup = async () => {
  try {
    saving.value = true
    
    if (editingGroup.value) {
      await api.put(`/admin/groups/${editingGroup.value.group_id}`, groupForm.value)
    } else {
      await api.post('/admin/groups', groupForm.value)
    }
    
    closeGroupModal()
    await fetchGroups()
  } catch (err) {
    console.error('保存分组失败:', err)
    groupsError.value = err.response?.data?.error || '保存分组失败'
  } finally {
    saving.value = false
  }
}

// 删除分组
const deleteGroup = async (group) => {
  if (!confirm(`确定要删除分组 "${group.name}" 吗？`)) return
  
  try {
    await api.delete(`/admin/groups/${group.group_id}`)
    await fetchGroups()
  } catch (err) {
    console.error('删除分组失败:', err)
    groupsError.value = err.response?.data?.error || '删除分组失败'
  }
}

// 关闭成员模态框
const closeMemberModal = () => {
  showMemberModal.value = false
  editingMember.value = null
  memberForm.value = {
    name: '',
    group_id: '',
    position: '',
    bio: '',
    photo_url: '',
    email_public: '',
    email_private: '',
    phone_number: '',
    password: '',
    is_admin: false
  }
}

// 关闭分组模态框
const closeGroupModal = () => {
  showGroupModal.value = false
  editingGroup.value = null
  groupForm.value = {
    name: ''
  }
}

// 退出登录
const logout = () => {
  authStore.logout()
  router.push('/')
}

onMounted(async () => {
  await Promise.all([fetchMembers(), fetchGroups()])
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.admin-header {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 30px;
}

.admin-header h1 {
  color: #495057;
  font-size: 28px;
  font-weight: 600;
}

.admin-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e9ecef;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: none;
  color: #6c757d;
  font-size: 16px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #495057;
  font-size: 24px;
  font-weight: 600;
}

.members-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.members-table {
  width: 100%;
  border-collapse: collapse;
}

.members-table th,
.members-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.members-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.members-table tr:hover {
  background-color: #f8f9fa;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.group-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.group-card h3 {
  margin-bottom: 15px;
  color: #495057;
}

.group-actions {
  display: flex;
  gap: 10px;
}

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
  padding: 20px;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
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
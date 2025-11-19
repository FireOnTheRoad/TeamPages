import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 页面组件
const Home = () => import('@/views/Home.vue')
const MemberDetail = () => import('@/views/MemberDetail.vue')
const Login = () => import('@/views/Login.vue')
const Admin = () => import('@/views/Admin.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/member/:id',
      name: 'MemberDetail',
      component: MemberDetail
    },
    {
      path: '/secret-login',
      name: 'Login',
      component: Login
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/secret-login')
      return
    }

    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      next('/')
      return
    }
  }

  next()
})

export default router
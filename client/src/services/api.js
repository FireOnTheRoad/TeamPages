import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

const redirectToLogin = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/secret-login'
}

// 请求拦截器：始终从localStorage读取最新token，避免依赖Pinia实例
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：401/403都视为认证失效
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      redirectToLogin()
    }
    return Promise.reject(error)
  }
)

export default api
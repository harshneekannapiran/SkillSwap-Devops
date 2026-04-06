import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillswap_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.baseURL)
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Error:', error.message, error.config?.url)
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.error('Network/CORS Error - Check backend server and CORS configuration')
    }
    return Promise.reject(error)
  }
)


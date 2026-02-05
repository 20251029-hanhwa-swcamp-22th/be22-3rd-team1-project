import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    const statusCode = error.response?.status

    if (import.meta.env.DEV) {
      console.error(`[API Error] ${statusCode}: ${errorMessage}`)
    }

    return Promise.reject({
      status: statusCode,
      message: errorMessage,
      original: error
    })
  }
)

export default axiosInstance

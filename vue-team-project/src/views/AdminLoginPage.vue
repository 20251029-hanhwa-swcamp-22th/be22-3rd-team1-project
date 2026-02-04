<script setup>
import { ref } from 'vue'
import { api } from '../services/api' // api 서비스 임포트
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const { t } = useI18n()
const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = '' // 에러 메시지 초기화
  try {
    const result = await api.adminLogin({ username: username.value, password: password.value })
    if (result.success) {
      // 로그인 성공
      console.log('Admin login successful:', result.user)
      // TODO: 실제 구현 시, 로그인 상태를 stores/auth.js에 저장하고 토큰 등을 관리해야 합니다.
      router.push('/admin') // 관리자 대시보드로 이동
    } else {
      // 로그인 실패
      errorMessage.value = result.message || t('admin.login_fail')
    }
  } catch (error) {
    console.error('Login API error:', error)
    errorMessage.value = t('admin.login_error')
  }
}
</script>

<template>
  <div class="admin-login-page">
    <LanguageSwitcher variant="dark"/>
    <div class="login-container">
      <h2>{{ $t('admin.login_title') }}</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">{{ $t('admin.username') }}:</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="form-group">
          <label for="password">{{ $t('admin.password') }}:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit" class="login-btn">{{ $t('admin.login_btn') }}</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
      <button class="back-to-main" @click="router.push('/')">{{ $t('admin.back_to_main') }}</button>
    </div>
  </div>
</template>

<style scoped>
.admin-login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-red) 0%, var(--primary-red-dark) 100%);
  padding: 20px;
}

.login-container {
  background-color: var(--surface-white);
  padding: 48px;
  border-radius: 24px;
  box-shadow: var(--shadow-lg);
  text-align: center;
  width: 100%;
  max-width: 440px;
  border: 1px solid var(--border-subtle);
}

h2 {
  color: var(--primary-red);
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.form-group {
  margin-bottom: 24px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 10px;
  color: var(--text-muted);
  font-weight: 700;
  font-size: 14px;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border-subtle);
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;
  background-color: var(--background-light);
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: var(--primary-red);
  background-color: var(--surface-white);
  outline: none;
  box-shadow: 0 0 0 4px #fff5f5;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background-color: var(--primary-red);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 12px;
  box-shadow: var(--shadow-md);
}

.login-btn:hover {
  background-color: var(--primary-red-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.error-message {
  color: #dc3545;
  margin-top: 16px;
  font-size: 14px;
  font-weight: 600;
  background-color: #fff5f5;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ffe3e3;
}

.back-to-main {
  margin-top: 32px;
  background: none;
  border: none;
  color: var(--primary-red);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
}

.back-to-main:hover {
  color: var(--primary-red-dark);
  background-color: #fff5f5;
}
</style>
<script setup>
import { useRouter } from 'vue-router'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const router = useRouter()

const selectDiningOption = (option) => {
  // Navigate to order page (business logic will be added later)
  router.push('/order')
}

const goToAdmin = () => {
  // Admin navigation (business logic will be added later)
  router.push('/admin/login') // 관리자 로그인 페이지로 이동
}
</script>

<template>
  <div class="main-page">
    <LanguageSwitcher />
    <!-- Admin Button -->
    <button class="admin-btn" @click="goToAdmin">
      {{ $t('main.admin_btn') }}
    </button>

    <!-- Background Area -->
    <div class="background-area">
      <div class="welcome-text">
        <h1>{{ $t('main.welcome') }}</h1>
        <p>{{ $t('main.select_method') }}</p>
      </div>
    </div>

    <!-- Dining Options -->
    <div class="dining-options">
      <button
        class="dining-btn for-here"
        @click="selectDiningOption('forHere')"
      >
        <span class="dining-icon">🍽️</span>
        <span class="dining-text">{{ $t('main.for_here') }}</span>
        <span class="dining-subtitle">For Here</span>
      </button>

      <button
        class="dining-btn to-go"
        @click="selectDiningOption('toGo')"
      >
        <span class="dining-icon">🛍️</span>
        <span class="dining-text">{{ $t('main.to_go') }}</span>
        <span class="dining-subtitle">To Go</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.main-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, var(--surface-white) 0%, var(--background-cream) 100%);
  position: relative;
  padding: 24px;
}

.admin-btn {
  position: absolute;
  top: 24px;
  left: 24px;
  padding: 10px 20px;
  background-color: var(--surface-white);
  color: var(--primary-red);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: var(--shadow-sm);
}

.admin-btn:hover {
  background-color: var(--background-cream);
  border-color: var(--primary-red);
  transform: translateY(-2px);
}

.background-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.welcome-text {
  text-align: center;
  color: var(--text-navy);
}

.welcome-text h1 {
  font-size: 56px;
  font-weight: 900;
  margin-bottom: 20px;
  color: var(--primary-red);
  letter-spacing: -2px;
}

.welcome-text p {
  font-size: 24px;
  color: var(--text-muted);
  font-weight: 500;
}

.dining-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  padding: 24px;
  margin-bottom: 60px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.dining-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 280px;
  border: 2px solid transparent;
  border-radius: 24px;
  background-color: var(--surface-white);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-lg);
}

.dining-btn:hover {
  transform: translateY(-12px);
  border-color: var(--primary-red);
  box-shadow: 0 20px 40px rgba(230, 57, 70, 0.15);
}

.for-here, .to-go {
  background: var(--surface-white);
}

.dining-icon {
  font-size: 64px;
  margin-bottom: 24px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.dining-text {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-navy);
  margin-bottom: 8px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dining-subtitle {
  font-size: 16px;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .welcome-text h1 {
    font-size: 36px;
  }

  .welcome-text p {
    font-size: 16px;
  }

  .dining-btn {
    padding: 24px 16px;
  }

  .dining-icon {
    font-size: 36px;
  }

  .dining-text {
    font-size: 22px;
  }
}
</style>
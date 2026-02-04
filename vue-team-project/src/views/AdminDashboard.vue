<script setup>
import { useRouter } from 'vue-router'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const router = useRouter()

const goToMenuManagement = () => {
  router.push('/admin/menu')
}

const goToSalesStats = () => {
  router.push('/admin/sales')
}

const logout = () => {
  // TODO: 실제 구현 시, 인증 상태를 초기화하고 로그인 페이지로 리다이렉트
  console.log('Admin logged out')
  router.push('/admin/login')
}
</script>

<template>
  <div class="admin-dashboard">
    <header class="admin-header">
      <h1>{{ $t('admin.dashboard_title') }}</h1>
      <div class="header-right">
        <LanguageSwitcher mode="inline" variant="dark" />
        <button @click="logout" class="logout-btn">{{ $t('admin.logout') }}</button>
      </div>
    </header>

    <div class="dashboard-content">
      <div class="dashboard-card" @click="goToMenuManagement">
        <span class="card-icon">🍕</span>
        <h2>{{ $t('admin.menu_management') }}</h2>
        <p>{{ $t('admin.menu_desc') }}</p>
      </div>

      <div class="dashboard-card" @click="goToSalesStats">
        <span class="card-icon">📊</span>
        <h2>{{ $t('admin.sales_stats') }}</h2>
        <p>{{ $t('admin.sales_desc') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-light);
  color: var(--text-dark);
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  background-color: var(--primary-red-dark);
  color: white;
  box-shadow: var(--shadow-md);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.admin-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.logout-btn {
  padding: 10px 24px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.dashboard-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
  padding: 60px 40px;
}

.dashboard-card {
  background-color: var(--surface-white);
  border-radius: 24px;
  box-shadow: var(--shadow-lg);
  padding: 48px 32px;
  width: 340px;
  min-height: 300px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--border-subtle);
}

.dashboard-card:hover {
  transform: translateY(-12px);
  border-color: var(--primary-red);
  box-shadow: 0 20px 40px rgba(230, 57, 70, 0.1);
}

.card-icon {
  font-size: 80px;
  margin-bottom: 24px;
  display: block;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.dashboard-card h2 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--primary-red);
  letter-spacing: -0.5px;
}

.dashboard-card p {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.5;
  font-weight: 500;
}
</style>

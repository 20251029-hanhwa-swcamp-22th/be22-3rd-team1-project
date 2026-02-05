<script setup>
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 이전 페이지(결제 확인)에서 넘겨준 실패 사유
const failReason = route.query.reason || '알 수 없는 오류가 발생했습니다.'

const goRetry = () => {
  // 다시 결제 수단 선택 화면으로
  router.push({name : 'PaymentMethod'})
}

const goHome = () => {
  router.push({name:'Main'})
}
</script>

<template>
  <div class="fail-page">
    <div class="fail-card">
      <div class="icon-area">⚠️</div>

      <h1>{{ $t('fail.title') }}</h1>
      <p class="reason-text">{{ failReason }}</p>

      <div class="btn-group">
        <button class="btn retry" @click="goRetry">{{ $t('fail.retry_btn') }}</button>
        <button class="btn home" @click="goHome">{{ $t('fail.home_btn') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fail-page {
  min-height: 100vh;
  background-color: var(--background-cream);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.fail-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 450px;
  border-top: 5px solid var(--primary-red);
}

.icon-area {
  font-size: 60px;
  margin-bottom: 20px;
}

h1 {
  color: #333;
  margin-bottom: 15px;
}

.reason-text {
  color: #666;
  font-size: 16px;
  margin-bottom: 40px;
  line-height: 1.5;
  background: #fff5f5;
  padding: 15px;
  border-radius: 8px;
}

.btn-group {
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.retry {
  background-color: var(--primary-red);
  color: white;
}

.home {
  background-color: #e0e0e0;
  color: #555;
}
</style>
<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../stores/orderStore'
import { api } from '../services/api'
import OrderCompletionModal from '../components/OrderCompletionModal.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const orderStore = useOrderStore()

// 1. 스토어에서 주문 데이터 가져오기
const paymentMethod = computed(() => orderStore.selectedPaymentMethod || '카드결제')
const orderItems = computed(() => orderStore.orderList)
const totalPrice = computed(() => orderStore.calculatedTotalPrice)
const totalDiscount = computed(() => orderStore.totalDiscount)
const finalPrice = computed(() => totalPrice.value - totalDiscount.value)
// 포인트 계산
const earnedPoints = computed(() => Math.floor(finalPrice.value * 0.05))

// 2. 상태 관리
const processStatus = ref('waiting') // 'waiting'(입력대기) -> 'processing'(처리중) -> 'success'(성공) -> 'fail'(실패)
const timeLeft = ref(30) // 30초 카운트다운 (시간 초과 시 실패)
const showSuccessModal = ref(false) // 성공 모달 표시 여부

// 완료된 주문 정보 저장 (모달용)
const completedOrderInfo = ref({
  orderNumber: '',
  items: [],
  totalPrice: 0
})

let timerInterval = null

// 3. 결제 수단별 안내 메시지 및 이미지 매핑 (하드코딩)
const guideInfo = computed(() => {
  const methodObj = paymentMethod.value
  const method = typeof methodObj === 'object' ? (methodObj.ko || '') : (methodObj || '')

  if (method.includes('카드')) {
    return {
      title: t('process.card_title'),
      subTitle: t('process.card_subtitle'),
      image: '/payment/insert_card.gif', // 준비하신 카드 투입 애니메이션 이미지
      bgClass: 'bg-card'
    }
  } else if (method.includes('QR') || method.includes('페이') || method.includes('Easy')) {
    return {
      title: t('process.nfc_title'),
      subTitle: t('process.nfc_subtitle'),
      image: '/payment/scan_nfc.png',
      bgClass: 'bg-qr'
    }
  } /*
  qr코드 결제에 사용

  else if (method.includes('QR') || method.includes('페이') || method.includes('Easy')) {
    return {
      title: 'QR코드를 스캔해주세요',
      subTitle: '화면 아래 리더기에 바코드를 대주세요',
      image: '/payment/scan_qr.png', // 준비하신 QR 스캔 이미지
      bgClass: 'bg-qr'
    }
  } */else {
    return {
      title: t('process.general_title'),
      subTitle: t('process.general_subtitle'),
      image: '/payment/payment_processing.gif', // 공통 로딩 이미지
      bgClass: 'bg-common'
    }
  }
})

// 4. 결제 프로세스 로직
onMounted(() => {
  // 주문 내역이 없으면 튕겨내기
  if (orderItems.value.length === 0) {
    router.replace('/')
    return
  }

  // 타이머 시작
  startTimer()

  // ★ 하드웨어 입력 시뮬레이션 ★
  // 3초 뒤에 "입력 감지됨"으로 간주하고 실제 결제 API 호출
  setTimeout(() => {
    if (processStatus.value === 'waiting') {
      processStatus.value = 'processing' // 로딩 상태로 변경
      processPayment()
    }
  }, 8000) //  (카드 꽂는 시간 가정)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

// 타이머 함수
const startTimer = () => {
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      handleFail(t('process.timeout'))
    }
  }, 1000)
}

// 실제 결제 API 호출 및 처리
const processPayment = async () => {
  try {
    // 주문 번호 생성 로직 (PaymentConfirm에 있던 것 가져옴)
    const generateOrderNumber = () => {
      const now = new Date()
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      const full = `ORD-${now.toISOString().replace(/[-:T.]/g, '').slice(0, 14)}-${random}`
      return { full, short: random }
    }

    const orderNumbers = generateOrderNumber()

    // API 데이터 구성
    const orderData = {
      orderNumber: orderNumbers.full,
      paymentMethod: paymentMethod.value,
      items: orderItems.value.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice: finalPrice.value,
      createdAt: new Date().toISOString(),
      status: 'completed'
    }

    // API 호출
    await api.createOrder(orderData)

    // 4. 재고 차감 로직
    await Promise.all(orderItems.value.map(async (item) => {
      // item.id가 "1_..." 형태일 수 있으므로 원본 ID 추출
      const originalId = item.id.toString().split('_')[0]
      try {
        const menuItems = await api.getMenuItems()
        const menuData = menuItems.find(m => m.id === originalId)
        
        if (menuData && menuData.stock !== undefined) {
          const newStock = menuData.stock - item.quantity
          await api.updateMenuItemStock(originalId, Math.max(0, newStock))
        }
      } catch (err) {
        console.error(`Failed to update stock for item ${originalId}:`, err)
      }
    }))

    // 회원 포인트 업데이트 로직
    const currentMember = orderStore.currentMember
    if (currentMember) {
      const usedPoints = orderStore.usedPoints
      const newPoints = currentMember.points - usedPoints + earnedPoints.value
      await api.updateMember({ ...currentMember, points: newPoints })
      orderStore.setCurrentMember({ ...currentMember, points: newPoints })
    }

    // 성공 처리
    completedOrderInfo.value = {
      orderNumber: orderNumbers.short,
      items: [...orderItems.value],
      totalPrice: finalPrice.value
    }

    processStatus.value = 'success'
    clearInterval(timerInterval)

    // 성공 모달 띄우기 (페이지처럼 보임)
    showSuccessModal.value = true

  } catch (error) {
    console.error('Payment Error:', error)
    handleFail(t('process.system_error'))
  }
}

// 실패 처리 함수 -> 실패 페이지로 이동
const handleFail = (reason) => {
  clearInterval(timerInterval)
  // 실패 사유를 query로 넘김 (간단하게 구현)
  router.replace({
    path: '/payment-fail',
    query: { reason: reason }
  })
}

// 성공 모달에서 "완료" 누르면 홈으로
const handleComplete = () => {
  orderStore.clearOrder()
  router.push('/')
}
</script>

<template>
  <div class="process-page">

    <div v-if="processStatus !== 'success'" class="content-container">
      <div class="guide-card">
        <div class="timer-badge">{{ $t('process.time_left', { time: timeLeft }) }}</div>

        <div class="image-area">
          <img :src="guideInfo.image" class="guide-img" alt="가이드 이미지" />
          <div v-if="processStatus === 'processing'" class="spinner-overlay">
            <div class="spinner"></div>
          </div>
        </div>

        <h2 class="title">{{ processStatus === 'processing' ? $t('process.approving') : guideInfo.title }}</h2>
        <p class="subtitle">{{ guideInfo.subTitle }}</p>

        <button class="cancel-btn" @click="handleFail(t('process.user_cancel'))">
          {{ $t('process.cancel_btn') }}
        </button>
      </div>
    </div>

    <OrderCompletionModal
        v-if="showSuccessModal"
        :is-open="showSuccessModal"
        :order-number="completedOrderInfo.orderNumber"
        :order-items="completedOrderInfo.items"
        :total-price="completedOrderInfo.totalPrice"
        :earned-points="orderStore.currentMember ? earnedPoints : 0"
        :current-points="orderStore.currentMember?.points || 0"
        @go-home="handleComplete"
        @complete="handleComplete"
    />

  </div>
</template>

<style scoped>
.process-page {
  min-height: 100vh;
  background-color: var(--background-cream);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.guide-card {
  background: var(--surface-white);
  padding: 48px;
  border-radius: 24px;
  text-align: center;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 500px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--border-subtle);
}

.timer-badge {
  position: absolute;
  top: 24px;
  right: 24px;
  background: #dc3545;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
  animation: pulse 1s infinite;
}

.image-area {
  width: 220px;
  height: 220px;
  margin: 32px 0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff5f5;
  border-radius: 50%;
  padding: 20px;
}

.guide-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.title {
  font-size: 32px;
  color: var(--primary-red);
  margin-bottom: 12px;
  font-weight: 800;
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
}

.subtitle {
  font-size: 20px;
  color: var(--text-muted);
  margin-bottom: 48px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.cancel-btn {
  background-color: var(--surface-white);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
  padding: 16px 40px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: var(--background-light);
  color: var(--text-dark);
}

/* 로딩 스피너 스타일 */
.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #fff5f5;
  border-top: 6px solid var(--primary-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
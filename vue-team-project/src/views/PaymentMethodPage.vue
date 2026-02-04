<script setup>
import { ref, onMounted, computed, watch} from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useOrderStore } from '../stores/orderStore'
import KeypadModal from '../components/KeypadModal.vue'
import MessageModal from '../components/MessageModal.vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const { t, locale } = useI18n()
const router = useRouter()
const orderStore = useOrderStore()

// Get total price from order store
const totalPrice = computed(() => orderStore.calculatedTotalPrice)

// 스토어에서 데이터 가져오기 (화면 표시용)
const selectedPaymentMethod = computed(() => {
  const method = orderStore.selectedPaymentMethod
  if (!method) return '카드결제'
  if (typeof method === 'object') {
    return method[locale.value] || method['ko']
  }
  return method
})

const couponDiscount = ref(0);
const pointDiscount = ref(0);

const totalDiscountPrice = computed(() => couponDiscount.value + pointDiscount.value);
const confirmPrice = computed(() => {
  const result = totalPrice.value - totalDiscountPrice.value;
  return result > 0 ? result : 0
});

const selectedPayment = ref(null)
const isLoading = ref(true)

const paymentMethods = ref({
  card: [],
  easyPay: [],
  other: []
})

const isCouponModalOpen = ref(false);
const isPhoneModalOpen = ref(false);

const currentMember = ref(null); // 조회된 회원 저장
const isPointAmountModalOpen = ref(false); // 포인트 금액 입력 모달 상태

// 메세지 모달 구성을 위한 통합 상태 객체
const modal = ref({
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  onConfirm: null // 확인 버튼 클릭 시 실행할 함수
});

// 메세지 모달을 띄우는 편의 함수
const showMessage = (type, title, message, onConfirm) => {
  modal.value = { isOpen: true, type, title, message, onConfirm };
};

// Fetch payment methods on component mount
onMounted(async () => {
  try {
    const data = await api.getPaymentMethods()
    paymentMethods.value = data
  } catch (error) {
    console.error('Failed to fetch payment methods:', error)
  } finally {
    isLoading.value = false
  }
})

const selectPayment = (paymentId) => {
  selectedPayment.value = paymentId
}

const handleBack = () => {
  router.push('/order')
}

const handleNext = () => {
  if (selectedPayment.value) {
    // Find the selected payment method name and save to store
    const allMethods = [
      ...paymentMethods.value.card,
      ...paymentMethods.value.easyPay,
      ...paymentMethods.value.other
    ]
    const selected = allMethods.find(m => m.id === selectedPayment.value)
    if (selected) {
      // Save the name object itself for reactive translation in the next page
      orderStore.setPaymentMethod(selected.name)
      orderStore.setTotalDiscount(totalDiscountPrice.value)
      orderStore.setUsedPoints(pointDiscount.value)
      
      // 결제 확인 모달 추가
      showMessage('confirm', t('payment.confirm_msg'), t('payment.confirm_proceed', { amount: confirmPrice.value.toLocaleString() }), () => {
        modal.value.isOpen = false;
        router.push('/payment-confirm')
      })
    }
  }
}


const openDiscountModal = (methodId) => {
  if (methodId === 'coupon') {
    isCouponModalOpen.value = true;
  } 
  else if (methodId === 'point') {
    // 이미 회원이 조회되어 있다면 번호 입력창을 건너뛰고 바로 금액 입력창을 엽니다.
    if (currentMember.value) {
      isPointAmountModalOpen.value = true;
    } else {
      isPhoneModalOpen.value = true;
    }
  }
};

// 쿠폰 확인 로직
const checkCoupon = async (code) => {
  try {
    const coupons = await api.getCouponByCode(code)

    if (coupons && coupons.length > 0){
      const coupon = coupons[0]
      if(!coupon.used){
        couponDiscount.value = coupon.amount
        showMessage('alert', t('discount.coupon'), t('discount.applied_coupon', { amount: coupon.amount.toLocaleString() }))
      }
      else{
        showMessage('alert', t('discount.coupon_error'), t('discount.used_coupon'))
      }
    }
    else{
      showMessage('alert', t('discount.coupon_error'), t('discount.invalid_coupon'))
    }

  } catch (error) {
    console.error('쿠폰 조회 중 오류가 발생했습니다.:', error)
  } finally {
    isCouponModalOpen.value = false;
  }

};

// 1. 번호로 회원 조회
const checkMember = async (phone) => {
  try {
    const rawPhone = phone.replace(/-/g, ''); // 하이픈 제거 후 조회
    const members = await api.getMemberByPhone(rawPhone);
    
    if (members && members.length > 0) {
      currentMember.value = members[0];
      // 번호 입력창 닫고 바로 '금액 입력창' 열기
      isPhoneModalOpen.value = false;
      isPointAmountModalOpen.value = true;
    } else {
      // 번호 입력창 우선 닫기
      isPhoneModalOpen.value = false;
      
      // confirm() 대신 커스텀 모달 호출
      showMessage('confirm', t('discount.join_title'), t('discount.join_msg'), async () => {
        const newMember = await api.createMember({ phone: rawPhone, points: 0 });
        currentMember.value = newMember;
        modal.value.isOpen = false; // 메세지 모달 닫기
        
        // 알림창도 커스텀 모달
        setTimeout(() => {
          showMessage('alert', t('discount.signup_complete'), t('discount.join_success'));
        }, 300);
      });
    }
  } 
  catch (error) {
    showMessage('alert', t('discount.lookup_fail'), t('discount.lookup_error'))
  }
};

// 2. 입력한 포인트 금액 적용
const applyPointAmount = (amount) => {
  const points = parseInt(amount);
  if (points > (currentMember.value?.points || 0)) {
    showMessage('alert', t('discount.point_error'), t('discount.point_insufficient', { points: (currentMember.value?.points || 0).toLocaleString() }))
    return;
  }
  pointDiscount.value = points;
  isPointAmountModalOpen.value = false;

  // 포인트 적용 확인 모달 추가
  if (points > 0) {
    showMessage('alert', t('discount.point'), t('discount.applied_points', { points: points.toLocaleString() }));
  }
};

watch(currentMember, (newMember) => {
  if (newMember) {
    orderStore.setCurrentMember(newMember);
  }
});


</script>

<template>
  <div class="payment-method-page">
    <LanguageSwitcher />
    <!-- Header -->
    <header class="page-header">
      <h1>{{ $t('payment.title') }}</h1>
    </header>

    <div class="price-info">
      <!-- Total Amount -->
      <div class="total-amount">
        <span class="amount-label"> {{ $t('payment.total_amount') }}:</span>
        <span class="amount-value">{{ totalPrice.toLocaleString() }}{{ $t('common.won') }}</span>
      </div>
      <!-- Discount Amount -->
      <div class="discount-amount">
        <span class="discount-label">{{ $t('payment.discount_amount') }}:</span>
        <span class="discount-value">- {{ totalDiscountPrice.toLocaleString() }}{{ $t('common.won') }}</span>
      </div>
      <!-- Confirm Price -->
      <div class="confirm-price">
        <span class="confirm-label">{{ $t('payment.final_amount') }}:</span>
        <span class="confirm-value">{{ confirmPrice.toLocaleString() }}{{ $t('common.won') }}</span>
      </div>
    </div>

    <!-- Payment Sections -->
    <div class="payment-sections">
      <!-- Discount -->
      <section class="payment-section">
        <h2 class="section-title">{{ $t('payment.sections.discount') }}</h2>
        <div class="payment-options">
          <button
            v-for="method in paymentMethods.other"
            :key="method.id"
            :class="['payment-btn', { selected: selectedPayment === method.id }]"
            @click="openDiscountModal(method.id)"
          >
            <span class="payment-icon">{{ method.icon }}</span>
            <span class="payment-name">{{ method.name[$i18n.locale] || method.name }}</span>
          </button>
        </div>
      </section>
      <!-- Card Payment -->
      <section class="payment-section">
        <h2 class="section-title">{{ $t('payment.sections.card') }}</h2>
        <div class="payment-options">
          <button
            v-for="method in paymentMethods.card"
            :key="method.id"
            :class="['payment-btn', { selected: selectedPayment === method.id }]"
            @click="selectPayment(method.id)"
          >
            <span class="payment-icon">{{ method.icon }}</span>
            <span class="payment-name">{{ method.name[$i18n.locale] || method.name }}</span>
          </button>
        </div>
      </section>

      <!-- Easy Pay -->
      <section class="payment-section">
        <h2 class="section-title">{{ $t('payment.sections.easy_pay') }}</h2>
        <div class="payment-options three-col">
          <button
            v-for="method in paymentMethods.easyPay"
            :key="method.id"
            :class="['payment-btn', { selected: selectedPayment === method.id }]"
            @click="selectPayment(method.id)"
          >
            <span class="payment-icon">{{ method.icon }}</span>
            <span class="payment-name">{{ method.name[$i18n.locale] || method.name }}</span>
          </button>
        </div>
      </section>
    </div>

    <!-- Action Buttons -->
    <footer class="action-footer">
      <button class="footer-btn back" @click="handleBack">
        {{ $t('common.back') }}
      </button>
      <button
        class="footer-btn next"
        :disabled="!selectedPayment"
        @click="handleNext"
      >
        {{ $t('common.next') }}
      </button>
    </footer>
      <KeypadModal
        :isOpen="isCouponModalOpen"
        :title="$t('discount.coupon_title')"
        type="coupon"
        placeholder=""
        @close="isCouponModalOpen = false"
        @confirm="checkCoupon"
      />
      <KeypadModal
        :isOpen="isPhoneModalOpen"
        :title="$t('discount.phone_title')"
        type="phone"
        placeholder="010-1234-5678"
        @close="isPhoneModalOpen = false"
        @confirm="checkMember"
      />

      <KeypadModal
        :isOpen="isPointAmountModalOpen"
        :title="$t('discount.point_title')"
        type="point"
        :subtitle="currentMember ? $t('discount.available_points', { points: currentMember.points.toLocaleString() }) : ''"
        :placeholder="currentMember ? currentMember.points.toString() : '0'"
        :maxLimit="currentMember ? currentMember.points : 0"
        @close="isPointAmountModalOpen = false"
        @confirm="applyPointAmount"
      />
      <MessageModal
  v-bind="modal"
  @close="modal.isOpen = false"
  @confirm="modal.onConfirm ? modal.onConfirm() : modal.isOpen = false"
/>
  </div>
</template>

<style scoped>
.payment-method-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-cream);
}

/* Header */
.page-header {
  padding: 20px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
}

/* Total Amount */
.total-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  border-bottom: 2px solid #e0e0e0;
}

.amount-label {
  font-size: 16px;
  color: #666;
}

.amount-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dark);
}

.price-info {
  display: flex;
  flex-direction: column;
}

.discount-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  border-bottom: 2px solid #e0e0e0;
}

.discount-label {
  font-size: 16px;
  color: #666;
}

.discount-value {
  font-size: 15px;
  font-weight: 700;
  color: red;
}

.confirm-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  border-bottom: 2px solid #e0e0e0;
}

.confirm-label {
  font-size: 16px;
  color: #666;
}

.confirm-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary-red);
}

/* Payment Sections */
.payment-sections {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.payment-section {
  margin-bottom: 24px;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #666;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.payment-options.three-col {
  grid-template-columns: repeat(3, 1fr);
}

.payment-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  min-height: 150px;
  border: 1px solid var(--primary-orange);
  border-radius: 16px;
  background-color: var(--surface-white);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.payment-btn:hover {
  border-color: var(--primary-red);
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(230, 57, 70, 0.1);
}

.payment-btn.selected {
  border-color: var(--primary-red);
  background-color: #fff5f5;
  box-shadow: 0 0 0 2px var(--primary-red);
}

.payment-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.payment-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-navy);
  text-align: center;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
}

/* Action Footer */
.action-footer {
  display: flex;
  gap: 16px;
  padding: 20px;
  background-color: white;
  border-top: 2px solid #e0e0e0;
}

.footer-btn {
  flex: 1;
  padding: 16px 24px;
  min-height: 70px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-btn.back {
  background-color: var(--surface-white);
  color: var(--text-muted);
  border: 1px solid var(--primary-orange);
}

.footer-btn.back:hover {
  background-color: var(--background-light);
}

.footer-btn.next {
  background-color: var(--primary-red);
  color: white;
  box-shadow: var(--shadow-md);
}

.footer-btn.next:hover:not(:disabled) {
  background-color: var(--primary-red-dark);
  transform: translateY(-2px);
}

.footer-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.point-value { color: #d32f2f; }

/* Responsive */
@media (max-width: 480px) {
  .payment-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .payment-options.three-col {
    grid-template-columns: repeat(2, 1fr);
  }

  .payment-btn {
    padding: 16px 12px;
  }

  .payment-icon {
    font-size: 28px;
  }

  .payment-name {
    font-size: 12px;
  }
}
</style>

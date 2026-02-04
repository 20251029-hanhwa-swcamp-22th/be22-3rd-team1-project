<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  orderNumber: {
    type: String,
    required: true
  },
  orderItems: {
    type: Array,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  earnedPoints: {
    type: Number,
    default: 0
  },
  currentPoints: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['goHome', 'complete'])

const handleGoHome = () => {
  emit('goHome')
}

const handleComplete = () => {
  emit('complete')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <!-- Header -->
        <h2 class="modal-title">{{ $t('modal.order_completion_title') }}</h2>

        <!-- Body -->
        <div class="modal-body">
          <!-- Order Number Section -->
          <div class="order-number-section">
            <span class="order-number-label">{{ $t('modal.order_number_label') }}</span>
            <span class="order-number-value">{{ orderNumber }}</span>
          </div>

          <!-- Order Info Section -->
          <div class="order-info-section">
            <span class="order-info-label">{{ $t('modal.order_info_label') }}</span>
            <div class="order-items-list">
              <div
                v-for="item in orderItems"
                :key="item.id"
                class="order-item"
              >
                <span class="item-name">{{ item.name[$i18n.locale] || item.name }}</span>
                <span class="item-qty">x{{ item.quantity }}</span>
                <span class="item-price">{{ (item.price * item.quantity).toLocaleString() }}{{ $t('common.won') }}</span>
              </div>
            </div>
          </div>

          <!-- Total Price -->
          <div class="order-total-section">
            <span class="order-total-label">{{ $t('modal.order_total_label') }}</span>
            <span class="order-total-value">{{ totalPrice.toLocaleString() }}{{ $t('common.won') }}</span>
          </div>

          <!-- Points Info -->
          <div v-if="earnedPoints > 0" class="points-info-section">
            <div class="points-row">
              <span class="points-label">{{ $t('modal.earned_points_label') }}</span>
              <span class="points-value">+ {{ earnedPoints.toLocaleString() }}P</span>
            </div>
            <div class="points-row total-points">
              <span class="points-label">{{ $t('modal.total_points_label') }}</span>
              <span class="points-value">{{ currentPoints.toLocaleString() }}P</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button class="action-btn home-btn" @click="handleGoHome">
            {{ $t('fail.home_btn') }}
          </button>
          <button class="action-btn complete-btn" @click="handleComplete">
            {{ $t('modal.complete') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Modal Overlay - matches MenuInfoModal pattern */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--surface-white);
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-subtle);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-title {
  text-align: center;
  font-size: 24px;
  font-weight: 800;
  padding: 24px;
  background-color: var(--primary-red-dark);
  color: white;
  letter-spacing: -0.5px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Order Number Section */
.order-number-section {
  text-align: center;
  padding: 24px;
  background-color: #fff5f5;
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid var(--primary-red);
}

.order-number-label {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-red);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.order-number-value {
  display: block;
  font-size: 72px;
  font-weight: 800;
  color: var(--primary-red-dark);
  letter-spacing: 4px;
  line-height: 1;
}

/* Order Info Section */
.order-info-section {
  background-color: var(--background-light);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid var(--border-subtle);
}

.order-info-label {
  display: block;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: var(--primary-red);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.order-items-list {
  min-height: 80px;
  max-height: 180px;
  overflow-y: auto;
}

.order-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  padding: 12px 0;
  font-size: 14px;
  color: var(--text-dark);
  border-bottom: 1px solid var(--border-subtle);
  align-items: center;
}

.order-item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 600;
}

.item-qty {
  text-align: center;
  color: var(--text-muted);
}

.item-price {
  text-align: right;
  font-weight: 700;
  color: var(--primary-red);
}

.order-total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 0;
  border-top: 2px solid var(--primary-red);
}

.order-total-label {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-dark);
}

.order-total-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary-red-dark);
}

/* Points Info Section */
.points-info-section {
  margin-top: 20px;
  padding: 16px;
  background-color: var(--background-cream);
  border-radius: 12px;
  border: 1px solid var(--primary-red);
}

.points-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.points-row.total-points {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--primary-red);
  font-weight: 800;
}

.points-label {
  font-size: 14px;
  color: var(--text-muted);
}

.points-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary-red);
}

.total-points .points-value {
  color: var(--primary-red-dark);
  font-size: 16px;
}

/* Modal Actions */
.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 24px;
  background-color: var(--surface-white);
  border-top: 1px solid var(--border-subtle);
}

.action-btn {
  padding: 18px 24px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-btn {
  background-color: var(--background-light);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}

.home-btn:hover {
  background-color: #f1f3f5;
  color: var(--text-dark);
}

.complete-btn {
  background-color: var(--primary-red);
  color: white;
  box-shadow: var(--shadow-md);
}

.complete-btn:hover {
  background-color: var(--primary-red-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.action-btn:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 480px) {
  .order-number-value {
    font-size: 48px;
    letter-spacing: 4px;
  }

  .action-btn {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>

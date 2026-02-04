<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n();

const router = useRouter();
const route = useRoute();
const props = defineProps({
  menu: {
    type: Object,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'add'])

const quantity = ref(1)

const selectedOptions = ref({});

const totalPrice = computed(() => {
  let base = props.menu.price
  
  props.menu.options?.forEach(opt => {
    const optName = typeof opt.name === 'object' ? opt.name.ko : opt.name;
    const selected = selectedOptions.value[optName]

    if (!selected) return
    
    if (opt.multiple) {
      selected.forEach(label => {
        const choice = opt.choices.find(c => {
          const choiceLabelKo = typeof c.label === 'object' ? c.label.ko : c.label;
          return choiceLabelKo === label || c.label === label;
        })
        if (choice) base += choice.price
      })
    } 
    else {
      const choice = opt.choices.find(c => {
        const choiceLabelKo = typeof c.label === 'object' ? c.label.ko : c.label;
        return choiceLabelKo === selected || c.label === selected;
      })
      if (choice) base += choice.price
    }
  })
  
  return base * quantity.value
})

onMounted(() => {
  props.menu.options?.forEach(option => {
    const optName = typeof option.name === 'object' ? option.name.ko : option.name;
    if (option.required) {
      const choiceLabel = typeof option.choices[0].label === 'object' ? option.choices[0].label.ko : option.choices[0].label;
      selectedOptions.value[optName] = choiceLabel;
    } else if (option.multiple) {
      selectedOptions.value[optName] = [];
    }
  })
})

const increaseQuantity = () => {
  // 재고 체크
  if (props.menu.stock !== undefined && quantity.value >= props.menu.stock) {
    alert(t('order.low_stock_alert', { count: props.menu.stock }))
    return
  }
  quantity.value++
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleCancel = () => {
  quantity.value = 1
  emit('close')
}

// const handleAdd = () => {
//   emit('add', { ...props.menu, quantity: quantity.value })
//   quantity.value = 1
//   emit('close')

const handleAdd = () => {
  emit('add', { 
    ...props.menu, 
    quantity: quantity.value,
    selectedOptions: { ...selectedOptions.value }, 
    totalPrice: totalPrice.value 
  });
  quantity.value = 1;
  emit('close');
};

  // 옵션 선택 처리 함수
const handleOptionSelect = (option, choice) => {
  const optName = typeof option.name === 'object' ? option.name.ko : option.name;
  const choiceLabel = typeof choice.label === 'object' ? choice.label.ko : choice.label;

  if (option.required) {
    selectedOptions.value[optName] = choiceLabel;
  } else if (option.multiple) {
    const current = selectedOptions.value[optName] || [];
    const index = current.indexOf(choiceLabel);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(choiceLabel);
    }
    selectedOptions.value[optName] = current;
  }
};
// 선택 여부 확인 함수 (isSelected)
const isSelected = (option, choice) => {
  const optName = typeof option.name === 'object' ? option.name.ko : option.name;
  const choiceLabel = typeof choice.label === 'object' ? choice.label.ko : choice.label;
  const selected = selectedOptions.value[optName];
  if (!selected) return false;
  
  if (option.required) {
    return selected === choiceLabel;
  } else {
    return selected.includes(choiceLabel);
  }
};

const getCategoryIcon = (categoryId) => {
  const iconMap = {
    pizza: '🍕',
    hamburger: '🍔',
    drink: '🥤',
    sandwich: '🥪',
    side: '🍟',
    dessert: '🍰'
  }
  return iconMap[categoryId] || '🍽️'
}

</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
      <div class="modal-content">
        <!-- Menu Image -->
        <div class="menu-image">
          <img v-if="menu.image" :src="menu.image" :alt="menu.name" />
          <span v-else class="menu-placeholder-icon">{{ getCategoryIcon(menu.category) }}</span>
        </div>

        <!-- Menu Info -->
        <div class="menu-info">
          <h2 class="menu-name">{{ menu.name[$i18n.locale] || menu.name }}</h2>
          <p class="menu-description">{{ menu.description[$i18n.locale] || menu.description }}</p>
          <!-- <p class="menu-price">{{ menu.price?.toLocaleString() }}원</p> -->
           <p class="menu-price">{{ totalPrice?.toLocaleString() }}{{ $t('common.won') }}</p>
        </div>

        <!-- Options -->
        <div class="options-container">
          <div v-for="option in menu.options" :key="option.name[$i18n.locale] || option.name" class="option-group">
            <h3>{{ option.name[$i18n.locale] || option.name }} ({{ option.required ? $t('admin.required') : $t('order.optional') }})</h3>
            
            <div class="option-grid">
              <div 
                v-for="choice in option.choices" 
                :key="choice.label" 
                class="option-card"
                :class="{ 'active': isSelected(option, choice) }"
                @click="handleOptionSelect(option, choice)"
              >
                <div class="option-card-image">
                  <img v-if="choice.image" :src="choice.image" :alt="choice.label">
                  <span v-else class="placeholder">{{ getCategoryIcon(menu.category) }}</span>
                </div>
                <div class="option-card-info">
                  <div class="choice-label">{{ choice.label[$i18n.locale] || choice.label }}</div>
                  <div class="choice-price">+{{ choice.price?.toLocaleString() }}{{ $t('common.won') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quantity Controls -->
        <div class="quantity-controls">
          <button class="quantity-btn" @click="decreaseQuantity">-</button>
          <span class="quantity-value">{{ quantity }}</span>
          <button
            class="quantity-btn"
            @click="increaseQuantity"
            :disabled="menu.stock !== undefined && quantity >= menu.stock"
          >+</button>
        </div>
        <p v-if="menu.stock !== undefined" class="stock-info">
          {{ $t('order.remaining_stock', { count: menu.stock }) }}
        </p>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button class="action-btn cancel-btn" @click="handleCancel">
            {{ $t('common.cancel') }}
          </button>
          <button class="action-btn add-btn" @click="handleAdd">
            {{ $t('order.add_to_cart') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
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

.menu-image {
  width: 100%;
  height: 220px;
  background-color: #fff5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.menu-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-placeholder-icon {
  font-size: 80px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.menu-info {
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid var(--border-subtle);
}

.menu-name {
  font-size: 28px;
  font-weight: 800;
  color: var(--primary-red);
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.menu-description {
  font-size: 15px;
  color: var(--text-muted);
  margin-bottom: 16px;
  line-height: 1.4;
}

.menu-price {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary-red-dark);
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 20px;
  background-color: var(--background-light);
}

.quantity-btn {
  width: 48px;
  height: 48px;
  border: 2px solid var(--primary-red);
  border-radius: 12px;
  background-color: var(--surface-white);
  color: var(--primary-red);
  font-size: 24px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  background-color: var(--primary-red);
  color: white;
}

.quantity-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.quantity-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: #ccc;
  color: #ccc;
}

.quantity-value {
  font-size: 32px;
  font-weight: 800;
  min-width: 48px;
  text-align: center;
  color: var(--primary-red);
}

.stock-info {
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #dc3545;
  margin-top: 8px;
  margin-bottom: 12px;
  padding: 6px;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  padding: 24px;
  background-color: var(--surface-white);
}

.action-btn {
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: var(--background-light);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}

.cancel-btn:hover {
  background-color: #f1f3f5;
  color: var(--text-dark);
}

.add-btn {
  background-color: var(--primary-red);
  color: white;
  box-shadow: var(--shadow-md);
}

.add-btn:hover {
  background-color: var(--primary-red-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.action-btn:active {
  transform: translateY(0);
}
.option-group{
  margin-bottom: 10px;
}
.option-group h3{
  margin-bottom: 10px;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.option-card {
  background: white;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.option-card.active {
  border-color: var(--primary-red);
  background-color: #fff5f5;
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.1);
}
.option-card-info {
  margin-top: 4px;
  width: 100%;
}

.choice-label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  word-break: keep-all;
}

.choice-price {
  font-size: 12px;
  color: #666;
}

.options-container {
  flex: 1;            
  overflow-y: auto;   
  padding: 0 20px 20px; 
}

.option-card-image {
  width: 100%;
  aspect-ratio: 1;    
  background-color: rgba(255,255,255,0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  overflow: hidden;
}

.option-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

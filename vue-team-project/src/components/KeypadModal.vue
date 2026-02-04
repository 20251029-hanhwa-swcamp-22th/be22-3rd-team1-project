<script setup>
import { ref, watch } from 'vue';
import VirtualKeypad from './VirtualKeypad.vue';

const props = defineProps(['isOpen', 'title', 'placeholder', 'subtitle', 'maxLimit', 'type']);
const emit = defineEmits(['close', 'confirm']);

const inputValue = ref('');

const onUseAll = () => {
  if (props.maxLimit) {
    inputValue.value = props.maxLimit.toString();
  }
};
// const onInput = (val) => { inputValue.value += val; };
// const onDelete = () => { inputValue.value = inputValue.value.slice(0, -1); };
// const onClear = () => { inputValue.value = ''; };
// const handleConfirm = () => {
//   emit('confirm', inputValue.value);
//   onClear();
// };
const onInput = (val) => { 
  // 번호는 최대 11자까지만 입력되도록 제한 (01012345678)
  if (props.type === 'phone' && inputValue.value.length >= 11) return;
  
  // 포인트 입력 시 초기 '0'은 새 숫자로 대체
  if (props.type === 'point' && inputValue.value === '0') {
    inputValue.value = val;
  } else {
    inputValue.value += val; 
  }
};
const onDelete = () => { 
  inputValue.value = inputValue.value.slice(0, -1); 
  if (props.type === 'point' && inputValue.value === '') {
    inputValue.value = '0';
  }
};
const onClear = () => { 
  if (props.type === 'point') {
    inputValue.value = '0';
  } else {
    inputValue.value = ''; 
  }
};
const handleConfirm = () => {
  emit('confirm', inputValue.value);
  inputValue.value = '';
};

// 1. 모달이 열릴 때(isOpen이 true가 될 때) '010' 초기화
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.type === 'phone') {
      inputValue.value = '010';
    } else if (props.type === 'point') {
      inputValue.value = '0'; // 포인트 입력 시 기본값 0
    } else {
      inputValue.value = ''; // 쿠폰 입력 시에는 비움
    }
  }
});

const formatPhoneNumber = (val) => {
  if (!val) return '';
  if (props.type !== 'phone') return val;
  
  let digits = val.replace(/[^0-9]/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

</script>
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ title }}</h3>
        <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
        <div class="input-container">
          <div class="input-display">{{ formatPhoneNumber(inputValue) || placeholder }}</div>
          <button v-if="type === 'point' && maxLimit" @click="onUseAll" class="use-all-btn">{{ $t('common.use_all') }}</button>
        </div>
        <VirtualKeypad @input="onInput" @delete="onDelete" @clear="onClear" />
        <div class="modal-actions">
          <button @click="emit('close')">{{ $t('common.cancel') }}</button>
          <button @click="handleConfirm" class="confirm">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
    .modal-overlay { 
        position: fixed; 
        top:0; left:0; 
        width:100%; 
        height:100%; 
        background:rgba(0,0,0,0.7); 
        display:flex; 
        align-items:center; 
        justify-content:center; 
        z-index: 2000; 
        backdrop-filter: blur(4px);
    }

    .modal-content { 
        background: var(--surface-white); 
        padding: 32px; 
        border-radius: 24px; 
        width: 360px; 
        text-align: center;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--border-subtle);
    }

    .modal-subtitle {
        font-size: 14px;
        color: var(--text-muted);
        margin-bottom: 12px;
        text-align: right;
        font-weight: 600;
    }

    .input-display { 
        flex: 1;
        border: 2px solid var(--primary-red); 
        padding:16px; 
        text-align:center; 
        font-size:28px; 
        border-radius:12px; 
        min-height: 70px; 
        background-color: #fff5f5;
        color: var(--primary-red-dark);
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .input-container {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 24px;
    }

    .use-all-btn {
        padding: 0 16px;
        background: var(--primary-red);
        color: white;
        border: none;
        border-radius: 12px;
        font-weight: 800;
        white-space: nowrap;
        height: 70px;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .use-all-btn:hover {
        background: var(--primary-red-dark);
        transform: translateY(-2px);
    }

    .modal-actions { 
        display:grid; 
        grid-template-columns: 1fr 1.5fr; 
        gap:12px; 
        margin-top:24px; 
    }

    .modal-actions button { 
        padding: 16px; 
        border-radius: 12px; 
        border: none; 
        font-weight: 800; 
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .modal-actions button:not(.confirm) {
        background: var(--background-light);
        color: var(--text-muted);
        border: 1px solid var(--border-subtle);
    }

    .modal-actions button:not(.confirm):hover {
        background: #f1f3f5;
        color: var(--text-dark);
    }

    .confirm { 
        background: var(--primary-red); 
        color: white; 
        box-shadow: var(--shadow-md);
    }

    .confirm:hover {
        background: var(--primary-red-dark);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }
</style>
<script setup>
const props = defineProps({
  isOpen: Boolean,
  type: { type: String, default: 'alert' }, // 'alert' 또는 'confirm'
  title: String,
  message: String
});
const emit = defineEmits(['close', 'confirm']);
</script>
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <div class="icon-area">
          <span v-if="type === 'alert'">🔔</span>
          <span v-else>❓</span>
        </div>
        <h3 v-if="title">{{ title }}</h3>
        <p class="message">{{ message }}</p>
        
        <div class="modal-actions">
          <!-- Confirm 타입일 때만 취소 버튼 노출 -->
          <button v-if="type === 'confirm'" @click="emit('close')" class="btn-cancel">{{ $t('common.cancel') }}</button>
          <button @click="emit('confirm')" class="btn-confirm">{{ $t('common.confirm') }}</button>
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
    z-index: 3000; 
    backdrop-filter: blur(4px);
}
.modal-content { 
    background: var(--surface-white); 
    padding: 40px; 
    border-radius: 24px; 
    width: 360px; 
    text-align: center; 
    box-shadow: var(--shadow-lg); 
    border: 1px solid var(--border-subtle);
    animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
}
@keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.icon-area { font-size: 48px; margin-bottom: 20px; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1)); }
h3 { margin-bottom: 12px; color: var(--primary-red); font-weight: 800; font-size: 22px; }
.message { font-size: 17px; color: var(--text-muted); margin-bottom: 32px; line-height: 1.6; white-space: pre-line; font-weight: 500; }
.modal-actions { display: flex; gap: 12px; }
button { flex: 1; padding: 16px; border-radius: 12px; border: none; font-size: 16px; font-weight: 800; cursor: pointer; transition: all 0.2s ease; }
.btn-cancel { background: var(--background-cream); color: var(--text-muted); border: 1px solid var(--border-subtle); }
.btn-cancel:hover { background: #f1f3f5; color: var(--text-dark); }
.btn-confirm { background: var(--primary-red); color: white; box-shadow: var(--shadow-md); }
.btn-confirm:hover { background: var(--primary-red-dark); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
</style>
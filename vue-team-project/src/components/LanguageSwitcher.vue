<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  mode: {
    type: String,
    default: 'absolute' // 'absolute' or 'inline'
  },
  variant: {
    type: String,
    default: 'light' // 'light' or 'dark'
  }
})

const { locale } = useI18n()
const setLanguage = (lang) => {
  locale.value = lang
}
</script>

<template>
  <div :class="['lang-switcher', { inline: mode === 'inline', dark: variant === 'dark' }]">
    <button
      :class="['lang-btn', { active: locale === 'ko' }]"
      @click="setLanguage('ko')"
    >KO</button>
    <button
      :class="['lang-btn', { active: locale === 'en' }]"
      @click="setLanguage('en')"
    >EN</button>
  </div>
</template>

<style scoped>
.lang-switcher {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 100;
}

.lang-switcher.inline {
  position: static;
  margin: 0;
}

.lang-btn {
  padding: 6px 12px;
  border: 2px solid var(--primary-red);
  border-radius: 8px;
  background: white;
  color: var(--primary-red);
  cursor: pointer;
  font-weight: bold;
  font-size: 13px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.lang-btn.active {
  background-color: var(--primary-red);
  color: white;
}

.lang-btn:hover:not(.active) {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

/* Dark Variant */
.dark .lang-btn {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
  box-shadow: none;
}

.dark .lang-btn.active {
  background-color: white;
  color: var(--primary-red);
  border-color: white;
}

.dark .lang-btn:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.lang-btn:active {
  transform: translateY(0);
}
</style>

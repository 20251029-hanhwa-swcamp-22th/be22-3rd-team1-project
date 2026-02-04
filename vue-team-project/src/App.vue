<script setup>
import Screensaver from './components/Screensaver.vue'
</script>

<template>
  <div class="kiosk-app">
    <router-view />
    <Screensaver />
  </div>
</template>

<style scoped>
.kiosk-app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}
</style>

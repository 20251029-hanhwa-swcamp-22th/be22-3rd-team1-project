<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const show = ref(false)
const currentImageIndex = ref(1)

// 화면보호기 기능추가를위해 가져옴
import { useRouter } from 'vue-router'
import { useOrderStore } from '../stores/orderStore'
const router = useRouter()
const orderStore = useOrderStore()

let activationTimer = null
let slideshowInterval = null

// "터치(클릭)" 했을 때만 실행되는 함수
const reset = () => {
  // 1. 기존 타이머 정리
  clearTimeout(activationTimer)
  clearInterval(slideshowInterval)
  slideshowInterval = null

  // 2. 화면보호기 끄기 (터치 시 즉시 사라짐)
  show.value = false

 /* // 3. 다시 10초 카운트다운 시작
  activationTimer = setTimeout(() => {
    show.value = true
    currentImageIndex.value = 1*/

  activationTimer = setTimeout(() => {

    // Pinia 스토어를 사용하여 장바구니 초기화 및 메인 이동
    orderStore.clearOrder() 
    router.replace('/')

    show.value = true
    currentImageIndex.value = 1

    // 5초마다 이미지 변경
    slideshowInterval = setInterval(() => {
      currentImageIndex.value = (currentImageIndex.value % 5) + 1
    }, 5000)

  }, 300000)
}

onMounted(() => {
  reset()

  window.addEventListener('click', reset)
})

onUnmounted(() => {
  clearTimeout(activationTimer)
  clearInterval(slideshowInterval)
  window.removeEventListener('click', reset)
})
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="screensaver-overlay" @click="reset">
      <img
          :src="`/advertisement/advertisement.${currentImageIndex}.jpg`"
          alt="광고 이미지"
          class="ad-image"
      />

      <div class="text-container">
        <h1 class="animate-pulse">{{ $t('screensaver.touch_to_order') }}</h1>
        <p>{{ $t('screensaver.touch_screen') }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>

/*.black-box 기존 검정화면 보호기*/

/*video {
width: 100%;
height: 100%;
object-fit: cover; !* 영상을 화면 비율에 맞춰 꽉 채우기 (빈틈 없이) *!
}*/

.screensaver-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;

  /* 배경 블러 처리 */
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer; /* 클릭 가능하다는 표시(손가락 커서) */
}

.ad-image {
  max-width: 85%;
  max-height: 65vh;
  object-fit: contain;

  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  border-radius: 16px;
  transition: all 0.5s ease;
}

.text-container {
  text-align: center;
  color: white;
  margin-top: 40px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.8);

  /* 사용자가 글씨를 드래그하지 못하게 막기 (터치감 향상) */
  user-select: none;
}

h1 {
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
}

p {
  font-size: 1.5rem;
  margin-top: 10px;
  opacity: 0.9;
  font-weight: 300;
}

/* 깜빡이는 애니메이션 */
.animate-pulse {
  animation: pulse 2s infinite ease-in-out;
}



/* 화면 전환 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>



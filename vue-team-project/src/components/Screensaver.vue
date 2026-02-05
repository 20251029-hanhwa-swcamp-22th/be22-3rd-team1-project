<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrderStore } from '../stores/orderStore'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

// --- [추가] 상수 관리 (Magic Numbers 제거) ---
const IDLE_TIMEOUT_MAIN = 30000     // 메인 화면 대기 시간 (30초)
const IDLE_TIMEOUT_ORDER = 15000    // 주문 화면 대기 시간 (15초)
const COUNTDOWN_SECONDS = 10        // 복귀 카운트다운 (10초)
const SLIDE_INTERVAL = 5000         // 광고 슬라이드 간격 (5초)

// 상태 변수
const show = ref(false)
const mode = ref('ad') // 'ad'(광고) 또는 'warning'(복귀경고)
const currentImageIndex = ref(1)
// const returnCountdown = ref(10) // [변경전] 하드코딩
const returnCountdown = ref(COUNTDOWN_SECONDS) // [변경후] 상수 사용

// 타이머 변수들
let activationTimer = null
let intervalTimer = null

const reset = () => {
  clearTimeout(activationTimer)
  clearInterval(intervalTimer)
  intervalTimer = null
  show.value = false

  // 메인 페이지 여부 확인
  const isMainPage = route.path === '/'

  // [변경전] 테스트용 하드코딩
  // const waitTime = isMainPage ? 10000 : 10000 // 테스트용 (30초 / 15초)

  // [변경후] 상수 사용 (실제 운영 시간 적용)
  const waitTime = isMainPage ? IDLE_TIMEOUT_MAIN : IDLE_TIMEOUT_ORDER

  activationTimer = setTimeout(() => {
    show.value = true

    if (isMainPage) {
      // [모드 1] 광고 슬라이드
      mode.value = 'ad'
      currentImageIndex.value = 1

      // 5초마다 이미지 변경
      intervalTimer = setInterval(() => {
        currentImageIndex.value = (currentImageIndex.value % 7) + 1
        // }, 3000) // [변경전] 3초
      }, SLIDE_INTERVAL) // [변경후] 5초 (상수)

    } else {
      // [모드 2] 복귀 경고
      mode.value = 'warning'
      // returnCountdown.value = 10 // [변경전]
      returnCountdown.value = COUNTDOWN_SECONDS // [변경후]

      intervalTimer = setInterval(() => {
        returnCountdown.value--
        if (returnCountdown.value <= 0) {
          clearInterval(intervalTimer)
          show.value = false
          orderStore.clearOrder()
          router.replace('/')
        }
      }, 1000)
    }
  }, waitTime)
}

onMounted(() => {
  reset()
  window.addEventListener('click', reset)
  window.addEventListener('touchstart', reset) // [추가] 터치 이벤트 핸들러 추가 권장
})

onUnmounted(() => {
  clearTimeout(activationTimer)
  clearInterval(intervalTimer)
  window.removeEventListener('click', reset)
  window.removeEventListener('touchstart', reset) // [추가] 해제
})
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="screensaver-overlay" @click="reset">

      <div v-if="mode === 'ad'" class="ad-container">

        <div class="ad-frame">
          <img
              :src="`/advertisement/advertisement.${currentImageIndex}.jpg`"
              alt="광고 이미지"
              class="ad-image"
          />
        </div>

        <div class="text-container">
          <h1 class="animate-pulse">{{$t('screensaver.touch_to_order')}}</h1>
          <p>{{$t('screensaver.touch_screen')}}</p>
        </div>
      </div>

      <div v-else-if="mode === 'warning'" class="warning-container">
        <div class="image-container">
          <img src="/icon/loading.gif" alt="Loading" class="loading-gif" />
        </div>

        <div class="text-container">
          <p class="return-text">
            <span class="highlight">{{ returnCountdown }}&nbsp</span>{{$t('screensaver.return_countdown')}}<br>
            {{$t('screensaver.return_to_main')}}
          </p>
          <p class="sub-text">{{$t('screensaver.continue_order')}}</p>
        </div>
      </div>

    </div>
  </Transition>
</template>

<style scoped>
/* 스타일 코드는 변경 사항 없음 (기존 유지) */
.screensaver-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.text-container {
  text-align: center;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.8);
  user-select: none;
  margin-top: 30px;
}
.ad-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.ad-frame {
  width: 600px;
  height: 750px;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.ad-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
}
.ad-container h1 {
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
}
.ad-container p {
  font-size: 1.5rem;
  margin-top: 10px;
  opacity: 0.9;
}
.warning-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.image-container {
  width: 180px;
  height: 180px;
  margin-bottom: 20px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}
.loading-gif {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 20px;
}
.return-text {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1.4;
  margin-bottom: 15px;
}
.highlight {
  color: #ffcc00;
  font-size: 2.5rem;
}
.sub-text {
  font-size: 1.2rem;
  opacity: 0.8;
  font-weight: 300;
  animation: pulse 2s infinite ease-in-out;
}
.animate-pulse {
  animation: pulse 2s infinite ease-in-out;
}
@keyframes pulse {
  0% { opacity: 0.6; transform: scale(0.98); }
  50% { opacity: 1; transform: scale(1.02); }
  100% { opacity: 0.6; transform: scale(0.98); }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
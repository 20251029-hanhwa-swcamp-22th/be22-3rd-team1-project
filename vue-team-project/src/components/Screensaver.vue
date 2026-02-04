<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrderStore } from '../stores/orderStore'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

// 상태 변수
const show = ref(false)
const mode = ref('ad') // 'ad'(광고) 또는 'warning'(복귀경고)
const currentImageIndex = ref(1)
const returnCountdown = ref(10)

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
  const waitTime = isMainPage ? 10000 : 10000 // 테스트용 (30초 / 15초)

  activationTimer = setTimeout(() => {
    show.value = true

    if (isMainPage) {
      // [모드 1] 광고 슬라이드
      mode.value = 'ad'
      currentImageIndex.value = 1

      // 5초마다 이미지 변경
      intervalTimer = setInterval(() => {
        currentImageIndex.value = (currentImageIndex.value % 7) + 1
      }, 5000)

    } else {
      // [모드 2] 복귀 경고
      mode.value = 'warning'
      returnCountdown.value = 10

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
})

onUnmounted(() => {
  clearTimeout(activationTimer)
  clearInterval(intervalTimer)
  window.removeEventListener('click', reset)
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
          <h1 class="animate-pulse">터치하여 주문하기</h1>
          <p>Touch screen to order</p>
        </div>
      </div>

      <div v-else-if="mode === 'warning'" class="warning-container">
        <div class="image-container">
          <img src="/icon/loading.gif" alt="Loading" class="loading-gif" />
        </div>

        <div class="text-container">
          <p class="return-text">
            <span class="highlight">{{ returnCountdown }}</span>초 후<br>
            메인화면으로 돌아갑니다
          </p>
          <p class="sub-text">계속 주문하시려면 화면을 터치하세요</p>
        </div>
      </div>

    </div>
  </Transition>
</template>

<style scoped>
.screensaver-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;

  /* 공통 배경 */
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

/* --- 공통 텍스트 스타일 --- */
.text-container {
  text-align: center;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.8);
  user-select: none;
  margin-top: 30px;
}

/* --- [수정] 모드 1: 광고 스타일 (액자 형태) --- */
.ad-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* [핵심] 광고 이미지가 들어갈 고정된 틀(Tray) */
.ad-frame {
  /* ▼▼▼ 여기 숫자를 조절해서 원하는 크기로 맞추세요 ▼▼▼ */
  width: 600px;
  height: 750px;
  /* ▲▲▲ -------------------------------------- ▲▲▲ */

  overflow: hidden; /* 이미지가 틀을 벗어나면 자름 */
  border-radius: 20px; /* 둥근 모서리 */
  box-shadow: 0 20px 50px rgba(0,0,0,0.6); /* 그림자 */
  background-color: #000; /* 이미지가 로딩되기 전 배경색 */

  /* 틀 가운데 정렬 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.ad-image {
  width: 100%;
  height: 100%;
  /* cover: 틀에 꽉 차게 (잘릴 수 있음) / contain: 다 보이게 (여백 생길 수 있음) */
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

/* --- 모드 2: 경고(로딩) 스타일 --- */
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

/* 애니메이션 */
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
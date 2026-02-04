<!--
<script setup>
// 기본기능(진행)을 가져옴
import { ref, onMounted, onUnmounted } from 'vue'
// 화면보호기 초기상태
const show = ref(false)
const currentImageIndex = ref(1)

// 화면보호기 기능추가를위해 가져옴
import { useRouter } from 'vue-router'
import { orderStore } from '../stores/orderStore'
const router = useRouter()

let activationTimer = null
let slideshowInterval = null

// [추가] 메인 복귀 카운트다운용 변수
let returnInterval = null
const returnCountdown = ref(10) // 10초 카운트다운 설정

// "터치(클릭)" 했을 때만 실행되는 함수
const reset = () => {
  // 1. 기존 타이머 정리
  clearTimeout(activationTimer)
  clearInterval(slideshowInterval)
  clearInterval(returnInterval) // 복귀 카운트다운용

  slideshowInterval = null
  returnInterval = null

  // 2. 화면보호기 끄기 (터치 시 즉시 사라짐)
  show.value = false

 /* // 3. 다시 10초 카운트다운 시작
  activationTimer = setTimeout(() => {
    show.value = true
    currentImageIndex.value = 1*/


  // 화면보호기 보여줌
  activationTimer = setTimeout(() => {

/*    orderStore.clearOrder() // 장바구니 비우기
    router.replace('/')     // 메인 화면으로 이동*/

    show.value = true // 화면 킴
    currentImageIndex.value = 1
    returnCountdown.value = 10 // 복귀 카운트다운 초기값(초)


    // 일정시간마다 이미지 변경
    slideshowInterval = setInterval(() => {
      currentImageIndex.value = (currentImageIndex.value % 5) + 1
    }, 5000)

    // 1초마다 숫자를 줄이는 타이머 추가
    returnInterval = setInterval(() => {
      returnCountdown.value&#45;&#45; // 1초씩 감소

    // 시간이 0이 되면 그때! 초기화하고 이동합니다.
    if (returnCountdown.value <= 0) {
      clearInterval(returnInterval) // 타이머 멈춤

      orderStore.clearOrder() // 장바구니 비우기
      router.replace('/')     // 메인 화면으로 이동
    }
  }, 1000)

  }, 3000)
}



onMounted(() => {
  reset()

  window.addEventListener('click', reset)
})

onUnmounted(() => {
  clearTimeout(activationTimer)
  clearInterval(slideshowInterval)
  clearInterval(returnInterval) // 카운트다운용 - 언마운트 시 정리
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
        <h1 class="animate-pulse">터치하여 주문하기</h1>
        <p>Touch screen to order</p>
      </div>
    </div>
  </Transition>
  <div class="text-container">
    <p v-if="returnCountdown > 0" class="return-text">
      {{ returnCountdown }}초 뒤 메인 화면으로 돌아갑니다
    </p>
  </div>
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

/*  카운트다운용 텍스트 스타일 */
.return-text {
  font-size: 1.2rem;
  color: #ffcc00;
  margin-top: 20px;
  font-weight: bold;
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


-->



<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { orderStore } from '../stores/orderStore'

const router = useRouter()
const route = useRoute() // 현재 페이지 확인용

// 상태 변수
const show = ref(false)
const mode = ref('ad') // 'ad'(광고) 또는 'warning'(복귀경고)
const currentImageIndex = ref(1)
const returnCountdown = ref(10)

// 타이머 변수들
let activationTimer = null   // 대기 타이머 (15초 or 30초)
let intervalTimer = null     // 슬라이드쇼 or 카운트다운 타이머

const reset = () => {
  // 1. 기존 타이머 모두 정리
  clearTimeout(activationTimer)
  clearInterval(intervalTimer)
  intervalTimer = null

  // 2. 화면보호기 끄기
  show.value = false

  // 3. 현재 페이지가 '메인 화면'인지 확인
  const isMainPage = route.path === '/'

  // 4. 대기 시간 설정 (메인이면 3초, 아니면 1.5초)
  const waitTime = isMainPage ? 3000 : 1500

  // 5. 대기 타이머 시작
  activationTimer = setTimeout(() => {
    show.value = true

    if (isMainPage) {
      // === 메인 화면일 때: 광고 슬라이드 ===
      mode.value = 'ad'
      currentImageIndex.value = 1

      // 5초마다 이미지 변경
      intervalTimer = setInterval(() => {
        currentImageIndex.value = (currentImageIndex.value % 5) + 1
      }, 5000)

    } else {
      // === [모드 2] 주문 중일 때: 복귀 경고 ===
      mode.value = 'warning'
      returnCountdown.value = 10 // 10초 카운트다운

      // 1초마다 카운트다운 감소
      intervalTimer = setInterval(() => {
        returnCountdown.value--

        if (returnCountdown.value <= 0) {
          clearInterval(intervalTimer)
          show.value = false

          orderStore.clearOrder() // 초기화
          router.replace('/')     // 메인으로 이동
        }
      }, 1000)
    }

  }, waitTime)
}

onMounted(() => {
  reset()
  // 클릭, 터치 등 이벤트가 발생하면 타이머 리셋
  window.addEventListener('click', reset)
/*  window.addEventListener('touchstart', reset)
  window.addEventListener('mousemove', reset)*/
})

onUnmounted(() => {
  clearTimeout(activationTimer)
  clearInterval(intervalTimer)
  window.removeEventListener('click', reset)
/*  window.removeEventListener('touchstart', reset)
  window.removeEventListener('mousemove', reset)*/
})
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="screensaver-overlay" @click="reset">

      <div v-if="mode === 'ad'" class="ad-container">
        <img
            :src="`/advertisement/advertisement.${currentImageIndex}.jpg`"
            alt="광고 이미지"
            class="ad-image"
        />
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

/* --- 공통 스타일 --- */
.text-container {
  text-align: center;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.8);
  user-select: none;
  margin-top: 20px;
}

/* --- 모드 1: 광고 스타일 --- */
.ad-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.ad-image {
  max-width: 85%;
  max-height: 60vh;
  object-fit: contain;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  border-radius: 16px;
  transition: all 0.5s ease;
}

.ad-container h1 {
  font-size: 3rem;
  font-weight: 800;
  margin: 20px 0 0 0;
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
  /* 로딩 이미지 컨테이너에도 둥근 모서리와 그림자 추가 */
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.loading-gif {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* 로딩 이미지 테두리 둥글게 */
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

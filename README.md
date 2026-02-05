# 키오스크 주문 시스템

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3.0-FFD859?logo=vue.js&logoColor=black)
![License](https://img.shields.io/badge/License-Private-red)
![Status](https://img.shields.io/badge/Status-개발중-yellow)

관리자 관리 기능을 갖춘 Vue 3 기반의 식당 주문용 셀프 서비스 키오스크 애플리케이션입니다. 현대적인 프론트엔드 기술로 구축되었으며, 이중 언어(한국어/영어) 지원이 가능하도록 설계되었습니다.

## 목차

- [기능](#기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [사용 가능한 스크립트](#사용-가능한-스크립트)
- [아키텍처 개요](#아키텍처-개요)
- [API 엔드포인트](#api-엔드포인트)
- [다국어 지원](#다국어-지원)
- [개발](#개발)

## 기능

### 고객 기능
- **메뉴 탐색**: 카테고리별로 메뉴 탐색 (피자, 햄버거, 음료, 샌드위치, 사이드, 디저트)
- **상품 옵션**: 사이즈, 토핑 및 기타 커스터마이징 선택
- **장바구니**: 주문 항목 추가, 삭제 및 수량 변경
- **결제 흐름**: 할인/쿠폰을 지원하는 다양한 결제 수단
- **멤버십 프로그램**: 회원 조회, 포인트 적립 및 사용
- **화면 보호기**: 5분간 미사용 시 자동으로 광고 화면 표시

### 관리자 기능
- **대시보드**: 매장 운영 현황 개요
- **메뉴 관리**: 메뉴 항목 CRUD 기능
- **매출 분석**: 카테고리별 분석, 인기 메뉴 및 추세 분석
- **재고 관리**: 재고 수준 추적 및 업데이트

### 추가 기능
- 이중 언어 지원 (한국어/영어)
- 키오스크 디스플레이에 최적화된 반응형 디자인
- 실시간 재고 검증
- 전화번호 입력용 가상 키패드

## 기술 스택

### 핵심 프레임워크
![Vue.js](https://img.shields.io/badge/Vue.js-3.5.27-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### 상태 관리 & 라우팅
![Pinia](https://img.shields.io/badge/Pinia-3.0.4-FFD859?style=for-the-badge&logo=vue.js&logoColor=black)
![Vue Router](https://img.shields.io/badge/Vue_Router-4.6.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)

### HTTP & API
![Axios](https://img.shields.io/badge/Axios-1.13.4-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![JSON Server](https://img.shields.io/badge/JSON_Server-1.0.0-000000?style=for-the-badge&logo=json&logoColor=white)

### 다국어 지원
![Vue I18n](https://img.shields.io/badge/Vue_I18n-11.2.8-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)

### 개발 도구
![Node.js](https://img.shields.io/badge/Node.js-≥20.19.0-339933?style=for-the-badge&logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-패키지_매니저-CB3837?style=for-the-badge&logo=npm&logoColor=white)

## 프로젝트 구조

```
vue-team-project/
├── public/
│   ├── advertisement/       # 화면 보호기 이미지
│   ├── payment/             # 결제 수단 아이콘
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── images/          # 메뉴 항목 이미지 (카테고리별)
│   │   │   ├── pizza/
│   │   │   ├── hamburger/
│   │   │   ├── drink/
│   │   │   ├── sandwich/
│   │   │   ├── side/
│   │   │   └── dessert/
│   │   ├── styles/
│   │   └── main.css         # 전역 스타일 & CSS 변수
│   ├── components/
│   │   ├── MenuInfoModal.vue       # 옵션이 있는 상품 상세 모달
│   │   ├── MessageModal.vue        # 알림/확인 다이얼로그
│   │   ├── Screensaver.vue         # 광고 화면 보호기
│   │   ├── VirtualKeypad.vue       # 숫자 키패드 UI
│   │   ├── KeypadModal.vue         # 키패드 모달 래퍼
│   │   ├── OrderCompletionModal.vue # 주문 완료 표시
│   │   └── LanguageSwitcher.vue    # 언어 전환 컴포넌트
│   ├── data/
│   │   └── db.json          # JSON Server 데이터베이스
│   ├── locales/
│   │   ├── i18n.js          # i18n 설정
│   │   └── translations.js  # 한국어 & 영어 번역
│   ├── router/
│   │   └── index.js         # 라우트 정의
│   ├── services/
│   │   ├── axios.js         # Axios 인스턴스 설정
│   │   └── api.js           # API 서비스 함수
│   ├── stores/
│   │   └── orderStore.js    # 주문 상태용 Pinia 스토어
│   ├── views/
│   │   ├── MainPage.vue            # 시작 화면
│   │   ├── OrderPage.vue           # 메뉴 탐색 & 장바구니
│   │   ├── PaymentMethodPage.vue   # 결제 수단 선택
│   │   ├── PaymentConfirmPage.vue  # 주문 확인
│   │   ├── PaymentProcessView.vue  # 결제 처리
│   │   ├── PaymentFailView.vue     # 결제 실패 처리
│   │   ├── AdminLoginPage.vue      # 관리자 인증
│   │   ├── AdminDashboard.vue      # 관리자 개요
│   │   ├── AdminMenuManagement.vue # 메뉴 CRUD
│   │   └── AdminSalesStats.vue     # 매출 분석
│   ├── App.vue              # 루트 컴포넌트
│   └── main.js              # 애플리케이션 진입점
├── .env                     # 환경 변수
├── index.html               # HTML 템플릿
├── package.json
└── vite.config.js           # Vite 설정
```

## 시작하기

### 사전 요구 사항

- Node.js ^20.19.0 또는 >=22.12.0
- npm 또는 yarn

### 설치

```bash
# 저장소 복제
git clone <repository-url>
cd vue-team-project

# 의존성 설치
npm install
```

### 애플리케이션 실행

```bash
# 개발 서버와 mock API 동시 실행
npm run dev:all
```

실행 시 다음 서비스가 시작됩니다:
| 서비스 | URL | 설명 |
|--------|-----|------|
| ![Frontend](https://img.shields.io/badge/프론트엔드-646CFF?style=flat-square&logo=vite&logoColor=white) | http://localhost:5173 | Vite 개발 서버 |
| ![API](https://img.shields.io/badge/API-000000?style=flat-square&logo=json&logoColor=white) | http://localhost:3000 | JSON Server |

## 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| ![dev](https://img.shields.io/badge/npm_run-dev-4FC08D?style=flat-square&logo=npm) | Vite 개발 서버 시작 |
| ![build](https://img.shields.io/badge/npm_run-build-4FC08D?style=flat-square&logo=npm) | 프로덕션 빌드 |
| ![preview](https://img.shields.io/badge/npm_run-preview-4FC08D?style=flat-square&logo=npm) | 프로덕션 빌드 미리보기 |
| ![server](https://img.shields.io/badge/npm_run-server-000000?style=flat-square&logo=npm) | JSON Server mock API 시작 |
| ![dev:all](https://img.shields.io/badge/npm_run-dev:all-E63946?style=flat-square&logo=npm) | 프론트엔드와 API 동시 실행 |

## 아키텍처 개요

### 상태 관리 (Pinia)

`orderStore`가 전역 주문 상태를 관리합니다:

```javascript
// 상태 (State)
- orderList: []           // 장바구니 항목
- selectedPaymentMethod   // 선택된 결제 수단
- currentMember           // 로그인된 회원 프로필
- totalDiscount           // 적용된 할인
- usedPoints              // 사용된 포인트

// 게터 (Getters)
- calculatedTotalPrice    // 계산된 장바구니 총액

// 액션 (Actions)
- addItem()               // 장바구니에 항목 추가/병합
- removeItem()            // 장바구니에서 제거
- updateQuantity()        // 항목 수량 변경
- clearOrder()            // 모든 상태 초기화
```

### 라우팅

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | MainPage | 식사 옵션이 있는 시작 화면 |
| `/order` | OrderPage | 메뉴 탐색 및 장바구니 |
| `/payment-method` | PaymentMethodPage | 결제 수단 선택 |
| `/payment-confirm` | PaymentConfirmPage | 주문 확인 |
| `/payment-process` | PaymentProcessView | 결제 처리 |
| `/payment-fail` | PaymentFailView | 결제 실패 |
| `/admin/login` | AdminLoginPage | 관리자 인증 |
| `/admin` | AdminDashboard | 관리자 개요 |
| `/admin/menu` | AdminMenuManagement | 메뉴 관리 |
| `/admin/sales` | AdminSalesStats | 매출 분석 |

### 컴포넌트 아키텍처

**스마트 컴포넌트 (Views)**: 비즈니스 로직, API 호출 및 상태 관리 담당
- `OrderPage.vue`, `PaymentMethodPage.vue`, `AdminMenuManagement.vue`

**프레젠테이션 컴포넌트**: 재사용 가능한 UI 요소
- `MenuInfoModal.vue`, `VirtualKeypad.vue`, `LanguageSwitcher.vue`

## API 엔드포인트

이 애플리케이션은 JSON Server를 mock REST API로 사용합니다.

### 카테고리
| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/categories` | 모든 카테고리 조회 |

### 메뉴 항목
| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/menuItems` | 모든 메뉴 항목 조회 |
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/menuItems?category=<id>` | 카테고리별 필터링 |
| ![POST](https://img.shields.io/badge/POST-2196F3?style=flat-square) | `/menuItems` | 메뉴 항목 생성 |
| ![PUT](https://img.shields.io/badge/PUT-FF9800?style=flat-square) | `/menuItems/:id` | 메뉴 항목 수정 |
| ![DELETE](https://img.shields.io/badge/DELETE-F44336?style=flat-square) | `/menuItems/:id` | 메뉴 항목 삭제 |

### 주문
| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/orders` | 모든 주문 조회 |
| ![POST](https://img.shields.io/badge/POST-2196F3?style=flat-square) | `/orders` | 새 주문 생성 |

### 회원
| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/members?phone=<phone>` | 전화번호로 회원 조회 |
| ![POST](https://img.shields.io/badge/POST-2196F3?style=flat-square) | `/members` | 새 회원 생성 |
| ![PATCH](https://img.shields.io/badge/PATCH-9C27B0?style=flat-square) | `/members/:id` | 회원 정보 수정 (포인트 등) |

### 결제 & 쿠폰
| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/paymentMethods` | 결제 수단 목록 조회 |
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/coupons?code=<code>` | 쿠폰 유효성 검사 |

## 다국어 지원

![Korean](https://img.shields.io/badge/한국어-기본-E63946?style=flat-square)
![English](https://img.shields.io/badge/English-지원-4FC08D?style=flat-square)

### 설정

```javascript
// src/locales/i18n.js
- 기본 언어: 'ko' (한국어)
- 대체 언어: 'ko'
- 전역 주입 활성화
```

### 컴포넌트에서 사용법

```vue
<template>
  <p>{{ $t('common.confirm') }}</p>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
```

### 언어 전환기

`LanguageSwitcher` 컴포넌트는 애플리케이션 전체에서 한국어와 영어 간 전환 기능을 제공합니다.

## 개발

### 권장 IDE 설정

[![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![Vue Official](https://img.shields.io/badge/Vue_Official_확장-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### 브라우저 개발 도구

[![Chrome](https://img.shields.io/badge/Vue_DevTools-Chrome-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
[![Firefox](https://img.shields.io/badge/Vue_DevTools-Firefox-FF7139?style=for-the-badge&logo=firefox&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### 환경 변수

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_API_URL=http://localhost:3000
```

### CSS 아키텍처

이 프로젝트는 테마용 CSS 변수를 사용합니다:

```css
:root {
  --color-primary: #E63946;    /* 브랜드 레드 */
  --color-secondary: #F4A261;  /* 액센트 오렌지 */
  --color-background: #F1FAEE; /* 크림 배경 */
  --color-text: #1D3557;       /* 네이비 텍스트 */
  --color-accent: #457B9D;     /* 틸 액센트 */
}
```

### 데이터 모델

**MenuItem (메뉴 항목)**
```javascript
{
  id: number,
  name: { ko: string, en: string },
  price: number,
  image: string,
  description: { ko: string, en: string },
  category: string,
  stock: number,
  options: Option[]
}
```

**Order (주문)**
```javascript
{
  orderNumber: string,
  paymentMethod: string,
  items: OrderItem[],
  totalPrice: number,
  timestamp: string
}
```

## 라이선스

이 프로젝트는 비공개이며 공개 배포용으로 라이선스되지 않았습니다.

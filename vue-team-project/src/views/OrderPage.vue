<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import MenuInfoModal from '../components/MenuInfoModal.vue'
import { api } from '../services/api'
import { useOrderStore } from '../stores/orderStore'

const router = useRouter()
const orderStore = useOrderStore()

// Data fetched from JSON Server
const categories = ref([])
const menuItems = ref([])
const activeCategory = ref('pizza')
const isLoading = ref(true)

const recommendations = ref([])
const recommendedItem = ref(null)
const showRecommendation = ref(false)

// Fetch data on component mount
onMounted(async () => {
  try {
    // 필수 데이터와 선택적 데이터를 분리하여 시도
    const [categoriesData, menuItemsData] = await Promise.all([
      api.getCategories(),
      api.getMenuItems()
    ])
    categories.value = categoriesData
    menuItems.value = menuItemsData
    
    if (categoriesData.length > 0) {
      activeCategory.value = categoriesData[0].id
    }

    // 추천 데이터는 실패하더라도 메뉴 표시에 지장이 없도록 별도 처리
    try {
      recommendations.value = await api.getRecommendations()
    } catch (recError) {
      console.warn('Failed to fetch recommendations:', recError)
      recommendations.value = []
    }
  } catch (error) {
    console.error('Failed to fetch primary data:', error)
  } finally {
    isLoading.value = false
  }
})

// 장바구니 감시하여 추천 팝업 띄우기
watch(() => orderStore.orderList, (newList, oldList) => {
  if (newList.length > oldList.length) {
    const lastAdded = newList[newList.length - 1]
    const baseId = lastAdded.id.split('_')[0]
    
    // 해당 아이템이 트리거하는 추천 중 아직 장바구니에 없는 첫 번째 항목 찾기
    const rec = recommendations.value.find(r =>
      r.triggerId === baseId &&
      !newList.some(item => item.id.startsWith(r.targetId))
    )

    if (rec) {
      recommendedItem.value = rec
      showRecommendation.value = true
      setTimeout(() => {
        showRecommendation.value = false
      }, 5000)
    }
  }
}, { deep: true })

// 장바구니 헤더용 카테고리 기반 동적 추천
const headerRecommendations = computed(() => {
  const orderListItems = orderStore.orderList;
  if (orderListItems.length === 0) return { category: '', menuName: '', list: [] };

  // 1. 최신 추가된 아이템 파악
  const lastItem = orderListItems[orderListItems.length - 1];
  const lastCategory = lastItem.category;
  const lastMenuName = lastItem.name.split(' (')[0]; // 옵션 제외 이름

  // 2. 현재 장바구니에 담긴 모든 아이템의 베이스 ID (중복 제거용)
  const cartBaseIds = new Set(orderListItems.map(item => item.id.split('_')[0]));

  // 3. 해당 카테고리에 매핑된 추천 항목 필터링
  // - triggerCategory가 일치하고
  // - targetId가 현재 장바구니에 아직 없으며
  // - menuItems에 실제로 존재하는 상품인 경우에만 추천
  const list = recommendations.value.filter(rec => 
    rec.triggerCategory === lastCategory && 
    !cartBaseIds.has(rec.targetId) &&
    menuItems.value.some(m => m.id === rec.targetId)
  );

  return {
    category: lastCategory,
    menuName: lastMenuName,
    list: list
  };
})

// Pagination
const currentPage = ref(0)
const itemsPerPage = 6

const filteredMenuItems = computed(() => {
  return menuItems.value.filter(item => item.category === activeCategory.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredMenuItems.value.length / itemsPerPage)
})

const paginatedMenuItems = computed(() => {
  const start = currentPage.value * itemsPerPage
  const end = start + itemsPerPage
  return filteredMenuItems.value.slice(start, end)
})

const selectCategory = (categoryId) => {
  activeCategory.value = categoryId
  currentPage.value = 0
}

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
}

// Order list from store (shared state)
const orderList = computed(() => orderStore.orderList)
const totalPrice = computed(() => orderStore.calculatedTotalPrice)
const totalCalories = computed(() => {
  return orderStore.orderList.reduce((sum, item) => sum + ((item.calories || 0) * item.quantity), 0)
})

// Modal state
const isModalOpen = ref(false)
const selectedMenu = ref(null)

const openMenuModal = (menu) => {
  if (menu.isCombo) {
    orderStore.addCombo(menu)
    return
  }
  selectedMenu.value = menu
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedMenu.value = null
}

const addToOrder = (orderData) => {
  const optionLabels = [];
  let optionsPriceSum = 0;
  
  if (orderData.selectedOptions && orderData.options) {
    Object.entries(orderData.selectedOptions).forEach(([groupName, value]) => {
      const optionGroup = orderData.options.find(opt => opt.name === groupName);
      if (!optionGroup) return;
      if (Array.isArray(value)) {
        value.forEach(label => {
          optionLabels.push(label);
          const choice = optionGroup.choices.find(c => c.label === label);
          if (choice) optionsPriceSum += choice.price;
        });
      } else {
        optionLabels.push(value);
        const choice = optionGroup.choices.find(c => c.label === value);
        if (choice) optionsPriceSum += choice.price;
      }
    });
  }
  const optionString = optionLabels.length > 0 ? ` (${optionLabels.join(', ')})` : '';
  
  const processedItem = {
    ...orderData,
    id: `${orderData.id}_${JSON.stringify(orderData.selectedOptions)}`,
    name: `${orderData.name}${optionString}`,
    price: orderData.price + optionsPriceSum,
    quantity: orderData.quantity
  };
  orderStore.addItem(processedItem);
};

const increaseItemQuantity = (item) => {
  orderStore.updateQuantity(item.id, item.quantity + 1);
};

const decreaseItemQuantity = (item) => {
  if (item.quantity > 1) {
    orderStore.updateQuantity(item.id, item.quantity - 1);
  }
};

const removeItem = (itemId) => {
  orderStore.removeItem(itemId);
};

const handleCancel = () => {
  router.push('/')
}

const handlePay = () => {
  router.push('/payment-method')
}

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

const addRecommendedItem = (recItem = null) => {
  const itemToUse = recItem || recommendedItem.value
  if (!itemToUse) return

  const targetMenu = menuItems.value.find(m => m.id === itemToUse.targetId)
  if (targetMenu) {
    addToOrder({
      ...targetMenu,
      quantity: 1,
      selectedOptions: {}
    })
    if (!recItem) showRecommendation.value = false
  }
}
</script>

<template>
  <div class="order-page">
    <!-- Header with Logo -->
    <header class="order-header">
      <div class="logo">
        <span class="logo-text">KIOSK</span>
      </div>
    </header>

    <!-- Category Navigation -->
    <nav class="category-nav">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="['category-btn', { active: activeCategory === category.id }]"
        @click="selectCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </nav>

    <!-- Menu Grid -->
    <section class="menu-section">
      <div class="menu-grid">
        <button
          v-for="menu in paginatedMenuItems"
          :key="menu.id"
          class="menu-card"
          @click="openMenuModal(menu)"
        >
          <div class="menu-card-image">
            <img v-if="menu.image" :src="menu.image" :alt="menu.name" class="menu-img" />
            <span v-else class="menu-placeholder-icon">{{ getCategoryIcon(menu.category) }}</span>
          </div>
          <div class="menu-card-info">
            <p class="menu-card-name">{{ menu.name }}</p>
            <p class="menu-card-price">{{ menu.price.toLocaleString() }}원</p>
          </div>
        </button>

        <!-- Empty slots to maintain grid -->
        <div
          v-for="n in (itemsPerPage - paginatedMenuItems.length)"
          :key="'empty-' + n"
          class="menu-card empty"
        ></div>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button
          class="page-btn prev"
          :disabled="currentPage === 0"
          @click="prevPage"
        >
          이전
        </button>

        <div class="page-dots">
          <span
            v-for="(page, index) in totalPages"
            :key="index"
            :class="['dot', { active: currentPage === index }]"
            @click="currentPage = index"
          ></span>
        </div>

        <button
          class="page-btn next"
          :disabled="currentPage >= totalPages - 1"
          @click="nextPage"
        >
          다음
        </button>
      </div>
    </section>

    <!-- Order List -->
    <section class="order-list-section">
      <div class="order-list-header">
        <span class="header-name">메뉴명</span>
        <span class="header-qty">수량</span>
        <span class="header-price">가격</span>
      </div>

      <!-- Header Recommendations (Chips) -->
      <transition name="slide-down">
        <div v-if="headerRecommendations.list.length > 0" class="header-recommendations">
          <span class="header-rec-title">
            {{ getCategoryIcon(headerRecommendations.category) }} 
            <span class="highlight-menu">{{ headerRecommendations.menuName }}</span>와(과) 잘 어울려요!
          </span>
          <div class="header-rec-chips">
            <button
              v-for="rec in headerRecommendations.list"
              :key="rec.targetId"
              class="header-rec-chip"
              @click="addRecommendedItem(rec)"
            >
              + {{ rec.targetName }} <span class="chip-price">{{ rec.targetPrice.toLocaleString() }}원</span>
            </button>
          </div>
        </div>
      </transition>

      <div class="order-list-body">
        <div
          v-for="item in orderList"
          :key="item.id"
          class="order-item"
        >
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <button class="remove-btn" @click="removeItem(item.id)">✕</button>
          </div>
          
          <div class="item-controls">
            <button class="qty-btn" @click="increaseItemQuantity(item)">+</button>
            <span class="qty-val">{{ item.quantity }}</span>
            <button class="qty-btn" @click="decreaseItemQuantity(item)">-</button>
          </div>
  
          <span class="item-price">{{ (item.price * item.quantity).toLocaleString() }}원</span>
        </div>

        <div v-if="orderList.length === 0" class="empty-order">
          주문 내역이 없습니다
        </div>
      </div>
    </section>

    <!-- Bottom Action Bar (Reverted) -->
    <footer class="action-bar">
      <div class="total-price">
        <span class="total-label">주문 금액</span>
        <span class="total-value">{{ totalPrice.toLocaleString() }}원</span>
      </div>

      <div class="action-buttons">
        <button class="action-btn cancel" @click="handleCancel">
          취소
        </button>
        <button
          class="action-btn pay"
          :disabled="orderList.length === 0"
          @click="handlePay"
        >
          결제
        </button>
      </div>
    </footer>

    <!-- Menu Info Modal -->
    <MenuInfoModal
      v-if="selectedMenu"
      :menu="selectedMenu"
      :isOpen="isModalOpen"
      @close="closeModal"
      @add="addToOrder"
    />

    <!-- Honey Recommendation Popup -->
    <transition name="slide-fade">
      <div v-if="showRecommendation" class="recommendation-popup">
        <div class="rec-content">
          <span class="rec-icon">💡</span>
          <div class="rec-text">
            <p class="rec-message">{{ recommendedItem.message }}</p>
            <p class="rec-details">{{ recommendedItem.targetName }} (+{{ recommendedItem.targetPrice.toLocaleString() }}원)</p>
          </div>
          <button class="add-rec-btn" @click="addRecommendedItem">추가하기</button>
          <button class="close-rec-btn" @click="showRecommendation = false">✕</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.order-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Header */
.order-header {
  padding: 16px 20px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-blue);
  background-color: var(--primary-blue);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}

/* Category Navigation */
.category-nav {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background-color: var(--primary-orange);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.category-btn {
  flex-shrink: 0;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn.active {
  background-color: white;
  color: var(--primary-orange);
}

.category-btn:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.5);
}

/* Menu Section */
.menu-section {
  flex: 1;
  padding: 16px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.menu-card {
  background-color: var(--primary-blue);
  border: none;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu-card.empty {
  background-color: transparent;
  cursor: default;
}

.menu-card.empty:hover {
  transform: none;
  box-shadow: none;
}

.menu-card-image {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
}

.menu-placeholder-icon {
  font-size: 36px;
}

.menu-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-card-info {
  padding: 10px;
  color: white;
}

.menu-card-name {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-card-price {
  font-size: 12px;
  opacity: 0.9;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.page-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-blue);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background-color: var(--primary-blue-dark);
}

.page-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ccc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dot.active {
  background-color: var(--text-dark);
}

/* Order List Section (Reverted) */
.order-list-section {
  background-color: white;
  border-top: 2px solid #e0e0e0;
}

.order-list-header {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr;
  padding: 12px 16px;
  background-color: var(--primary-orange);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.header-recommendations {
  background-color: #fff3e0;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #ffe0b2;
  overflow: hidden;
}

.header-rec-title {
  font-size: 13px;
  font-weight: 700;
  color: #5d4037;
  white-space: nowrap;
}

.highlight-menu {
  color: var(--primary-orange);
}

.header-rec-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 2px 0;
}

.header-rec-chip {
  background-color: white;
  border: 1.5px solid #ffcc80;
  color: #e65100;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header-rec-chip:hover {
  background-color: #fff3e0;
  border-color: var(--primary-orange);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.chip-price {
  font-weight: 400;
}

.order-list-header .header-name {
  text-align: left;
}

.order-list-header .header-qty {
  text-align: center;
}

.order-list-header .header-price {
  text-align: center;
}

.order-list-body {
  max-height: 200px;
  overflow-y: auto;
}

.order-item {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  align-items: center;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-name {
  font-weight: 500;
}

.remove-btn {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
}

.item-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.qty-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-val {
  font-weight: 600;
  color: var(--primary-blue);
}

.item-price {
  text-align: center;
  font-weight: 600;
}

.empty-order {
  padding: 24px;
  text-align: center;
  color: #999;
}

/* Action Bar (Reverted) */
.action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: white;
  border-top: 2px solid #e0e0e0;
}

.total-price {
  flex: 1;
  padding: 12px 16px;
  background-color: var(--primary-orange);
  border-radius: 8px;
  color: white;
}

.total-label {
  display: block;
  font-size: 12px;
  opacity: 0.9;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 16px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.cancel {
  background-color: var(--primary-orange);
  color: white;
}

.action-btn.pay {
  background-color: #4caf50; /* Green fallback */
  color: white;
}

.action-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 480px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-btn {
    padding: 8px 14px;
    font-size: 12px;
  }

  .action-bar {
    flex-direction: column;
    gap: 12px;
  }

  .total-price {
    width: 100%;
    text-align: center;
  }

  .action-buttons {
    width: 100%;
  }

  .action-btn {
    flex: 1;
  }
}

/* CSS for Recommendation Popup */
.recommendation-popup {
  position: fixed;
  bottom: 180px;
  left: 20px;
  right: 20px;
  background-color: #333;
  color: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
}

.rec-content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.rec-icon {
  font-size: 24px;
}

.rec-text {
  flex: 1;
}

.rec-message {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.rec-details {
  font-size: 12px;
  color: #bbb;
}

.add-rec-btn {
  background-color: var(--primary-orange);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.close-rec-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

/* Slide-fade transition */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Slide-down transition for header recommendations */
.slide-down-enter-active {
  transition: all 0.3s ease-out;
}

.slide-down-leave-active {
  transition: all 0.2s ease-in;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-10px);
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
  opacity: 1;
  max-height: 60px; /* Approximate height */
}
</style>

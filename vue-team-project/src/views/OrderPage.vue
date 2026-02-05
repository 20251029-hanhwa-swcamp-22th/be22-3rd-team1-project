<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MenuInfoModal from '../components/MenuInfoModal.vue'
import { api } from '../services/api'
import { useOrderStore } from '../stores/orderStore'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const { t, locale } = useI18n()

const router = useRouter()
const orderStore = useOrderStore()

// Data fetched from JSON Server
const categories = ref([])
const menuItems = ref([])
const combinations = ref([])
const activeCategory = ref('pizza')
const isLoading = ref(true)
const upsellItems = ref([]) // Stores complementary items to recommend

// Fetch data on component mount
onMounted(async () => {
  try {
    const [categoriesData, menuItemsData, combinationsData] = await Promise.all([
      api.getCategories(),
      api.getMenuItems(),
      api.getCombinations()
    ])
    categories.value = categoriesData
    menuItems.value = menuItemsData
    combinations.value = combinationsData
    if (categoriesData.length > 0) {
      activeCategory.value = categoriesData[0].id
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    isLoading.value = false
  }
})

// Pagination
const currentPage = ref(0)
const itemsPerPage = 6

const filteredMenuItems = computed(() => {
  return menuItems.value.filter(item => item.category === activeCategory.value)
})

const activeCombinations = computed(() => {
  return combinations.value.filter(combo => combo.category === activeCategory.value)
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
  upsellItems.value = [] // Reset upsell when changing category
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

// Modal state
const isModalOpen = ref(false)
const selectedMenu = ref(null)

const openMenuModal = (menu) => {
  // 품절된 메뉴는 모달을 열지 않음
  if (menu.isSoldOut) return
  // 재고가 0 이하인 경우도 열지 않음 (이중 체크)
  if (menu.stock !== undefined && menu.stock <= 0) return

  selectedMenu.value = menu
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedMenu.value = null
}

const addToOrder = (orderData) => {
  // 1. 옵션 문자열 생성 (예: "Large, Bacon")
  const optionLabelsKo = [];
  const optionLabelsEn = [];
  let optionsPriceSum = 0;

  if (orderData.selectedOptions && orderData.options) {
    Object.entries(orderData.selectedOptions).forEach(([groupName, value]) => {
      const optionGroup = orderData.options.find(opt => {
        const optNameKo = typeof opt.name === 'object' ? opt.name.ko : opt.name;
        return optNameKo === groupName || opt.name === groupName;
      });

      if (!optionGroup) return;

      if (Array.isArray(value)) {
        value.forEach(label => {
          // label is the localized label string passed from MenuInfoModal
          const choice = optionGroup.choices.find(c => {
            const choiceLabelKo = typeof c.label === 'object' ? c.label.ko : c.label;
            const choiceLabelEn = typeof c.label === 'object' ? c.label.en : '';
            return choiceLabelKo === label || choiceLabelEn === label || c.label === label;
          });

          if (choice) {
            optionsPriceSum += choice.price;
            optionLabelsKo.push(typeof choice.label === 'object' ? choice.label.ko : choice.label);
            optionLabelsEn.push(typeof choice.label === 'object' ? choice.label.en : choice.label);
          }
        });
      } else {
        const choice = optionGroup.choices.find(c => {
          const choiceLabelKo = typeof c.label === 'object' ? c.label.ko : c.label;
          const choiceLabelEn = typeof c.label === 'object' ? c.label.en : '';
          return choiceLabelKo === value || choiceLabelEn === value || c.label === value;
        });

        if (choice) {
          optionsPriceSum += choice.price;
          optionLabelsKo.push(typeof choice.label === 'object' ? choice.label.ko : choice.label);
          optionLabelsEn.push(typeof choice.label === 'object' ? choice.label.en : choice.label);
        }
      }
    });
  }

  const optionStringKo = optionLabelsKo.length > 0 ? ` (${optionLabelsKo.join(', ')})` : '';
  const optionStringEn = optionLabelsEn.length > 0 ? ` (${optionLabelsEn.join(', ')})` : '';

  // 2. 가공된 주문 데이터 준비
  const processedItem = {
    ...orderData,
    id: `${orderData.id}_${JSON.stringify(orderData.selectedOptions)}`,
    name: {
      ko: `${typeof orderData.name === 'object' ? orderData.name.ko : orderData.name}${optionStringKo}`,
      en: `${typeof orderData.name === 'object' ? orderData.name.en : orderData.name}${optionStringEn}`
    },
    price: orderData.price + optionsPriceSum,
    quantity: orderData.quantity
  };
  orderStore.addItem(processedItem);

  // Update Upsell Recommendations
  updateUpsellRecommendations(processedItem.id.split('_')[0]);
};


const updateUpsellRecommendations = (addedItemId) => {
  // item.id might contain options (id_options), split to get raw ID
  const rawId = addedItemId.toString().split('_')[0]; 
  const addedItem = menuItems.value.find(m => m.id === rawId);
  
  if (!addedItem) return;

  // Universal Upsell Map
  const categoryUpsellMap = {
    'pizza': '11',      // Cola
    'hamburger': '36',  // French Fries
    'sandwich': '11',   // Cola
    'side': '11',       // Cola
    'drink': '36',      // French Fries
    'dessert': '1'      // Pepperoni Pizza
  };

  const targetId = categoryUpsellMap[addedItem.category];
  
  if (targetId && targetId !== rawId) {
    const item = menuItems.value.find(m => m.id === targetId);
    if (item) {
      upsellItems.value = [{
        ...item,
        comboId: 'category_default'
      }];
    }
  } else {
    upsellItems.value = [];
  }
};

// 수량 증가
const increaseItemQuantity = (item) => {
  // 원본 메뉴 정보 찾기 (재고 확인용)
  // item.id는 옵션이 포함된 ID일 수 있으므로 원본 ID 추출
  const originalId = item.id.toString().split('_')[0]
  const originalMenu = menuItems.value.find(m => m.id === originalId)

  if (originalMenu && originalMenu.stock !== undefined) {
    if (item.quantity >= originalMenu.stock) {
      alert(t('order.low_stock_alert', { count: originalMenu.stock }))
      return
    }
  }

  orderStore.updateQuantity(item.id, item.quantity + 1);
};

// 수량 감소 (1 이하로 내려가지 않게 처리)
const decreaseItemQuantity = (item) => {
  if (item.quantity > 1) {
    orderStore.updateQuantity(item.id, item.quantity - 1);
  } else {
    // 수량이 1일 때 마이너스를 누르면 삭제할지 물어보거나 무시
    // if (confirm('해당 메뉴를 삭제하시겠습니까?')) {
    //   orderStore.removeItem(item.id);
    // }
  }
};
// 항목 삭제
const removeItem = (itemId) => {
  orderStore.removeItem(itemId);
  upsellItems.value = [];
};

// Add Combo Items
const addComboToOrder = (combo) => {
  // Directly add items without confirmation
  combo.items.forEach(itemId => {
    const menuItem = menuItems.value.find(item => item.id === itemId)
    if (menuItem) {
      // Handle required options (default to first choice if required)
      let finalPrice = menuItem.price
      let selectedOptions = {}
      let optionLabelsKo = []
      let optionLabelsEn = []

      if (menuItem.options) {
        menuItem.options.forEach(opt => {
          if (opt.required && opt.choices && opt.choices.length > 0) {
            const defaultChoice = opt.choices[0]
            
            const optNameKo = typeof opt.name === 'object' ? opt.name.ko : opt.name
            const choiceLabel = typeof defaultChoice.label === 'object' ? defaultChoice.label.ko : defaultChoice.label
            
            selectedOptions[optNameKo] = choiceLabel
            finalPrice += defaultChoice.price
            
            optionLabelsKo.push(typeof defaultChoice.label === 'object' ? defaultChoice.label.ko : defaultChoice.label)
            optionLabelsEn.push(typeof defaultChoice.label === 'object' ? defaultChoice.label.en : defaultChoice.label)
          }
        })
      }

      const optionStringKo = optionLabelsKo.length > 0 ? ` (${optionLabelsKo.join(', ')})` : ''
      const optionStringEn = optionLabelsEn.length > 0 ? ` (${optionLabelsEn.join(', ')})` : ''

      const processedItem = {
        id: `${menuItem.id}_${JSON.stringify(selectedOptions)}`,
        name: {
          ko: `${typeof menuItem.name === 'object' ? menuItem.name.ko : menuItem.name}${optionStringKo}`,
          en: `${typeof menuItem.name === 'object' ? menuItem.name.en : menuItem.name}${optionStringEn}`
        },
        price: finalPrice,
        quantity: 1,
        image: menuItem.image
      }
      orderStore.addItem(processedItem)
    }
  })
}

// Add Upsell Item directly
const addUpsellItem = (item) => {
  // Use the same adding logic but for a single item
  // Default options are applied
  let finalPrice = item.price
  let selectedOptions = {}
  let optionLabelsKo = []
  let optionLabelsEn = []

  if (item.options) {
    item.options.forEach(opt => {
      if (opt.required && opt.choices && opt.choices.length > 0) {
        const defaultChoice = opt.choices[0]

        const optNameKo = typeof opt.name === 'object' ? opt.name.ko : opt.name
        const choiceLabel = typeof defaultChoice.label === 'object' ? defaultChoice.label.ko : defaultChoice.label

        selectedOptions[optNameKo] = choiceLabel
        finalPrice += defaultChoice.price

        optionLabelsKo.push(typeof defaultChoice.label === 'object' ? defaultChoice.label.ko : defaultChoice.label)
        optionLabelsEn.push(typeof defaultChoice.label === 'object' ? defaultChoice.label.en : defaultChoice.label)
      }
    })
  }

  const optionStringKo = optionLabelsKo.length > 0 ? ` (${optionLabelsKo.join(', ')})` : ''
  const optionStringEn = optionLabelsEn.length > 0 ? ` (${optionLabelsEn.join(', ')})` : ''

  const processedItem = {
    id: `${item.id}_${JSON.stringify(selectedOptions)}`,
    name: {
      ko: `${typeof item.name === 'object' ? item.name.ko : item.name}${optionStringKo}`,
      en: `${typeof item.name === 'object' ? item.name.en : item.name}${optionStringEn}`
    },
    price: finalPrice,
    quantity: 1,
    image: item.image
  }

  orderStore.addItem(processedItem)
  // Clear upsell or update again?
  // Maybe keep showing or find upsell for THIS item?
  // Let's reset to avoid infinite chain or keep it?
  // User request "When menu is added... show X".
  // If I add Cola, do I want upsell for Cola? Maybe not.
  upsellItems.value = []
}

// Navigation
const handleCancel = () => {
  router.push({name:'Main'})
}

const handlePay = () => {
  router.push({name:'PaymentMethod'})
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
</script>

<template>
  <div class="order-page">
    <LanguageSwitcher />
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
        {{ category.name[locale] || category.name }}
      </button>
    </nav>

    <!-- Menu Grid -->
    <section class="menu-section">
      <div class="menu-grid">
        <button
            v-for="menu in paginatedMenuItems"
            :key="menu.id"
            class="menu-card"
            :class="{ 'sold-out': (menu.isSoldOut || (menu.stock !== undefined && menu.stock <= 0)) }"
            :disabled="menu.isSoldOut || (menu.stock !== undefined && menu.stock <= 0)"
            @click="openMenuModal(menu)"
        >
          <div class="menu-card-image">
            <img v-if="menu.image || menu.imageUrl" :src="menu.image || menu.imageUrl" :alt="menu.name" class="menu-img" />
            <span v-else class="menu-placeholder-icon">{{ getCategoryIcon(menu.category) }}</span>

            <!-- 품절 오버레이 -->
            <div v-if="menu.isSoldOut || (menu.stock !== undefined && menu.stock <= 0)" class="sold-out-overlay">
              <span>{{ $t('order.sold_out') }}</span>
            </div>
          </div>
          <div class="menu-card-info">
            <p class="menu-card-name">{{ menu.name[locale] || menu.name }}</p>
            <p class="menu-card-price">{{ menu.price.toLocaleString() }} {{ $t('common.won') }}</p>
            <p v-if="menu.stock !== undefined && menu.stock <= 5 && menu.stock > 0" class="stock-warning">
              {{ $t('order.stock_warning', { count: menu.stock }) }}
            </p>
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
          {{ $t('common.back') }}
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
          {{ $t('common.next') }}
        </button>
      </div>
    </section>

    <!-- Order List -->
    <section class="order-list-section">
      <div class="order-list-header">
        <span class="header-name">{{ $t('order.menu_name') }}</span>
        <span class="header-qty">{{ $t('order.quantity') }}</span>
        <span class="header-price">{{ $t('order.price') }}</span>
      </div>

      <!-- Honey Combination Recommendation -->
      <!-- Honey Combination Recommendation (Context Aware) -->
      <div v-if="upsellItems.length > 0" class="honey-combo-section">
        <div class="honey-combo-title">
          <span>🍯 {{ $t('order.honey_combo') || 'Honey Combo' }}</span>
        </div>

        <!-- Upsell Mode: Show explicit items (e.g. + Cola) -->
        <div class="honey-combo-list upsell-mode">
          <div v-for="item in upsellItems" :key="item.id" class="honey-combo-item upsell-item" @click="addUpsellItem(item)">
            <div class="combo-info">
              <!-- Shows "+ Cola (2000won)" -->
              <span class="combo-name">+ {{ item.name[locale] || item.name }} ({{ item.price.toLocaleString() }}{{ $t('common.won') }})</span>
            </div>
            <button class="combo-add-btn">
              {{ $t('common.add') || 'Add' }}
            </button>
          </div>
        </div>
      </div>

      <div class="order-list-body">
        <div
            v-for="item in orderList"
            :key="item.id"
            class="order-item"
        >
          <div class="item-info">
            <span class="item-name">{{ item.name[locale] || item.name }}</span>
            <button class="remove-btn" @click="removeItem(item.id)">✕</button>
          </div>

          <div class="item-controls">
            <button class="qty-btn" @click="increaseItemQuantity(item)">+</button>
            <span class="item-qty">{{ item.quantity }}</span>
            <button class="qty-btn" @click="decreaseItemQuantity(item)">-</button>
          </div>

          <span class="item-price">{{ (item.price * item.quantity).toLocaleString() }}{{ $t('common.won') }}</span>
        </div>

        <div v-if="orderList.length === 0" class="empty-order">
          {{ $t('order.empty_cart') }}
        </div>
      </div>
    </section>

    <!-- Bottom Action Bar -->
    <footer class="action-bar">
      <div class="total-price">
        <span class="total-label">{{ $t('order.total_items_price') }}</span>
        <span class="total-value">{{ totalPrice.toLocaleString() }}{{ $t('common.won') }}</span>
      </div>

      <div class="action-buttons">
        <button
            class="action-btn cancel"
            @click="handleCancel"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
            class="action-btn pay"
            :disabled="orderList.length === 0"
            @click="handlePay"
        >
          {{ $t('common.pay') }}
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
  font-weight: 800;
  color: var(--primary-red);
  background-color: var(--background-cream);
  padding: 8px 24px;
  border-radius: 12px;
  border: 1px solid var(--primary-red-dark);
  min-width: 160px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  letter-spacing: -0.5px;
}

/* Category Navigation */
.category-nav {
  display: flex;
  gap: 12px;
  padding: 12px 24px;
  background-color: var(--primary-red-dark);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 72px;
  align-items: center;
  justify-content: flex-start;
  box-shadow: var(--shadow-md);
}

.category-btn {
  padding: 10px 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 110px;
  height: 48px;
  white-space: nowrap;
}

.category-btn.active {
  background-color: var(--surface-white);
  color: var(--primary-red);
  border-color: var(--surface-white);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  padding: 12px;
  flex: 1;
}

.menu-card {
  background-color: var(--surface-white);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  box-shadow: var(--shadow-sm);
}

.menu-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary-red);
  box-shadow: 0 8px 20px rgba(230, 57, 70, 0.15);
}

.menu-card.empty {
  background-color: transparent;
  cursor: default;
}

.menu-card.empty:hover {
  transform: none;
  box-shadow: none;
}

.menu-card.sold-out {
  opacity: 0.7;
  cursor: not-allowed;
}

.menu-card-image {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff5f5;
  position: relative;
}

.menu-placeholder-icon {
  font-size: 36px;
}

.menu-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sold-out-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 18px;
  z-index: 10;
}

.menu-card-info {
  padding: 10px;
  color: black;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu-card-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  min-height: 40px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-card-price {
  font-size: 12px;
  min-height: 20px;
  opacity: 0.9;
  color : var(--primary-red);
}

.stock-warning {
  font-size: 12px;
  color: #d32f2f;
  font-weight: 800;
  margin-top: 6px;
  background-color: #ffebee;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  min-height: 60px;
}

.page-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-red);
  color: white;
  min-height: 40px;
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
  background-color: var(--primary-red-dark);
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

/* Order List Section */
.order-list-section {
  background-color: white;
  border-top: 2px solid #e0e0e0;
}

.order-list-header {
  display: grid;
  /* grid-template-columns: 2fr 1fr 1fr; */
  grid-template-columns: 2fr 1.2fr 1.2fr;
  padding: 12px 16px;
  background-color: var(--primary-orange);
  color: white;
  font-weight: 600;
  font-size: 14px;
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
  max-height: 120px;
  overflow-y: auto;
}

.order-item {
  display: grid;
  /* grid-template-columns: 2fr 1fr 1fr; */
  grid-template-columns: 2fr 1.2fr 1.2fr;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 500;
}

.item-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.remove-btn {
  background: none;
  border: none;
  color: #ff5252;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
}

.item-qty {
  color: var(--primary-red);
  font-weight: 600;
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

.item-price {
  color: var(--primary-red-dark);
  font-weight: 700;
}

.empty-order {
  padding: 24px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* Honey Combo Section */
.honey-combo-section {
  background-color: #fff8e1; /* Light yellow background */
  border-bottom: 1px solid #ffe082;
  padding: 10px 16px;
}

.honey-combo-title {
  font-size: 13px;
  font-weight: 800;
  color: #ff8f00;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.honey-combo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.honey-combo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ffe082;
  cursor: pointer;
  transition: all 0.2s;
}

.honey-combo-item.upsell-item {
  background-color: #fffde7;
  border: 2px dashed #ffb300;
  padding: 6px 12px;
}

.honey-combo-item:hover {
  background-color: #fff3e0;
  border-color: #ffb300;
  transform: translateY(-1px);
}

.combo-info {
  display: flex;
  flex-direction: column;
}

.upsell-item .combo-name {
  color: #ef6c00;
  font-size: 14px;
}

.combo-name {
  font-size: 13px;
  font-weight: 700;
  color: #5d4037;
}

.combo-desc {
  font-size: 11px;
  color: #8d6e63;
  margin-top: 2px;
}

.combo-add-btn {
  background-color: #ffb300;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

/* Action Bar */
.action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: white;
  border-top: 2px solid #e0e0e0;
}

.total-price {
  flex : 1;
  background-color: var(--primary-red);
  border-radius: 12px;
  color: white;
  min-width: 150px;
  min-height: 72px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px 20px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
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
  min-width: 120px;
  min-height: 70px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.cancel {
  background-color: var(--background-light);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}

.action-btn.cancel:hover {
  background-color: #f1f3f5;
  color: var(--text-dark);
}

.action-btn.pay {
  background-color: var(--primary-red);
  color: white;
}

.action-btn.pay:hover {
  background-color: var(--primary-red-dark);
}

.action-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
</style>

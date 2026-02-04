<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../services/api'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const { t, locale } = useI18n()
const router = useRouter()

const orders = ref([])
const categories = ref([])
const menuItems = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

// 상세 정보를 볼 메뉴 선택 상태
const selectedMenuName = ref(null)

onMounted(async () => {
  await refreshData()
})

const refreshData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [ordersData, categoriesData, menuData] = await Promise.all([
      api.getSalesStatistics(),
      api.getCategories(),
      api.getMenuItems()
    ])
    orders.value = ordersData
    categories.value = categoriesData
    menuItems.value = menuData
  } catch (error) {
    console.error('Failed to fetch sales data:', error)
    errorMessage.value = t('sales.fetch_fail')
  } finally {
    isLoading.value = false
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? (category.name[locale.value] || category.name) : t('admin.unknown')
}

// 1. 총 매출
const totalSales = computed(() => {
  return orders.value.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
})

// 2. 카테고리별 매출
const salesByCategory = computed(() => {
  const stats = {}
  orders.value.forEach(order => {
    order.items.forEach(item => {
      const baseId = item.id.split('_')[0]
      const originalMenu = menuItems.value.find(m => m.id === baseId)
      const categoryId = originalMenu ? originalMenu.category : 'unknown'
      const categoryName = getCategoryName(categoryId)

      if (!stats[categoryName]) stats[categoryName] = 0
      stats[categoryName] += item.price * item.quantity
    })
  })
  return Object.entries(stats).sort(([, a], [, b]) => b - a)
})

// 3. 메뉴별 매출 (기본 이름 기준)
const salesByMenuItem = computed(() => {
  const stats = {}
  orders.value.forEach(order => {
    order.items.forEach(item => {
      let baseName = ''
      if (typeof item.name === 'object') {
        baseName = item.name[locale.value] || item.name['ko'] || 'Unknown'
      } else {
        baseName = item.name.split('(')[0].trim()
      }
      
      if (!stats[baseName]) stats[baseName] = 0
      stats[baseName] += item.price * item.quantity
    })
  })
  return Object.entries(stats).sort(([, a], [, b]) => b - a)
})

// 4. 전체 인기 사이즈 (모든 피자 대상)
const overallTopSizes = computed(() => {
  const stats = {}
  orders.value.forEach(order => {
    order.items.forEach(item => {
      const nameStr = typeof item.name === 'object' ? (item.name[locale.value] || item.name['ko'] || '') : item.name;
      const match = nameStr.match(/\(([^,)]+)/)
      if (match) {
        const size = match[1].trim()
        if (['Regular', 'Large'].includes(size)) {
          stats[size] = (stats[size] || 0) + item.quantity
        }
      }
    })
  })
  return Object.entries(stats).sort(([, a], [, b]) => b - a)
})

// 5. 전체 인기 토핑 (모든 피자 대상)
const overallTopAddOns = computed(() => {
  const stats = {}
  orders.value.forEach(order => {
    order.items.forEach(item => {
      const nameStr = typeof item.name === 'object' ? (item.name[locale.value] || item.name['ko'] || '') : item.name;
      const match = nameStr.match(/\(([^)]+)\)/)
      if (match) {
        const parts = match[1].split(',').map(p => p.trim())
        parts.slice(1).forEach(addOn => {
          if (addOn) {
            stats[addOn] = (stats[addOn] || 0) + item.quantity
          }
        })
      }
    })
  })
  return Object.entries(stats).sort(([, a], [, b]) => b - a)
})

// 6. 선택된 메뉴의 상세 옵션 통계
const selectedMenuDetails = computed(() => {
  if (!selectedMenuName.value) return null

  const sizeStats = {}
  const addOnStats = {}
  let totalCount = 0

  orders.value.forEach(order => {
    order.items.forEach(item => {
      let baseName = ''
      const nameStr = typeof item.name === 'object' ? (item.name[locale.value] || item.name['ko'] || '') : item.name
      
      if (typeof item.name === 'object') {
        baseName = nameStr.split('(')[0].trim()
      } else {
        baseName = item.name.split('(')[0].trim()
      }

      if (baseName === selectedMenuName.value) {
        totalCount += item.quantity
        const sizeMatch = nameStr.match(/\(([^,)]+)/)
        if (sizeMatch) {
          const size = sizeMatch[1].trim()
          if (['Regular', 'Large'].includes(size)) {
            sizeStats[size] = (sizeStats[size] || 0) + item.quantity
          }
        }
        const addOnMatch = nameStr.match(/\(([^)]+)\)/)
        if (addOnMatch) {
          const parts = addOnMatch[1].split(',').map(p => p.trim())
          parts.slice(1).forEach(addOn => {
            if (addOn) {
              addOnStats[addOn] = (addOnStats[addOn] || 0) + item.quantity
            }
          })
        }
      }
    })
  })

  return {
    name: selectedMenuName.value,
    totalCount,
    sizes: Object.entries(sizeStats).sort(([, a], [, b]) => b - a),
    addOns: Object.entries(addOnStats).sort(([, a], [, b]) => b - a)
  }
})

const selectMenu = (name) => {
  selectedMenuName.value = name
}

const goToDashboard = () => {
  router.push('/admin')
}
</script>

<template>
  <div class="admin-sales-stats">
    <header class="admin-header">
      <h1>{{ $t('sales.title') }}</h1>
      <div class="header-right">
        <LanguageSwitcher mode="inline" variant="dark" />
        <button @click="goToDashboard" class="back-btn">{{ $t('admin.back_to_dashboard') }}</button>
      </div>
    </header>

    <div class="content-area">
      <p v-if="errorMessage" class="error-message-banner">{{ errorMessage }}</p>

      <div v-if="isLoading" class="loading-spinner">{{ $t('sales.fetching_data') }}</div>
      <div v-else class="stats-container">

        <!-- 섹션 1: 요약 정보 -->
        <div class="stats-grid summary-section">
          <div class="stat-card total-sales">
            <h3>{{ $t('sales.total_sales') }}</h3>
            <p class="stat-value">{{ totalSales.toLocaleString() }}{{ $t('common.won') }}</p>
            <p class="stat-count">{{ $t('sales.total_orders', { count: orders.length }) }}</p>
          </div>
          <div class="stat-card">
            <h3>{{ $t('sales.category_sales') }}</h3>
            <ul>
              <li v-for="[category, sales] in salesByCategory" :key="category">
                <span>{{ category }}</span>
                <span>{{ sales.toLocaleString() }}{{ $t('common.won') }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 섹션 2: 전체 옵션 통계 (복구된 기능) -->
        <div class="stats-grid overall-options-section">
          <div class="stat-card">
            <h3>{{ $t('sales.top_sizes') }}</h3>
            <ul>
              <li v-for="[size, count] in overallTopSizes" :key="size">
                <span>{{ size }}</span>
                <span>{{ $t('sales.times_selected', { count: count }) }}</span>
              </li>
              <li v-if="overallTopSizes.length === 0" class="no-data">{{ $t('sales.no_data') }}</li>
            </ul>
          </div>

          <div class="stat-card">
            <h3>{{ $t('sales.top_addons') }}</h3>
            <ul>
              <li v-for="[addOn, count] in overallTopAddOns" :key="addOn">
                <span>{{ addOn }}</span>
                <span>{{ $t('sales.times_selected', { count: count }) }}</span>
              </li>
              <li v-if="overallTopAddOns.length === 0" class="no-data">{{ $t('sales.no_data') }}</li>
            </ul>
          </div>
        </div>

        <!-- 섹션 3: 메뉴별 상세 분석 -->
        <div class="stats-grid detail-analysis-section">
          <!-- 메뉴 목록 -->
          <div class="stat-card">
            <h3>{{ $t('sales.menu_sales_detail') }}</h3>
            <ul class="clickable-list">
              <li
                v-for="[menu, sales] in salesByMenuItem"
                :key="menu"
                :class="{ active: selectedMenuName === menu }"
                @click="selectMenu(menu)"
              >
                <span>{{ menu }}</span>
                <span>{{ sales.toLocaleString() }}{{ $t('common.won') }}</span>
              </li>
            </ul>
          </div>

          <!-- 선택 메뉴 상세 -->
          <div class="stat-card detail-card" v-if="selectedMenuName">
            <div class="detail-header">
              <h3>{{ $t('sales.option_analysis', { name: selectedMenuDetails.name }) }}</h3>
              <button class="close-detail" @click="selectedMenuName = null">×</button>
            </div>

            <div class="detail-content">
              <div class="detail-section">
                <h4>{{ $t('sales.size_ratio') }}</h4>
                <ul>
                  <li v-for="[size, count] in selectedMenuDetails.sizes" :key="size">
                    <span>{{ size }}</span>
                    <span>{{ $t('sales.ratio_format', { count: count, ratio: Math.round(count/selectedMenuDetails.totalCount * 100) }) }}</span>
                  </li>
                  <li v-if="selectedMenuDetails.sizes.length === 0" class="no-data">{{ $t('sales.no_info') }}</li>
                </ul>
              </div>

              <div class="detail-section">
                <h4>{{ $t('sales.popular_addons') }}</h4>
                <ul>
                  <li v-for="[addOn, count] in selectedMenuDetails.addOns" :key="addOn">
                    <span>{{ addOn }}</span>
                    <span>{{ $t('sales.times_selected', { count: count }) }}</span>
                  </li>
                  <li v-if="selectedMenuDetails.addOns.length === 0" class="no-data">{{ $t('sales.no_info') }}</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="stat-card info-card" v-else>
            <p v-html="$t('sales.select_menu_prompt').replace('\n', '<br>')"></p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-sales-stats {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
  color: #333;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: var(--primary-red-dark);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.back-btn {
  padding: 10px 24px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.content-area {
  flex: 1;
  padding: 20px 40px;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 25px;
  display: flex;
  flex-direction: column;
  min-height: 220px;
}

.stat-card h3 {
  color: var(--primary-red);
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--border-subtle);
  padding-bottom: 12px;
  margin-top: 0;
  letter-spacing: -0.5px;
}

.stat-card .stat-value {
  font-size: 40px;
  font-weight: 800;
  color: var(--primary-red-dark);
  margin-top: 12px;
  letter-spacing: -1px;
}

.stat-count {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.stat-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stat-card li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
  font-size: 15px;
  color: #555;
}

.stat-card li:last-child {
  border-bottom: none;
}

.stat-card li span:last-child {
  font-weight: 600;
  color: #333;
}

/* 클릭 가능한 목록 스타일 */
.clickable-list li {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 12px 10px;
  border-radius: 6px;
}

.clickable-list li:hover {
  background-color: #fff5f5;
}

.clickable-list li.active {
  background-color: var(--primary-red);
  color: white;
  box-shadow: var(--shadow-md);
}

.clickable-list li.active span:last-child {
  color: white;
}

/* 상세 카드 스타일 */
.detail-card {
  border: 1px solid var(--primary-red);
  background-color: #fff5f5;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.close-detail {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.detail-section h4 {
  font-size: 15px;
  margin: 15px 0 10px;
  color: #666;
  background-color: #f8f9fa;
  padding: 5px 10px;
  border-radius: 4px;
}

.info-card {
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #999;
  background-color: #f8f9fa;
  border: 2px dashed #ddd;
  box-shadow: none;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

.error-message-banner {
  color: #e74c3c;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.loading-spinner {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
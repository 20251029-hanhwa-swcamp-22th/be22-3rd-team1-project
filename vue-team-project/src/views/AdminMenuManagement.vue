<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../services/api'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const { t, locale } = useI18n()
const router = useRouter()

const menuItems = ref([])
const categories = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

// Modal state for Add/Edit
const isModalOpen = ref(false)
const editingMenu = ref(null) // null for add, object for edit
const newMenuItem = ref({
  name: { ko: '', en: '' },
  price: 0,
  description: { ko: '', en: '' }, // 설명 추가
  category: '', // category ID
  image: '',
  stock: 100, // 재고 수량 추가
  options: []
})

// Fetch data on component mount
onMounted(async () => {
  await refreshData()
})

const refreshData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [menuData, categoryData] = await Promise.all([
      api.getAdminMenuItems(),
      api.getCategories()
    ])
    menuItems.value = menuData
    categories.value = categoryData
  } catch (error) {
    console.error('Failed to fetch admin data:', error)
    errorMessage.value = t('admin.fetch_fail')
  } finally {
    isLoading.value = false
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? (category.name[locale.value] || category.name) : t('admin.unknown')
}

const openAddModal = () => {
  editingMenu.value = null
  newMenuItem.value = { 
    name: { ko: '', en: '' }, 
    price: 0, 
    description: { ko: '', en: '' },
    category: categories.value[0]?.id || '', 
    image: '',
    stock: 100,
    options: []
  }
  isModalOpen.value = true
}

const openEditModal = (menu) => {
  // Ensure name and description are objects
  const nameObj = typeof menu.name === 'string' ? { ko: menu.name, en: '' } : { ...menu.name }
  const descObj = typeof menu.description === 'string' ? { ko: menu.description, en: '' } : { ...menu.description }
  
  editingMenu.value = { ...menu, name: nameObj, description: descObj }
  
  // deep copy for nested options
  const copiedMenu = JSON.parse(JSON.stringify(editingMenu.value))
  
  // Normalize stock
  if (copiedMenu.stock === undefined) copiedMenu.stock = 100

  // Normalize options names and labels
  if (copiedMenu.options && Array.isArray(copiedMenu.options)) {
    copiedMenu.options = copiedMenu.options.map(opt => ({
      ...opt,
      name: typeof opt.name === 'string' ? { ko: opt.name, en: '' } : { ...opt.name },
      choices: (opt.choices || []).map(choice => ({
        ...choice,
        label: typeof choice.label === 'string' ? { ko: choice.label, en: '' } : { ...choice.label }
      }))
    }))
  } else {
    copiedMenu.options = []
  }
  
  newMenuItem.value = copiedMenu
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingMenu.value = null
  newMenuItem.value = { 
    id: '',
    name: { ko: '', en: '' }, 
    price: 0, 
    description: { ko: '', en: '' }, 
    category: '', 
    image: '', 
    stock: 100,
    options: [] 
  }
  errorMessage.value = '' 
}

const saveMenuItem = async () => {
  errorMessage.value = ''
  try {
    if (!newMenuItem.value.name.ko || !newMenuItem.value.name.en || !newMenuItem.value.price || !newMenuItem.value.category) {
      errorMessage.value = t('admin.fill_all_fields')
      return
    }

    if (editingMenu.value && editingMenu.value.id) {
      // Update existing item
      await api.updateMenuItem(editingMenu.value.id, newMenuItem.value)
      console.log('Menu item updated:', newMenuItem.value)
    } else {
      // Create new item
      // --- ID 생성 로직 추가 ---
      const maxId = menuItems.value.reduce((max, item) => Math.max(max, parseInt(item.id)), 0)
      newMenuItem.value.id = (maxId + 1).toString(); // JSON Server는 ID를 문자열로 저장하는 경향이 있으므로 toString()
      // -------------------------

      await api.createMenuItem(newMenuItem.value)
      console.log('Menu item created:', newMenuItem.value)
    }
    await refreshData()
    closeModal()
  } catch (error) {
    console.error('Failed to save menu item:', error)
    errorMessage.value = t('admin.save_fail')
  }
}

// --- Option Management Functions ---
const addOptionGroup = () => {
  newMenuItem.value.options.push({
    name: { ko: '', en: '' },
    required: false,
    multiple: false,
    choices: [{ label: { ko: '', en: '' }, price: 0 }]
  })
}

const removeOptionGroup = (index) => {
  newMenuItem.value.options.splice(index, 1)
}

const addChoice = (optionIndex) => {
  newMenuItem.value.options[optionIndex].choices.push({ label: { ko: '', en: '' }, price: 0 })
}

const removeChoice = (optionIndex, choiceIndex) => {
  newMenuItem.value.options[optionIndex].choices.splice(choiceIndex, 1)
}
// ------------------------------------

const deleteMenuItem = async (id) => {
  if (confirm(t('admin.delete_confirm'))) {
    try {
      await api.deleteMenuItem(id)
      console.log('Menu item deleted:', id)
      await refreshData()
    } catch (error) {
      console.error('Failed to delete menu item:', error)
      errorMessage.value = t('admin.delete_fail')
    }
  }
}

const goToDashboard = () => {
  router.push('/admin')
}
</script>

<template>
  <div class="admin-menu-management">
    <header class="admin-header">
      <h1>{{ $t('admin.menu_management') }}</h1>
      <div class="header-actions">
        <LanguageSwitcher mode="inline" variant="dark" />
        <button @click="goToDashboard" class="back-btn">{{ $t('admin.back_to_dashboard') }}</button>
        <button @click="openAddModal" class="add-btn">{{ $t('admin.add_new_menu') }}</button>
      </div>
    </header>

    <div class="content-area">
      <p v-if="errorMessage" class="error-message-banner">{{ errorMessage }}</p>

      <div v-if="isLoading" class="loading-spinner">{{ $t('admin.loading_menu') }}</div>
      <div v-else class="menu-table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 60px;">{{ $t('admin.id') }}</th>
              <th style="width: 150px;">{{ $t('admin.name') }}</th>
              <th style="width: 120px;">{{ $t('admin.price') }}</th>
              <th style="width: 100px;">{{ $t('admin.category') }}</th>
              <th style="width: 100px;">{{ $t('admin.stock') }}</th>
              <th style="width: 150px;">{{ $t('admin.option_settings') }}</th>
              <th style="width: 190px;">{{ $t('admin.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="menu in menuItems" :key="menu.id">
              <td>{{ menu.id }}</td>
              <td>{{ menu.name[locale] || menu.name }}</td>
              <td>{{ menu.price.toLocaleString() }}{{ $t('common.won') }}</td>
              <td>{{ getCategoryName(menu.category) }}</td>
              <td>
                <span :class="{'out-of-stock': menu.stock <= 0}">
                  {{ menu.stock !== undefined ? menu.stock : '-' }}{{ $t('common.unit_qty') }}
                  <span v-if="menu.stock <= 0">({{ $t('order.sold_out') }})</span>
                </span>
              </td>
              <td>
                <div v-if="menu.options && menu.options.length > 0" class="options-summary">
                  {{ $t('admin.options_count', { count: menu.options.length }) }}
                </div>
                <span v-else>-</span>
              </td>
              <td class="action-cell">
                <button @click="openEditModal(menu)" class="action-btn edit-btn">{{ $t('admin.edit') }}</button>
                <button @click="deleteMenuItem(menu.id)" class="action-btn delete-btn">{{ $t('admin.delete') }}</button>
              </td>
            </tr>
            <tr v-if="menuItems.length === 0">
              <td colspan="7" class="no-data">{{ $t('admin.no_menu_items') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Menu Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <h3>{{ editingMenu ? $t('admin.edit_menu') : $t('admin.new_menu') }}</h3>
          <form @submit.prevent="saveMenuItem">
            <div class="form-group-row">
              <div class="form-group flex-1">
                <label for="menuNameKo">{{ $t('admin.name') }} (KO):</label>
                <input type="text" id="menuNameKo" v-model="newMenuItem.name.ko" required />
              </div>
              <div class="form-group flex-1">
                <label for="menuNameEn">{{ $t('admin.name') }} (EN):</label>
                <input type="text" id="menuNameEn" v-model="newMenuItem.name.en" required />
              </div>
            </div>
            
            <div class="form-group-row">
              <div class="form-group flex-1">
                <label for="menuPrice">{{ $t('admin.price') }}:</label>
                <input type="number" id="menuPrice" v-model.number="newMenuItem.price" required min="0" />
              </div>
              <div class="form-group flex-1">
                <label for="menuStock">{{ $t('admin.stock') }}:</label>
                <input type="number" id="menuStock" v-model.number="newMenuItem.stock" required min="0" />
              </div>
            </div>

            <div class="form-group">
              <label for="menuCategory">{{ $t('admin.category') }}:</label>
              <select id="menuCategory" v-model="newMenuItem.category" required>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name[locale] || cat.name }}
                </option>
              </select>
            </div>
            <div class="form-group-row">
              <div class="form-group flex-1">
                <label for="menuDescriptionKo">{{ $t('admin.description') }} (KO):</label>
                <textarea id="menuDescriptionKo" v-model="newMenuItem.description.ko" rows="2"></textarea>
              </div>
              <div class="form-group flex-1">
                <label for="menuDescriptionEn">{{ $t('admin.description') }} (EN):</label>
                <textarea id="menuDescriptionEn" v-model="newMenuItem.description.en" rows="2"></textarea>
              </div>
            </div>
            <div class="form-group">
              <label for="menuImageUrl">{{ $t('admin.image_url') }}:</label>
              <input type="text" id="menuImageUrl" v-model="newMenuItem.image" placeholder="/src/assets/images/..." />
            </div>
  
            <!-- Options Section -->
            <div class="options-management">
              <div class="options-header">
                <h4>{{ $t('admin.option_settings') }}</h4>
                <button type="button" @click="addOptionGroup" class="small-add-btn">{{ $t('admin.add_group') }}</button>
              </div>
  
              <div v-for="(opt, optIdx) in newMenuItem.options" :key="optIdx" class="option-group-card">
                <div class="option-group-header">
                  <div class="opt-name-inputs">
                    <input type="text" v-model="opt.name.ko" placeholder="그룹명 (KO)" class="opt-name-input" />
                    <input type="text" v-model="opt.name.en" placeholder="Group Name (EN)" class="opt-name-input" />
                  </div>
                  <div class="opt-configs">
                    <label><input type="checkbox" v-model="opt.required" /> {{ $t('admin.required') }}</label>
                    <label><input type="checkbox" v-model="opt.multiple" /> {{ $t('admin.multiple') }}</label>
                  </div>
                  <button type="button" @click="removeOptionGroup(optIdx)" class="small-delete-btn">✕</button>
                </div>
  
                <div class="choices-list">
                  <div v-for="(choice, choiceIdx) in opt.choices" :key="choiceIdx" class="choice-row">
                    <input type="text" v-model="choice.label.ko" placeholder="라벨 (KO)" />
                    <input type="text" v-model="choice.label.en" placeholder="Label (EN)" />
                    <input type="number" v-model.number="choice.price" :placeholder="$t('admin.extra_price')" />
                    <button type="button" @click="removeChoice(optIdx, choiceIdx)" class="choice-delete-btn">✕</button>
                  </div>
                  <button type="button" @click="addChoice(optIdx)" class="choice-add-btn">{{ $t('admin.add_choice') }}</button>
                </div>
              </div>
            </div>
            <p v-if="errorMessage" class="error-message-modal">{{ errorMessage }}</p>
            <div class="modal-actions">
              <button type="submit" class="save-btn">{{ $t('admin.save') }}</button>
              <button type="button" @click="closeModal" class="cancel-btn">{{ $t('common.cancel') }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.admin-menu-management {
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

.admin-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn, .add-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 56px;
  min-width: 150px;
}

.back-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.add-btn {
  background-color: var(--surface-white);
  color: var(--primary-red);
  box-shadow: var(--shadow-sm);
}
.add-btn:hover {
  background-color: var(--background-cream);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.content-area {
  flex: 1;
  padding: 20px 40px;
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

.menu-table-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* 고정 레이아웃 사용 */
}

th, td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

td.action-cell {
  overflow: visible;
  white-space: normal;
}

th {
  background-color: var(--background-cream);
  color: var(--primary-red);
  font-weight: 800;
  border-bottom: 2px solid var(--border-subtle);
}

tr:hover {
  background-color: #f5f5f5;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 30px;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 5px;
  min-height: 40px;
  min-width: 70px;
}

.edit-btn {
  background-color: #fff5f5;
  color: var(--primary-red);
  border: 1px solid var(--primary-red);
}
.edit-btn:hover {
  background-color: var(--primary-red);
  color: white;
}

.delete-btn {
  background-color: #fff5f5;
  color: #dc3545;
  border: 1px solid #dc3545;
}
.delete-btn:hover {
  background-color: #dc3545;
  color: white;
}

.out-of-stock {
  color: #e74c3c;
  font-weight: bold;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
}

/* Options Management Styles */
.options-management {
  margin-top: 20px;
  border-top: 2px dashed #eee;
  padding-top: 20px;
}

.options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.options-header h4 {
  margin: 0;
  color: #444;
}

.small-add-btn {
  padding: 5px 10px;
  background-color: var(--primary-red);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.option-group-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
}

.option-group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.opt-name-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.opt-configs {
  display: flex;
  gap: 10px;
  font-size: 13px;
  white-space: nowrap;
}

.small-delete-btn {
  background: none;
  border: none;
  color: #ff5252;
  font-size: 18px;
  cursor: pointer;
}

.choices-list {
  padding-left: 20px;
}

.choice-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.choice-row input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
}

.choice-row input[type="text"] {
  flex: 2;
}

.choice-row input[type="number"] {
  flex: 1;
}

.choice-row>input:nth-of-type(3) {
  flex: 1;
  min-width: 100px;
}

.choice-delete-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
}

.choice-add-btn {
  background: none;
  border: 1px dashed #aaa;
  color: #777;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 5px;
}

/* Modal Actions and Base Styles */

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 32px;
  color: var(--primary-red);
  font-size: 28px;
  font-weight: 800;
  text-align: center;
  letter-spacing: -0.5px;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
}

.form-group-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.flex-1 {
  flex: 1;
  margin-bottom: 0 !important;
}

.opt-name-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.error-message-modal {
  color: #e74c3c;
  margin-top: 15px;
  text-align: center;
}

.modal-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-btn, .cancel-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-btn {
  background-color: var(--primary-red);
  color: white;
  box-shadow: var(--shadow-sm);
}
.save-btn:hover {
  background-color: var(--primary-red-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.cancel-btn {
  background-color: #ccc;
  color: #333;
}
.cancel-btn:hover {
  background-color: #bbb;
}
</style>
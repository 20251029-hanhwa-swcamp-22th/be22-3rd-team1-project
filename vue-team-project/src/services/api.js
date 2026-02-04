import axiosInstance from './axios'

export const api = {
  // ============ Menu & Categories ============

  async getCategories() {
    return axiosInstance.get('/categories')
  },

  async getMenuItems() {
    return axiosInstance.get('/menuItems')
  },

  async getMenuItemsByCategory(category) {
    return axiosInstance.get('/menuItems', {
      params: { category }
    })
  },

  // ============ Payment ============

  async getPaymentMethods() {
    return axiosInstance.get('/paymentMethods')
  },

  // ============ Orders ============

  async createOrder(orderData) {
    return axiosInstance.post('/orders', orderData)
  },

  async getOrders() {
    return axiosInstance.get('/orders')
  },

  // ============ Members ============

  async getMemberByPhone(phone) {
    return axiosInstance.get('/members', {
      params: { phone }
    })
  },

  async createMember(memberData) {
    return axiosInstance.post('/members', memberData)
  },

  async updateMember(memberData) {
    return axiosInstance.patch(`/members/${memberData.id}`, memberData)
  },

  // ============ Coupons ============

  async getCouponByCode(code) {
    return axiosInstance.get('/coupons', {
      params: { code }
    })
  },

  // ============ Admin APIs ============

  async adminLogin(credentials) {
    // Note: In production, use POST with credentials in "body"
    const users = await axiosInstance.get('/users', {
      params: {
        username: credentials.username,
        password: credentials.password
      }
    })

    if (users.length > 0) {
      return { success: true, user: users[0] }
    }
    return { success: false, message: 'Invalid credentials' }
  },

  async getAdminMenuItems() {
    return axiosInstance.get('/menuItems')
  },

  async createMenuItem(menuItemData) {
    return axiosInstance.post('/menuItems', menuItemData)
  },

  async updateMenuItem(id, menuItemData) {
    return axiosInstance.put(`/menuItems/${id}`, menuItemData)
  },

  // 재고 업데이트 함수 추가
  async updateMenuItemStock(id, newStock) {
    const response = await fetch(`${API_BASE_URL}/menuItems/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stock: newStock })
    })
    return response.json()
  },

  async deleteMenuItem(id) {
    return axiosInstance.delete(`/menuItems/${id}`)
  },

  async getSalesStatistics() {
    return axiosInstance.get('/orders')
  }
}

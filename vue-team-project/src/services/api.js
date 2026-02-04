const API_BASE_URL = 'http://localhost:3000'

export const api = {

  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`)
    return response.json()
  },

  async getMenuItems() {
    const response = await fetch(`${API_BASE_URL}/menuItems`)
    return response.json()
  },

  async getRecommendations() {
    const response = await fetch(`${API_BASE_URL}/recommendations`)
    return response.json()
  },

  async getMenuItemsByCategory(category) {
    const response = await fetch(`${API_BASE_URL}/menuItems?category=${category}`)
    return response.json()
  },

  async getPaymentMethods() {
    const response = await fetch(`${API_BASE_URL}/paymentMethods`)
    return response.json()
  },

  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })
    return response.json()
  },

  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`)
    return response.json()
  },

  async getMemberByPhone(phone) {
    const response = await fetch(`${API_BASE_URL}/members?phone=${phone}`)
    return response.json()
  },

  async getCouponByCode(code) {
    const response = await fetch(`${API_BASE_URL}/coupons?code=${code}`)
    return response.json()
  },

  async createMember(memberData) {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memberData)
    })
    return response.json()
  },

  // --- 관리자 모드 API 추가 ---

  async adminLogin(credentials) {
    // 실제 백엔드에서는 비밀번호를 해싱하여 비교해야 합니다.
    // JSON Server는 간단한 목업이므로, 여기서는 users 엔드포인트에서 사용자 정보를 가져와 비교합니다.
    const response = await fetch(`${API_BASE_URL}/users?username=${credentials.username}&password=${credentials.password}`)
    const users = await response.json()
    if (users.length > 0) {
      // 로그인 성공, 첫 번째 사용자 정보를 반환 (토큰 등 추가 가능)
      return { success: true, user: users[0] }
    } else {
      return { success: false, message: 'Invalid credentials' }
    }
  },

  async getAdminMenuItems() {
    // 관리자용 메뉴 목록 (필요하다면 일반 사용자용과 다르게 구현)
    const response = await fetch(`${API_BASE_URL}/menuItems`)
    return response.json()
  },

  async createMenuItem(menuItemData) {
    const response = await fetch(`${API_BASE_URL}/menuItems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(menuItemData)
    })
    return response.json()
  },

  async updateMember(memberData) {
    const response = await fetch(`${API_BASE_URL}/members/${memberData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memberData)
    })
    return response.json()
  },

  async updateMenuItem(id, menuItemData) {
    const response = await fetch(`${API_BASE_URL}/menuItems/${id}`, {
      method: 'PUT', // 또는 PATCH
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(menuItemData)
    })
    return response.json()
  },

  async deleteMenuItem(id) {
    const response = await fetch(`${API_BASE_URL}/menuItems/${id}`, {
      method: 'DELETE'
    })
    return response.json()
  },

  async getSalesStatistics() {
    // 모든 주문 데이터를 가져와서 클라이언트에서 통계 처리
    // 실제 백엔드에서는 서버에서 통계 데이터를 가공하여 제공하는 것이 효율적입니다.
    const response = await fetch(`${API_BASE_URL}/orders`)
    return response.json()
  }
}

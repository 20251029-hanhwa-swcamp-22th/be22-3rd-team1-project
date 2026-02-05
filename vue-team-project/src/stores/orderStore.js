import { defineStore } from 'pinia'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orderList: [],
    selectedPaymentMethod: null,
    currentMember: null,
    totalDiscount: 0,
    usedPoints: 0,
  }),

  getters: {
    calculatedTotalPrice: (state) => {
      return state.orderList.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }
  },

  actions: {
    addItem(item) {
      const existingIndex = this.orderList.findIndex(i => i.id === item.id)
      if (existingIndex >= 0) {
        this.orderList[existingIndex].quantity += item.quantity
      } else {
        this.orderList.push({ ...item })
      }
    },

    removeItem(itemId) {
      const index = this.orderList.findIndex(i => i.id === itemId)
      if (index >= 0) {
        this.orderList.splice(index, 1)
      }
    },

    updateQuantity(itemId, quantity) {
      const item = this.orderList.find(i => i.id === itemId)
      if (item) {
        item.quantity = quantity
      }
    },

    setPaymentMethod(method) {
      this.selectedPaymentMethod = method
    },

    setCurrentMember(member) {
      this.currentMember = member
    },

    setTotalDiscount(amount) {
      this.totalDiscount = amount
    },

    setUsedPoints(amount) {
      this.usedPoints = amount
    },

    addCombo(combo) {
      combo.items.forEach(item => {
        this.addItem({
          ...item,
          quantity: 1,
          selectedOptions: {},
          options: []
        })
      })
    },

    clearOrder() {
      this.orderList = []
      this.selectedPaymentMethod = null
      this.currentMember = null
      this.totalDiscount = 0
      this.usedPoints = 0
    }
  }


})

import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Main',
        component: () => import('@/views/MainPage.vue')
    },
    {
        path: '/order',
        name: 'Order',
        component: () => import('@/views/OrderPage.vue')
    },
    {
        path: '/payment-method',
        name: 'PaymentMethod',
        component: () => import('@/views/PaymentMethodPage.vue')
    },
    {
        path: '/payment-confirm',
        name: 'PaymentConfirm',
        component: () => import('@/views/PaymentConfirmPage.vue')
    },
    // --- 관리자 모드 라우트 ---
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: () => import('@/views/AdminLoginPage.vue')
    },
    {
        path: '/admin',
        name: 'AdminDashboard',
        component: () => import('@/views/AdminDashboard.vue')
        // meta: { requiresAuth: true, isAdmin: true } // 제어 방식은 추후 추가
    },
    {
        path: '/admin/menu',
        name: 'AdminMenuManagement',
        component: () => import('@/views/AdminMenuManagement.vue')
        // meta: { requiresAuth: true, isAdmin: true } // 제어 방식은 추후 추가
    },
    {
        path: '/admin/sales',
        name: 'AdminSalesStats',
        component: () => import('@/views/AdminSalesStats.vue')
        // meta: { requiresAuth: true, isAdmin: true } // 제어 방식은 추후 추가
    },
    {
        path: '/payment-process',
        name: 'PaymentProcess',
        component: () => import('@/views/PaymentProcessView.vue')
    },
    {
        path: '/payment-fail',
        name: 'PaymentFail',
        component: () => import('@/views/PaymentFailView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 라우트 가드는 추후 논의 후 추가
// router.beforeEach((to, from, next) => { /* ... */ })

export default router

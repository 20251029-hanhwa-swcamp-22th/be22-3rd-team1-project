import {createRouter, createWebHistory} from 'vue-router'
import MainPage from '../views/MainPage.vue'
import OrderPage from '../views/OrderPage.vue'
import PaymentMethodPage from '../views/PaymentMethodPage.vue'
import PaymentConfirmPage from '../views/PaymentConfirmPage.vue'

// --- 관리자 모드 관련 컴포넌트 추가 ---
import AdminLoginPage from '../views/AdminLoginPage.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminMenuManagement from '../views/AdminMenuManagement.vue'
import AdminSalesStats from '../views/AdminSalesStats.vue'
import PaymentProcessView from '../views/PaymentProcessView.vue'
import PaymentFailView from '../views/PaymentFailView.vue'

const routes = [
    {
        path: '/',
        name: 'Main',
        component: MainPage
    },
    {
        path: '/order',
        name: 'Order',
        component: OrderPage
    },
    {
        path: '/payment-method',
        name: 'PaymentMethod',
        component: PaymentMethodPage
    },
    {
        path: '/payment-confirm',
        name: 'PaymentConfirm',
        component: PaymentConfirmPage
    },
    // --- 관리자 모드 라우트 ---
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: AdminLoginPage
    },
    {
        path: '/admin',
        name: 'AdminDashboard',
        component: AdminDashboard,
        // meta: { requiresAuth: true, isAdmin: true } // 제어 방식은 추후 추가
    },
    {
        path: '/admin/menu',
        name: 'AdminMenuManagement',
        component: AdminMenuManagement,
        // meta: { requiresAuth: true, isAdmin: true } // 제어 방식은 추후 추가
    },
    {
        path: '/admin/sales',
        name: 'AdminSalesStats',
        component: AdminSalesStats,
        // meta: { requiresAuth: true, isAdmin: true } // 제어 방식은 추후 추가
    },

    { // PaymentProcessView 페이지 두개 추가
        path: '/payment-process',
        name: 'PaymentProcess',
        component: PaymentProcessView
    },
    {
        path: '/payment-fail',
        name: 'PaymentFail',
        component: PaymentFailView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 라우트 가드는 추후 논의 후 추가
// router.beforeEach((to, from, next) => { /* ... */ })

export default router

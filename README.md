# Kiosk Ordering System

A Vue 3-based self-service kiosk application for restaurant ordering with admin management capabilities. Built with modern frontend technologies and designed for bilingual (Korean/English) support.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Architecture Overview](#architecture-overview)
- [API Endpoints](#api-endpoints)
- [Internationalization](#internationalization)
- [Development](#development)

## Features

### Customer Features
- **Menu Browsing**: Browse menu items by category (Pizza, Hamburger, Drink, Sandwich, Side, Dessert)
- **Product Options**: Select size, toppings, and other customizations
- **Shopping Cart**: Add, remove, and modify order quantities
- **Payment Flow**: Multiple payment methods with discount/coupon support
- **Loyalty Program**: Member lookup, points accumulation, and redemption
- **Screensaver**: Auto-activating advertisement display after 5 minutes of inactivity

### Admin Features
- **Dashboard**: Overview of restaurant operations
- **Menu Management**: Full CRUD operations for menu items
- **Sales Analytics**: Category breakdown, top items, and trend analysis
- **Stock Management**: Track and update inventory levels

### Additional Features
- Bilingual support (Korean/English)
- Responsive design optimized for kiosk displays
- Real-time stock validation
- Virtual keypad for phone number input

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Vue 3 (Composition API) | ^3.5.27 |
| Build Tool | Vite | ^7.3.1 |
| State Management | Pinia | ^3.0.4 |
| Routing | Vue Router | ^4.6.4 |
| HTTP Client | Axios | ^1.13.4 |
| Internationalization | Vue I18n | ^11.2.8 |
| Mock API | JSON Server | ^1.0.0-beta.3 |
| Dev Tools | Vue DevTools | ^8.0.5 |

**Runtime Requirements:**
- Node.js ^20.19.0 or >=22.12.0

## Project Structure

```
vue-team-project/
├── public/
│   ├── advertisement/       # Screensaver images
│   ├── payment/             # Payment method icons
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── images/          # Menu item images (by category)
│   │   │   ├── pizza/
│   │   │   ├── hamburger/
│   │   │   ├── drink/
│   │   │   ├── sandwich/
│   │   │   ├── side/
│   │   │   └── dessert/
│   │   ├── styles/
│   │   └── main.css         # Global styles & CSS variables
│   ├── components/
│   │   ├── MenuInfoModal.vue       # Product detail modal with options
│   │   ├── MessageModal.vue        # Alert/confirmation dialogs
│   │   ├── Screensaver.vue         # Advertisement screensaver
│   │   ├── VirtualKeypad.vue       # Numeric keypad UI
│   │   ├── KeypadModal.vue         # Keypad modal wrapper
│   │   ├── OrderCompletionModal.vue # Order confirmation display
│   │   └── LanguageSwitcher.vue    # Language toggle component
│   ├── data/
│   │   └── db.json          # JSON Server database
│   ├── locales/
│   │   ├── i18n.js          # i18n configuration
│   │   └── translations.js  # Korean & English translations
│   ├── router/
│   │   └── index.js         # Route definitions
│   ├── services/
│   │   ├── axios.js         # Axios instance configuration
│   │   └── api.js           # API service functions
│   ├── stores/
│   │   └── orderStore.js    # Pinia store for order state
│   ├── views/
│   │   ├── MainPage.vue            # Welcome screen
│   │   ├── OrderPage.vue           # Menu browsing & cart
│   │   ├── PaymentMethodPage.vue   # Payment selection
│   │   ├── PaymentConfirmPage.vue  # Order confirmation
│   │   ├── PaymentProcessView.vue  # Payment processing
│   │   ├── PaymentFailView.vue     # Payment failure handling
│   │   ├── AdminLoginPage.vue      # Admin authentication
│   │   ├── AdminDashboard.vue      # Admin overview
│   │   ├── AdminMenuManagement.vue # Menu CRUD
│   │   └── AdminSalesStats.vue     # Sales analytics
│   ├── App.vue              # Root component
│   └── main.js              # Application entry point
├── .env                     # Environment variables
├── index.html               # HTML template
├── package.json
└── vite.config.js           # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js ^20.19.0 or >=22.12.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vue-team-project

# Install dependencies
npm install
```

### Running the Application

```bash
# Start both development server and mock API
npm run dev:all
```

This starts:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **API**: http://localhost:3000 (JSON Server)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run server` | Start JSON Server mock API |
| `npm run dev:all` | Start both frontend and API concurrently |

## Architecture Overview

### State Management (Pinia)

The `orderStore` manages the global order state:

```javascript
// State
- orderList: []           // Cart items
- selectedPaymentMethod   // Chosen payment method
- currentMember           // Logged-in member profile
- totalDiscount           // Applied discounts
- usedPoints              // Redeemed loyalty points

// Getters
- calculatedTotalPrice    // Computed cart total

// Actions
- addItem()               // Add/merge item to cart
- removeItem()            // Remove from cart
- updateQuantity()        // Change item quantity
- clearOrder()            // Reset all state
```

### Routing

| Path | Component | Description |
|------|-----------|-------------|
| `/` | MainPage | Welcome screen with dining options |
| `/order` | OrderPage | Menu browsing and cart |
| `/payment-method` | PaymentMethodPage | Payment selection |
| `/payment-confirm` | PaymentConfirmPage | Order confirmation |
| `/payment-process` | PaymentProcessView | Payment processing |
| `/payment-fail` | PaymentFailView | Payment failure |
| `/admin/login` | AdminLoginPage | Admin authentication |
| `/admin` | AdminDashboard | Admin overview |
| `/admin/menu` | AdminMenuManagement | Menu management |
| `/admin/sales` | AdminSalesStats | Sales analytics |

### Component Architecture

**Smart Components (Views)**: Handle business logic, API calls, and state management
- `OrderPage.vue`, `PaymentMethodPage.vue`, `AdminMenuManagement.vue`

**Presentational Components**: Reusable UI elements
- `MenuInfoModal.vue`, `VirtualKeypad.vue`, `LanguageSwitcher.vue`

## API Endpoints

The application uses JSON Server as a mock REST API.

### Categories
- `GET /categories` - List all categories

### Menu Items
- `GET /menuItems` - List all menu items
- `GET /menuItems?category=<id>` - Filter by category
- `POST /menuItems` - Create menu item
- `PUT /menuItems/:id` - Update menu item
- `DELETE /menuItems/:id` - Delete menu item

### Orders
- `GET /orders` - List all orders
- `POST /orders` - Create new order

### Members
- `GET /members?phone=<phone>` - Find member by phone
- `POST /members` - Create new member
- `PATCH /members/:id` - Update member (points, etc.)

### Payment & Coupons
- `GET /paymentMethods` - List payment methods
- `GET /coupons?code=<code>` - Validate coupon

## Internationalization

The application supports Korean (default) and English.

### Configuration

```javascript
// src/locales/i18n.js
- Default locale: 'ko' (Korean)
- Fallback locale: 'ko'
- Global injection enabled
```

### Usage in Components

```vue
<template>
  <p>{{ $t('common.confirm') }}</p>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
```

### Language Switcher

The `LanguageSwitcher` component provides a toggle between Korean and English, available throughout the application.

## Development

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Vue Official Extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### Browser DevTools

- [Vue.js devtools (Chrome)](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Vue.js devtools (Firefox)](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000
```

### CSS Architecture

The project uses CSS Variables for theming:

```css
:root {
  --color-primary: #E63946;    /* Brand red */
  --color-secondary: #F4A261;  /* Accent orange */
  --color-background: #F1FAEE; /* Cream background */
  --color-text: #1D3557;       /* Navy text */
  --color-accent: #457B9D;     /* Teal accent */
}
```

### Data Models

**MenuItem**
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

**Order**
```javascript
{
  orderNumber: string,
  paymentMethod: string,
  items: OrderItem[],
  totalPrice: number,
  timestamp: string
}
```

## License

This project is private and not licensed for public distribution.

---

Built with Vue 3 + Vite

# Kiosk Ordering System

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3.0-FFD859?logo=vue.js&logoColor=black)
![License](https://img.shields.io/badge/License-Private-red)
![Status](https://img.shields.io/badge/Status-In_Development-yellow)

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

### Core Framework
![Vue.js](https://img.shields.io/badge/Vue.js-3.5.27-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### State & Routing
![Pinia](https://img.shields.io/badge/Pinia-3.0.4-FFD859?style=for-the-badge&logo=vue.js&logoColor=black)
![Vue Router](https://img.shields.io/badge/Vue_Router-4.6.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)

### HTTP & API
![Axios](https://img.shields.io/badge/Axios-1.13.4-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![JSON Server](https://img.shields.io/badge/JSON_Server-1.0.0-000000?style=for-the-badge&logo=json&logoColor=white)

### Internationalization
![Vue I18n](https://img.shields.io/badge/Vue_I18n-11.2.8-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)

### Development Tools
![Node.js](https://img.shields.io/badge/Node.js-≥20.19.0-339933?style=for-the-badge&logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-Package_Manager-CB3837?style=for-the-badge&logo=npm&logoColor=white)

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
| Service | URL | Description |
|---------|-----|-------------|
| ![Frontend](https://img.shields.io/badge/Frontend-646CFF?style=flat-square&logo=vite&logoColor=white) | http://localhost:5173 | Vite dev server |
| ![API](https://img.shields.io/badge/API-000000?style=flat-square&logo=json&logoColor=white) | http://localhost:3000 | JSON Server |

## Available Scripts

| Command | Description |
|---------|-------------|
| ![dev](https://img.shields.io/badge/npm_run-dev-4FC08D?style=flat-square&logo=npm) | Start Vite development server |
| ![build](https://img.shields.io/badge/npm_run-build-4FC08D?style=flat-square&logo=npm) | Build for production |
| ![preview](https://img.shields.io/badge/npm_run-preview-4FC08D?style=flat-square&logo=npm) | Preview production build |
| ![server](https://img.shields.io/badge/npm_run-server-000000?style=flat-square&logo=npm) | Start JSON Server mock API |
| ![dev:all](https://img.shields.io/badge/npm_run-dev:all-E63946?style=flat-square&logo=npm) | Start both frontend and API concurrently |

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
| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/categories` | List all categories |

### Menu Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/menuItems` | List all menu items |
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/menuItems?category=<id>` | Filter by category |
| ![POST](https://img.shields.io/badge/POST-2196F3?style=flat-square) | `/menuItems` | Create menu item |
| ![PUT](https://img.shields.io/badge/PUT-FF9800?style=flat-square) | `/menuItems/:id` | Update menu item |
| ![DELETE](https://img.shields.io/badge/DELETE-F44336?style=flat-square) | `/menuItems/:id` | Delete menu item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/orders` | List all orders |
| ![POST](https://img.shields.io/badge/POST-2196F3?style=flat-square) | `/orders` | Create new order |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/members?phone=<phone>` | Find member by phone |
| ![POST](https://img.shields.io/badge/POST-2196F3?style=flat-square) | `/members` | Create new member |
| ![PATCH](https://img.shields.io/badge/PATCH-9C27B0?style=flat-square) | `/members/:id` | Update member (points, etc.) |

### Payment & Coupons
| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/paymentMethods` | List payment methods |
| ![GET](https://img.shields.io/badge/GET-4CAF50?style=flat-square) | `/coupons?code=<code>` | Validate coupon |

## Internationalization

![Korean](https://img.shields.io/badge/Korean-Default-E63946?style=flat-square)
![English](https://img.shields.io/badge/English-Supported-4FC08D?style=flat-square)

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

[![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![Vue Official](https://img.shields.io/badge/Vue_Official_Extension-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### Browser DevTools

[![Chrome](https://img.shields.io/badge/Vue_DevTools-Chrome-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
[![Firefox](https://img.shields.io/badge/Vue_DevTools-Firefox-FF7139?style=for-the-badge&logo=firefox&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

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
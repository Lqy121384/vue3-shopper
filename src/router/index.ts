import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    redirect: '/auth/login'
  },
  {
    path: '/register',
    redirect: '/auth/register'
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/Home.vue'),
        meta: {
          title: '首页'
        }
      },
      {
        path: 'products',
        name: 'products',
        component: () => import('@/views/products/ProductList.vue'),
        meta: {
          title: '商品列表'
        }
      },
      {
        path: 'product/:id',
        redirect: to => `/products/${to.params.id}`
      },
      {
        path: 'products/:id',
        name: 'product-detail',
        component: () => import('@/views/products/ProductDetailPage.vue'),
        meta: {
          title: '商品详情'
        }
      },
      {
        path: 'cart',
        name: 'cart',
        component: () => import('@/views/cart/CartPage.vue'),
        meta: {
          title: '购物车',
          requiresAuth: true
        }
      },
      {
        path: 'checkout',
        name: 'checkout',
        component: () => import('@/views/checkout/CheckoutPage.vue'),
        meta: {
          title: '结算',
          requiresAuth: true
        },
        children: [
          {
            path: 'payment',
            name: 'payment',
            component: () => import('@/views/payment/PaymentPage.vue'),
            meta: {
              title: '支付',
              requiresAuth: true
            }
          }
        ]
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('@/views/orders/OrderListPage.vue'),
        meta: {
          title: '我的订单',
          requiresAuth: true
        }
      },
      {
        path: 'orders/:id',
        name: 'order-detail',
        component: () => import('@/views/orders/OrderDetailPage.vue'),
        meta: {
          title: '订单详情',
          requiresAuth: true
        }
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/user/ProfilePage.vue'),
        meta: {
          title: '个人中心',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/auth/LoginPage.vue'),
        meta: {
          title: '登录'
        }
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/auth/RegisterPage.vue'),
        meta: {
          title: '注册'
        }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/views/auth/ForgotPasswordPage.vue'),
        meta: {
          title: '忘记密码'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/NotFoundPage.vue'),
    meta: {
      title: '404'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || ''} - 农产品电子商城`
  
  const userStore = useUserStore()
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    if (!userStore.token) {
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // 如果有token但没有用户信息，尝试获取用户信息
    if (!userStore.userInfo) {
      try {
        await userStore.fetchUserInfo()
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        // 如果获取用户信息失败，清除token并跳转到登录页
        userStore.resetState()
        next({
          path: '/auth/login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }
  }
  
  // 如果访问登录页面且已经登录，跳转到首页
  if (to.path === '/auth/login' && userStore.isLoggedIn) {
    next('/')
    return
  }
  
  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('Router error:', error)
  // 可以在这里添加错误上报逻辑
})

export default router

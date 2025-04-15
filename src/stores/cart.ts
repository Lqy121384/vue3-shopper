import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, CartSummary } from '@/types/cart'
import { getCartList, addToCart, updateCartItem, removeFromCart, clearCart, toggleSelectAll, getCartSummary } from '@/api/cart'
import { ElMessage } from 'element-plus'
import { ApiCode } from '@/types/api'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref<CartItem[]>([])
  const cartSummary = ref<CartSummary>({
    totalItems: 0,
    totalAmount: 0,
    selectedItems: 0,
    selectedAmount: 0,
    totalQuantity: 0,
    selectedQuantity: 0,
    totalDiscount: 0,
    totalTax: 0,
    totalShipping: 0,
    totalFinal: 0
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isEmpty = computed(() => cartItems.value.length === 0)
  const totalQuantity = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))
  const selectedQuantity = computed(() => cartItems.value.filter(item => item.selected).reduce((sum, item) => sum + item.quantity, 0))
  const isAllSelected = computed(() => cartItems.value.length > 0 && cartItems.value.every(item => item.selected))

  // 设置错误信息
  const setError = (message: string) => {
    error.value = message
    ElMessage.error(message)
  }

  // 清除错误信息
  const clearError = () => {
    error.value = null
  }

  // 获取购物车列表
  const fetchCartList = async () => {
    try {
      loading.value = true
      clearError()
      console.log('Fetching cart list...')
      const response = await getCartList()
      console.log('Cart list response:', response)
      
      if (response.code === ApiCode.SUCCESS || response.code === ApiCode.SUCCESS_200) {
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Invalid cart data format:', response.data)
          throw new Error('购物车数据格式错误')
        }
        
        // 过滤掉无效的购物车项
        const validItems = response.data.filter((item: CartItem) => {
          const isValid = item && 
            typeof item.id === 'string' && 
            typeof item.productId === 'string' &&
            typeof item.name === 'string' &&
            typeof item.price === 'number' &&
            typeof item.quantity === 'number' &&
            typeof item.selected === 'boolean'
          
          if (!isValid) {
            console.warn('Invalid cart item:', item)
          }
          
          return isValid
        })
        
        console.log('Valid cart items:', validItems)
        cartItems.value = validItems
        await fetchCartSummary()
      } else {
        throw new Error(response.message || '获取购物车列表失败')
      }
    } catch (err: any) {
      setError(err.message || '获取购物车列表失败')
      throw err
    } finally {
      loading.value = false
    }
  }

  // 添加商品到购物车
  const handleAddToCart = async (productId: string, quantity: number, specs: Record<string, string> = {}) => {
    try {
      loading.value = true
      clearError()
      await addToCart(productId, quantity)
      ElMessage.success('添加成功')
      await fetchCartList()
    } catch (err: any) {
      setError(err.message || '添加到购物车失败')
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新购物车商品
  const handleUpdateCartItem = async (id: string, quantity: number, selected?: boolean) => {
    try {
      loading.value = true
      clearError()
      await updateCartItem(id, { quantity, selected })
      await fetchCartList()
    } catch (err: any) {
      setError(err.message || '更新购物车失败')
      throw err
    } finally {
      loading.value = false
    }
  }

  // 从购物车中移除商品
  const handleRemoveFromCart = async (id: string) => {
    try {
      loading.value = true
      clearError()
      await removeFromCart(id)
      ElMessage.success('移除成功')
      await fetchCartList()
    } catch (err: any) {
      setError(err.message || '移除商品失败')
      throw err
    } finally {
      loading.value = false
    }
  }

  // 清空购物车
  const handleClearCart = async () => {
    try {
      loading.value = true
      clearError()
      await clearCart()
      cartItems.value = []
      cartSummary.value = {
        totalItems: 0,
        totalAmount: 0,
        selectedItems: 0,
        selectedAmount: 0,
        totalQuantity: 0,
        selectedQuantity: 0,
        totalDiscount: 0,
        totalTax: 0,
        totalShipping: 0,
        totalFinal: 0
      }
      ElMessage.success('购物车已清空')
    } catch (err: any) {
      setError(err.message || '清空购物车失败')
      throw err
    } finally {
      loading.value = false
    }
  }

  // 选择/取消选择所有商品
  const handleToggleSelectAll = async (selected: boolean) => {
    try {
      loading.value = true
      clearError()
      console.log('Toggling select all:', selected)
      console.log('Current cart items:', cartItems.value)
      
      // 如果购物车为空，直接返回
      if (cartItems.value.length === 0) {
        console.log('Cart is empty, skipping toggle')
        return
      }
      
      // 检查是否有有效的商品
      const validItems = cartItems.value.filter(item => item && item.id && item.productId)
      if (validItems.length === 0) {
        console.log('No valid items in cart, skipping toggle')
        return
      }
      
      // 调用 API
      const response = await toggleSelectAll(selected)
      console.log('Toggle select all response:', response)
      
      if (response.code === ApiCode.SUCCESS || response.code === ApiCode.SUCCESS_200) {
        // API 调用成功后，刷新购物车列表
        await fetchCartList()
      } else {
        throw new Error(response.message || '操作失败')
      }
    } catch (err: any) {
      console.error('Toggle select all error:', err)
      setError(err.message || '操作失败')
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取购物车汇总信息
  const fetchCartSummary = async () => {
    try {
      const response = await getCartSummary()
      if (response.code === ApiCode.SUCCESS || response.code === ApiCode.SUCCESS_200) {
        // 确保所有数值都是数字类型
        cartSummary.value = {
          totalItems: Number(response.data.totalItems) || 0,
          totalAmount: Number(response.data.totalAmount) || 0,
          selectedItems: Number(response.data.selectedItems) || 0,
          selectedAmount: Number(response.data.selectedAmount) || 0,
          totalQuantity: Number(response.data.totalQuantity) || 0,
          selectedQuantity: Number(response.data.selectedQuantity) || 0,
          totalDiscount: Number(response.data.totalDiscount) || 0,
          totalTax: Number(response.data.totalTax) || 0,
          totalShipping: Number(response.data.totalShipping) || 0,
          totalFinal: Number(response.data.totalFinal) || 0
        }
      }
    } catch (err: any) {
      console.error('获取购物车汇总信息失败:', err)
      // 发生错误时重置为默认值
      cartSummary.value = {
        totalItems: 0,
        totalAmount: 0,
        selectedItems: 0,
        selectedAmount: 0,
        totalQuantity: 0,
        selectedQuantity: 0,
        totalDiscount: 0,
        totalTax: 0,
        totalShipping: 0,
        totalFinal: 0
      }
    }
  }

  return {
    cartItems,
    cartSummary,
    loading,
    error,
    isEmpty,
    totalQuantity,
    selectedQuantity,
    isAllSelected,
    fetchCartList,
    handleAddToCart,
    handleUpdateCartItem,
    handleRemoveFromCart,
    handleClearCart,
    handleToggleSelectAll
  }
})
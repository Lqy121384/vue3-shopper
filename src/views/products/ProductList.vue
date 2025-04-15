<template>
  <div class="products-container">
    <div class="products-content">
      <!-- 筛选器 -->
      <div class="filters">
        <el-card class="filter-card">
          <template #header>
            <div class="filter-header">
              <span>筛选条件</span>
              <el-button link @click="resetFilters">重置</el-button>
            </div>
          </template>
          
          <!-- 分类筛选 -->
          <div class="filter-section">
            <h3>商品分类</h3>
            <el-tree
              :data="categories"
              :props="{ label: 'name' }"
              node-key="id"
              :default-expanded-keys="selectedCategory ? [selectedCategory] : []"
              @node-click="handleCategorySelect"
            />
          </div>

          <!-- 价格区间 -->
          <div class="filter-section">
            <h3>价格区间</h3>
            <el-input-number
              v-model="filters.minPrice"
              :min="0"
              placeholder="最低价"
              class="price-input"
              @change="handlePriceChange"
            />
            <span class="price-separator">-</span>
            <el-input-number
              v-model="filters.maxPrice"
              :min="0"
              placeholder="最高价"
              class="price-input"
              @change="handlePriceChange"
            />
          </div>

          <!-- 排序方式 -->
          <div class="filter-section">
            <h3>排序方式</h3>
            <el-radio-group v-model="filters.sortBy" @change="handleSortChange">
              <el-radio-button value="price">价格</el-radio-button>
              <el-radio-button value="sales">销量</el-radio-button>
              <el-radio-button value="rating">评分</el-radio-button>
              <el-radio-button value="createdAt">上架时间</el-radio-button>
            </el-radio-group>
            <el-switch
              v-model="filters.sortOrder"
              active-value="desc"
              inactive-value="asc"
              class="sort-order"
              @change="handleSortOrderChange"
            />
          </div>
          
          <!-- 商品标签筛选 -->
          <div class="filter-section">
            <h3>商品标签</h3>
            <div class="tag-filters">
              <el-checkbox v-model="filters.showFresh" @change="handleTagFilterChange">新鲜</el-checkbox>
              <el-checkbox v-model="filters.showHot" @change="handleTagFilterChange">热销</el-checkbox>
              <el-checkbox v-model="filters.showOrganic" @change="handleTagFilterChange">有机</el-checkbox>
              <el-checkbox v-model="filters.showFreeRange" @change="handleTagFilterChange">散养</el-checkbox>
              <el-checkbox v-model="filters.showImported" @change="handleTagFilterChange">进口</el-checkbox>
              <el-checkbox v-model="filters.showPremium" @change="handleTagFilterChange">优质</el-checkbox>
              <el-checkbox v-model="filters.showLimited" @change="handleTagFilterChange">限时</el-checkbox>
              <el-checkbox v-model="filters.showOnSale" @change="handleTagFilterChange">特价</el-checkbox>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 商品列表 -->
      <div class="products-list">
        <div class="products-header">
          <h2>农产品列表</h2>
          <div class="search-container">
            <el-autocomplete
              v-model="filters.keyword"
              :fetch-suggestions="querySearchAsync"
              placeholder="搜索农产品"
              class="search-input"
              clearable
              @select="handleSearchSelect"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #default="{ item }">
                <div class="search-suggestion-item">
                  <el-icon><Goods /></el-icon>
                  <span>{{ item.value }}</span>
                </div>
              </template>
            </el-autocomplete>
            <el-button type="primary" class="search-button" @click="handleSearch">
              搜索
            </el-button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated :loading="true">
            <template #template>
              <div class="skeleton-item" v-for="i in 8" :key="i">
                <el-skeleton-item variant="image" style="width: 100%; height: 160px; border-radius: 8px;" />
                <div style="padding: 14px">
                  <el-skeleton-item variant="h3" style="width: 50%" />
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px">
                    <el-skeleton-item variant="text" style="width: 30%" />
                    <el-skeleton-item variant="text" style="width: 20%" />
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredProducts.length === 0" class="empty-container">
          <el-empty description="暂无相关商品" :image-size="200">
            <el-button type="primary" @click="resetFilters">查看全部商品</el-button>
          </el-empty>
        </div>

        <!-- 商品列表 -->
        <el-row v-else :gutter="30">
          <el-col
            v-for="product in filteredProducts"
            :key="product.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            class="product-col"
          >
            <el-card class="product-card" @click="handleProductClick(product)">
              <div class="product-image">
                <img :src="product.image" :alt="product.name" />
                <div class="product-overlay">
                  <el-button type="primary" class="quick-view-btn" @click.stop="handleQuickView(product)">
                    <el-icon><View /></el-icon>
                    快速查看
                  </el-button>
                </div>
              </div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <div class="price-info">
                  <span class="price">{{ product.price }}</span>
                  <span v-if="product.originalPrice" class="original-price">
                    ¥{{ product.originalPrice }}
                  </span>
                </div>
                <div class="product-meta">
                  <span class="sales">销量: {{ product.sales }}</span>
                  <el-rate
                    v-model="product.rating"
                    disabled
                    show-score
                    text-color="#ff9900"
                  />
                </div>
                <p class="description">{{ product.description }}</p>
                <div class="product-tags">
                  <el-tag
                    v-for="tag in product.tagColors"
                    :key="tag.name"
                    :style="{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }"
                    size="small"
                    class="tag"
                  >
                    {{ tag.name }}
                  </el-tag>
                </div>
                <div class="product-actions">
                  <el-button type="primary" class="add-to-cart-btn" @click.stop="handleAddToCart(product)">
                    <el-icon><ShoppingCart /></el-icon>
                    加入购物车
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="filters.page"
            v-model:page-size="filters.pageSize"
            :total="filteredTotal"
            :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 快速查看对话框 -->
    <el-dialog
      v-model="quickViewVisible"
      title="商品详情"
      width="800px"
      class="quick-view-dialog"
      destroy-on-close
    >
      <div v-if="selectedProduct" class="quick-view-content">
        <div class="quick-view-image">
          <img :src="selectedProduct.image" :alt="selectedProduct.name" />
        </div>
        <div class="quick-view-info">
          <h2>{{ selectedProduct.name }}</h2>
          <div class="quick-view-price">
            <span class="price">{{ selectedProduct.price }}</span>
            <span v-if="selectedProduct.originalPrice" class="original-price">
              ¥{{ selectedProduct.originalPrice }}
            </span>
          </div>
          <div class="quick-view-meta">
            <span class="sales">销量: {{ selectedProduct.sales }}</span>
            <el-rate
              v-model="selectedProduct.rating"
              disabled
              show-score
              text-color="#ff9900"
            />
          </div>
          <p class="quick-view-description">{{ selectedProduct.description }}</p>
          <div class="quick-view-tags">
            <el-tag
              v-for="tag in selectedProduct.tags"
              :key="tag"
              :class="getTagClass(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="quick-view-actions">
            <el-input-number v-model="quantity" :min="1" :max="99" size="small" />
            <el-button type="primary" @click="handleQuickViewAddToCart">加入购物车</el-button>
            <el-button type="success" @click="handleQuickViewBuyNow">立即购买</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, ShoppingCart, View, ShoppingBag, Goods } from '@element-plus/icons-vue'
import type { Product, Category, ProductQuery, ProductListResponse, ProductListData, ProductReview } from '@/types/product'
import { getProducts, getCategories } from '@/api/product'
import type { ProductCategory } from '@/types/product'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/api'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { createOrder } from '@/api/order'

// 扩展 Product 类型，添加标签属性
interface ExtendedProduct extends Omit<Product, 'reviews' | 'image'> {
  reviews: ProductReview[];
  image?: string;
  tagColors?: Array<{
    name: string;
    color: string;
  }>;
  tags?: string[];
}

interface ProductParams {
  page: number
  limit: number
  categoryId?: string
  search?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
}

interface Filters {
  categoryId?: string
  category?: string
  keyword: string
  minPrice?: number
  maxPrice?: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  pageSize: number
  showFresh?: boolean
  showHot?: boolean
  showOrganic?: boolean
  showFreeRange?: boolean
  showImported?: boolean
  showPremium?: boolean
  showLimited?: boolean
  showOnSale?: boolean
}

interface SearchSuggestion {
  value: string;
  link?: string;
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式变量
const loading = ref(false)
const products = ref<ExtendedProduct[]>([])
const categories = ref<Category[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const searchQuery = ref('')
const selectedCategory = ref<string | undefined>(undefined)
const filters = ref<Filters>({
  categoryId: undefined,
  category: undefined,
  keyword: '',
  minPrice: undefined,
  maxPrice: undefined,
  sortBy: 'id',
  sortOrder: 'desc',
  page: 1,
  pageSize: 12,
  showFresh: false,
  showHot: false,
  showOrganic: false,
  showFreeRange: false,
  showImported: false,
  showPremium: false,
  showLimited: false,
  showOnSale: false
})

// 搜索建议
const searchSuggestions = ref<SearchSuggestion[]>([])

// 快速查看相关
const quickViewVisible = ref(false)
const selectedProduct = ref<ExtendedProduct | null>(null)
const quantity = ref(1)

const defaultImageUrl = 'https://picsum.photos/400/400'

// 计算属性：根据标签筛选商品
const filteredProducts = computed(() => {
  let result = [...products.value]
  
  // 应用标签筛选
  if (filters.value.showFresh) {
    result = result.filter(product => product.tags?.includes('新鲜'))
  }
  if (filters.value.showHot) {
    result = result.filter(product => product.tags?.includes('热销'))
  }
  if (filters.value.showOrganic) {
    result = result.filter(product => product.tags?.includes('有机'))
  }
  if (filters.value.showFreeRange) {
    result = result.filter(product => product.tags?.includes('散养'))
  }
  if (filters.value.showImported) {
    result = result.filter(product => product.tags?.includes('进口'))
  }
  if (filters.value.showPremium) {
    result = result.filter(product => product.tags?.includes('优质'))
  }
  if (filters.value.showLimited) {
    result = result.filter(product => product.tags?.includes('限时'))
  }
  if (filters.value.showOnSale) {
    result = result.filter(product => product.tags?.includes('特价'))
  }
  
  return result
})

// 计算属性：筛选后的总数
const filteredTotal = computed(() => {
  return total.value // 使用后端返回的总数，而不是过滤后的长度
})

// 获取商品列表
const fetchProducts = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      category: selectedCategory.value,
      search: searchQuery.value,
      sort: filters.value.sortBy + (filters.value.sortOrder === 'desc' ? '-desc' : ''),
      minPrice: filters.value.minPrice,
      maxPrice: filters.value.maxPrice
    }
    console.log('Fetching products with params:', params)
    const response = await getProducts(params)
    console.log('Products response:', response)
    if (response.code === 0 && response.data) {
      const productData = response.data
      console.log('Product data:', productData)
      products.value = productData.list.map((item: any) => {
        const product: ExtendedProduct = {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image || defaultImageUrl,
          category: typeof item.category === 'object' ? item.category.id : item.category,
          categoryId: typeof item.category === 'object' ? item.category.id : item.categoryId,
          sales: item.sales,
          rating: item.rating,
          reviews: Array.isArray(item.reviews) ? item.reviews : [],
          tags: item.tags || [],
          specifications: item.specifications,
          images: item.images,
          isFresh: item.isFresh,
          isOrganic: item.isOrganic,
          isLocal: item.isLocal,
          isSeasonal: item.isSeasonal,
          isPremium: item.isPremium,
          isNew: item.isNew,
          isHot: item.isHot,
          isOnSale: item.isOnSale,
          stock: item.stock,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          status: item.status || 'on'
        }
        // 处理标签颜色
        if (product.tags && product.tags.length > 0) {
          product.tagColors = product.tags.map((tag: string) => ({
            name: tag,
            color: getTagColor(tag)
          }))
        }
        return product
      })
      total.value = productData.total
      console.log('Updated products:', products.value)
      console.log('Total items:', total.value)
    } else {
      ElMessage.error(response.message || '获取商品列表失败')
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 更新搜索建议
const updateSearchSuggestions = () => {
  // 从商品列表中提取搜索建议
  const suggestions: SearchSuggestion[] = products.value.map(product => ({
    value: product.name,
    link: `/product/${product.id}`
  }))
  
  // 添加一些热门搜索词
  const hotSearches: SearchSuggestion[] = [
    { value: '新鲜水果' },
    { value: '有机蔬菜' },
    { value: '本地特产' },
    { value: '应季农产品' },
    { value: '优质大米' }
  ]
  
  searchSuggestions.value = [...suggestions, ...hotSearches]
}

// 搜索建议查询
const querySearchAsync = (queryString: string, cb: (arg: SearchSuggestion[]) => void) => {
  const results = queryString
    ? searchSuggestions.value.filter(item => 
        item.value.toLowerCase().includes(queryString.toLowerCase())
      )
    : searchSuggestions.value
  
  // 限制返回结果数量
  cb(results.slice(0, 10))
}

// 处理搜索建议选择
const handleSearchSelect = (item: Record<string, any>) => {
  if (item && typeof item.value === 'string') {
    filters.value.keyword = item.value
  }
  handleSearch()
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await getCategories()
    if (response.code === 0 && Array.isArray(response.data)) {
      categories.value = response.data.map((item: any) => ({
        id: Number(item.id),
        name: item.name,
        icon: item.icon || '',
        level: item.level,
        sort: item.sort,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    } else {
      // 如果 API 调用失败，使用默认分类数据
      categories.value = [
        {
          id: 1,
          name: '水果',
          icon: 'fruit',
          level: 1,
          sort: 1,
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          name: '蔬菜',
          icon: 'vegetable',
          level: 1,
          sort: 2,
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          name: '肉类',
          icon: 'meat',
          level: 1,
          sort: 3,
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 4,
          name: '海鲜',
          icon: 'seafood',
          level: 1,
          sort: 4,
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 5,
          name: '粮油',
          icon: 'grain',
          level: 1,
          sort: 5,
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    // 使用默认分类数据
    categories.value = [
      {
        id: 1,
        name: '水果',
        icon: 'fruit',
        level: 1,
        sort: 1,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: '蔬菜',
        icon: 'vegetable',
        level: 1,
        sort: 2,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: '肉类',
        icon: 'meat',
        level: 1,
        sort: 3,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: '海鲜',
        icon: 'seafood',
        level: 1,
        sort: 4,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: '粮油',
        icon: 'grain',
        level: 1,
        sort: 5,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    ElMessage.error('获取分类列表失败，使用默认分类')
  }
}

// 处理分类选择
const handleCategorySelect = (category: any) => {
  if (category && category.id) {
    selectedCategory.value = String(category.id)
    filters.value.categoryId = String(category.id)
    filters.value.page = 1
    fetchProducts()
  }
}

// 处理分类点击
const handleCategoryClick = (category: Category) => {
  handleCategorySelect(category)
}

// 处理搜索
const handleSearch = () => {
  searchQuery.value = filters.value.keyword
  currentPage.value = 1
  fetchProducts()
}

// 处理重置
const resetFilters = () => {
  filters.value = {
    categoryId: undefined,
    category: undefined,
    keyword: '',
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'id',
    sortOrder: 'desc',
    page: 1,
    pageSize: 12,
    showFresh: false,
    showHot: false,
    showOrganic: false,
    showFreeRange: false,
    showImported: false,
    showPremium: false,
    showLimited: false,
    showOnSale: false
  }
  selectedCategory.value = undefined
  searchQuery.value = ''
  currentPage.value = 1
  fetchProducts()
}

// 处理标签筛选变化
const handleTagFilterChange = () => {
  // 不需要重新获取数据，使用计算属性过滤
  ElMessage.success('已更新筛选条件')
}

// 处理商品点击
const handleProductClick = (product: ExtendedProduct) => {
  router.push(`/product/${product.id}`)
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  console.log('Page changed to:', page)
  filters.value.page = page
  fetchProducts()
}

// 处理每页数量变化
const handleSizeChange = (size: number) => {
  console.log('Page size changed to:', size)
  filters.value.pageSize = size
  filters.value.page = 1 // 重置到第一页
  fetchProducts()
}

// 处理排序变化
const handleSortChange = (val: string | number | boolean | undefined) => {
  if (typeof val === 'string') {
    filters.value.sortBy = val
    filters.value.sortOrder = 'desc' // 重置排序方向
    filters.value.page = 1 // 重置到第一页
    fetchProducts()
  }
}

// 处理排序方向变化
const handleSortOrderChange = (val: string | number | boolean) => {
  filters.value.sortOrder = val === true ? 'desc' : 'asc'
  filters.value.page = 1 // 重置到第一页
  fetchProducts()
}

// 处理价格区间变化
const handlePriceChange = () => {
  currentPage.value = 1
  fetchProducts()
}

// 监听价格区间变化
watch(
  [
    () => filters.value.minPrice,
    () => filters.value.maxPrice
  ],
  () => {
    handlePriceChange()
  }
)

// 监听路由参数变化
watch(
  () => route.query.category,
  (val) => {
    if (val) {
      const categoryId = Number(val)
      if (!isNaN(categoryId)) {
        selectedCategory.value = String(categoryId)
        filters.value.categoryId = String(categoryId)
        fetchProducts()
      }
    }
  },
  { immediate: true }
)

// 处理加入购物车
const handleAddToCart = async (product: ExtendedProduct) => {
  try {
    const response = await axios.post('/api/behaviors', {
      type: 'add-to-cart',
      productId: product.id
    });
    if (response.data.code === 0) {
      console.log('User behavior recorded successfully');
      ElMessage.success(`已将 ${product.name} 加入购物车`)
    }
  } catch (error) {
    console.error('Failed to record user behavior:', error);
    ElMessage.error('加入购物车失败')
  }
}

// 处理快速查看
const handleQuickView = (product: ExtendedProduct) => {
  selectedProduct.value = product
  quickViewVisible.value = true
}

// 处理快速查看加入购物车
const handleQuickViewAddToCart = () => {
  if (selectedProduct.value) {
    ElMessage.success(`已将 ${quantity.value} 件 ${selectedProduct.value.name} 加入购物车`)
    quickViewVisible.value = false
  }
}

// 处理快速查看立即购买
const handleQuickViewBuyNow = async () => {
  if (!selectedProduct.value) return
  
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/auth/login')
    return
  }
  
  // 检查库存 - 增加库存限制
  if (quantity.value > 1000) {
    ElMessage.warning('单次购买数量不能超过1000件')
    return
  }
  
  try {
    loading.value = true
    
    // 创建订单
    const orderData = {
      items: [{
        productId: selectedProduct.value.id,
        quantity: quantity.value
      }],
      address: {
        name: userStore.userInfo?.nickname || '测试用户',
        phone: userStore.userInfo?.phone || '13800138000',
        address: '测试地址' // 这里应该从用户的默认地址中获取
      },
      paymentMethod: 'ONLINE'
    }
    
    const response = await createOrder(orderData)
    
    if (response.code === 0 && response.data) {
      ElMessage.success('订单创建成功')
      quickViewVisible.value = false
      // 跳转到订单列表页面
      router.push('/orders')
    } else {
      ElMessage.error(response.message || '创建订单失败')
    }
  } catch (error: any) {
    console.error('创建订单失败:', error)
    ElMessage.error(error.response?.data?.message || '创建订单失败')
  } finally {
    loading.value = false
  }
}

// 获取标签样式类
const getTagClass = (tag: string) => {
  switch (tag) {
    case '新鲜':
      return 'fresh'
    case '有机':
      return 'organic'
    case '本地':
      return 'local'
    case '应季':
      return 'seasonal'
    case '优质':
      return 'premium'
    default:
      return ''
  }
}

const getTagColor = (tag: string): string => {
  switch (tag) {
    case '新鲜':
      return '#67C23A'
    case '热销':
      return '#F56C6C'
    case '有机':
      return '#409EFF'
    case '散养':
      return '#E6A23C'
    case '进口':
      return '#909399'
    case '优质':
      return '#9B59B6'
    case '限时':
      return '#F56C6C'
    case '特价':
      return '#E6A23C'
    case '新品':
      return '#409EFF'
    case '本地':
      return '#67C23A'
    case '应季':
      return '#E6A23C'
    default:
      return '#909399'
  }
}

// 处理商品标签
const processProductTags = (product: ExtendedProduct) => {
  if (product.tags) {
    product.tagColors = product.tags.map(tag => ({
      name: tag,
      color: getTagColor(tag)
    }))
  }
  return product
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped lang="scss">
.products-container {
  width: 100%;
  background-color: #f5f7fa;
  padding: 30px 0;
  
  .products-content {
    display: flex;
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .filters {
    width: 240px;
    flex-shrink: 0;
    position: sticky;
    top: 24px;
    height: fit-content;

    .filter-card {
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      background-color: white;
      border: none;
      overflow: hidden;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
      }
      
      .filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 20px;
        border-bottom: 1px solid #ebeef5;
        background-color: #f8f9fa;
        
        span {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          position: relative;
          padding-left: 12px;
          
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 18px;
            background: linear-gradient(to bottom, #67c23a, #85ce61);
            border-radius: 2px;
          }
        }

        .el-button {
          font-size: 14px;
          color: #67c23a;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.3s ease;
          
          &:hover {
            color: #85ce61;
            background-color: rgba(103, 194, 58, 0.1);
            transform: translateY(-1px);
          }
        }
      }

      .filter-section {
        margin-bottom: 24px;
        padding: 0 20px;

        &:last-child {
          margin-bottom: 0;
        }

        h3 {
          margin: 0 0 14px;
          font-size: 15px;
          font-weight: 600;
          color: #303133;
          position: relative;
          padding-left: 10px;
          
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 14px;
            background-color: #67c23a;
            border-radius: 2px;
          }
        }

        .price-input {
          width: 100px;
          
          :deep(.el-input__wrapper) {
            box-shadow: 0 0 0 1px #dcdfe6 inset;
            border-radius: 8px;
            transition: all 0.3s ease;
            
            &:hover {
              box-shadow: 0 0 0 1px #c0c4cc inset;
            }
            
            &.is-focus {
              box-shadow: 0 0 0 1px #67c23a inset;
            }
          }
        }

        .price-separator {
          margin: 0 8px;
          color: #909399;
          font-weight: 500;
        }

        .sort-order {
          margin-left: 12px;
        }

        :deep(.el-radio-button__inner) {
          padding: 8px 14px;
          font-size: 13px;
          border-radius: 8px;
          margin-right: 8px;
          transition: all 0.3s ease;
          
          &:hover {
            color: #67c23a;
            background-color: rgba(103, 194, 58, 0.1);
            transform: translateY(-1px);
          }
        }
        
        :deep(.el-tree) {
          background: transparent;
          
          .el-tree-node__content {
            height: 36px;
            border-radius: 8px;
            transition: all 0.3s ease;
            
            &:hover {
              background-color: rgba(103, 194, 58, 0.1);
              transform: translateX(2px);
            }
          }
          
          .el-tree-node.is-current > .el-tree-node__content {
            background-color: rgba(103, 194, 58, 0.1);
            color: #67c23a;
            font-weight: 500;
          }
        }
        
        :deep(.el-switch) {
          --el-switch-on-color: #67c23a;
        }
        
        .tag-filters {
          display: flex;
          flex-direction: column;
          gap: 10px;
          
          :deep(.el-checkbox) {
            margin-right: 0;
            margin-bottom: 8px;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateX(3px);
            }
            
            .el-checkbox__label {
              font-size: 13px;
              color: #606266;
            }
            
            .el-checkbox__input.is-checked .el-checkbox__inner {
              background-color: #67c23a;
              border-color: #67c23a;
            }
            
            .el-checkbox__input.is-checked + .el-checkbox__label {
              color: #67c23a;
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  .products-list {
    flex: 1;

    .products-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 0 10px;

      h2 {
        margin: 0;
        font-size: 26px;
        font-weight: 600;
        color: #303133;
        position: relative;
        padding-left: 16px;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 5px;
          height: 24px;
          background: linear-gradient(to bottom, #67c23a, #85ce61);
          border-radius: 3px;
        }
      }

      .search-container {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .search-input {
          width: 300px;
          
          :deep(.el-input__wrapper) {
            box-shadow: 0 0 0 1px #dcdfe6 inset;
            border-radius: 10px;
            padding: 0 12px;
            transition: all 0.3s ease;
            
            &:hover {
              box-shadow: 0 0 0 1px #c0c4cc inset;
            }
            
            &.is-focus {
              box-shadow: 0 0 0 1px #67c23a inset;
            }
            
            .el-input__prefix {
              color: #909399;
            }
          }
          
          :deep(.el-autocomplete-suggestion) {
            border-radius: 10px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            border: none;
            overflow: hidden;
            
            .el-autocomplete-suggestion__list {
              padding: 8px 0;
              
              li {
                padding: 8px 16px;
                line-height: 1.5;
                transition: all 0.3s ease;
                
                &:hover {
                  background-color: rgba(103, 194, 58, 0.1);
                }
                
                &.highlighted {
                  background-color: rgba(103, 194, 58, 0.1);
                  color: #67c23a;
                  font-weight: 500;
                }
              }
            }
          }
        }
        
        .search-button {
          background: linear-gradient(135deg, #67c23a, #85ce61);
          border: none;
          border-radius: 10px;
          padding: 0 20px;
          height: 40px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 10px rgba(103, 194, 58, 0.3);
          transition: all 0.3s ease;
          
          &:hover {
            background: linear-gradient(135deg, #85ce61, #67c23a);
            box-shadow: 0 6px 15px rgba(103, 194, 58, 0.4);
            transform: translateY(-2px);
          }
        }
      }
    }

    .product-col {
      margin-bottom: 30px;
    }

    .product-card {
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 16px;
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: white;
      border: none;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
      position: relative;
      margin-bottom: 0;
      animation: fadeIn 0.6s ease-out;

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
        
        .product-image img {
          transform: scale(1.08);
        }
        
        .product-info h3 {
          color: #67c23a;
        }
        
        .add-to-cart-btn {
          opacity: 1;
          transform: translateY(0);
        }
        
        .product-overlay {
          opacity: 1;
        }
        
        .product-tags .tag {
          transform: translateY(-3px);
        }
      }

      .product-image {
        position: relative;
        height: 180px;
        overflow: hidden;
        background-color: #f5f7fa;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          
          .quick-view-btn {
            background-color: rgba(255, 255, 255, 0.95);
            color: #67c23a;
            border-color: #67c23a;
            font-size: 13px;
            padding: 8px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            
            &:hover {
              background-color: #67c23a;
              color: white;
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(103, 194, 58, 0.3);
            }
            
            .el-icon {
              margin-right: 6px;
            }
          }
        }
      }

      .product-info {
        padding: 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;

        h3 {
          margin: 0;
          font-size: 15px;
          line-height: 1.4;
          color: #303133;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          transition: color 0.3s ease;
        }

        .price-info {
          margin: 0;
          display: flex;
          align-items: baseline;

          .price {
            color: #f56c6c;
            font-size: 18px;
            font-weight: 600;
            margin-right: 6px;
            position: relative;
            
            &::before {
              content: '¥';
              font-size: 14px;
              margin-right: 2px;
              font-weight: 500;
            }
          }

          .original-price {
            color: #909399;
            text-decoration: line-through;
            font-size: 13px;
          }
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0;
          padding-top: 6px;
          border-top: 1px dashed #ebeef5;

          .sales {
            color: #606266;
            font-size: 13px;
            font-weight: 500;
          }

          :deep(.el-rate) {
            --el-rate-icon-size: 14px;
            
            .el-rate__icon {
              font-size: 14px;
            }
          }
        }

        .description {
          color: #606266;
          font-size: 13px;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }
        
        .product-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin: 8px 0;
          
          .tag {
            margin: 0;
            border: 1px solid;
            padding: 2px 8px;
            font-size: 12px;
            border-radius: 4px;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
          }
        }
        
        .product-actions {
          margin-top: 8px;
          
          .add-to-cart-btn {
            width: 100%;
            background: linear-gradient(135deg, #67c23a, #85ce61);
            border: none;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.4s ease;
            padding: 8px 0;
            font-size: 13px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(103, 194, 58, 0.3);
            
            &:hover {
              background: linear-gradient(135deg, #85ce61, #67c23a);
              box-shadow: 0 6px 15px rgba(103, 194, 58, 0.4);
              transform: translateY(-2px);
            }
            
            .el-icon {
              margin-right: 6px;
            }
          }
        }
      }
    }

    .pagination {
      margin-top: 40px;
      display: flex;
      justify-content: center;
      padding: 20px 0;
      
      :deep(.el-pagination) {
        --el-pagination-button-bg-color: white;
        --el-pagination-hover-color: #67c23a;
        
        .el-pagination__total,
        .el-pagination__sizes {
          margin-right: 16px;
        }
        
        .el-pager li {
          background-color: white;
          border-radius: 8px;
          margin: 0 6px;
          min-width: 32px;
          height: 32px;
          line-height: 32px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          
          &.is-active {
            background: linear-gradient(135deg, #67c23a, #85ce61);
            color: white;
            font-weight: 600;
            box-shadow: 0 4px 10px rgba(103, 194, 58, 0.3);
          }
          
          &:hover:not(.is-active) {
            color: #67c23a;
            background-color: rgba(103, 194, 58, 0.1);
            transform: translateY(-2px);
          }
        }
        
        .btn-prev,
        .btn-next {
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          
          &:hover {
            background-color: rgba(103, 194, 58, 0.1);
            transform: translateY(-2px);
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .products-container {
    padding: 16px 0;
    
    .products-content {
      flex-direction: column;
      padding: 0 12px;
    }
    
    .filters {
      width: 100%;
      position: static;
      margin-bottom: 20px;
    }
    
    .products-list {
      .products-header {
        flex-direction: column;
        gap: 14px;
        align-items: flex-start;
        
        h2 {
          font-size: 22px;
        }
        
        .search-container {
          width: 100%;
          flex-direction: column;
          align-items: stretch;
          
          .search-input {
            width: 100%;
          }
          
          .search-button {
            width: 100%;
          }
        }
      }
      
      .product-card {
        .product-image {
          height: 180px;
        }
        
        .product-info {
          .product-actions {
            .add-to-cart-btn {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

.search-suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .el-icon {
    color: #67c23a;
    font-size: 16px;
  }
  
  span {
    font-size: 14px;
  }
}

.quick-view-tags {
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.quick-view-dialog .el-tag) {
  border: none;
  padding: 4px 12px;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &.fresh {
    background: linear-gradient(135deg, #67c23a, #85ce61);
    color: white;
  }
  
  &.organic {
    background: linear-gradient(135deg, #409eff, #79bbff);
    color: white;
  }
  
  &.local {
    background: linear-gradient(135deg, #e6a23c, #f3d19e);
    color: white;
  }
  
  &.seasonal {
    background: linear-gradient(135deg, #f56c6c, #f89898);
    color: white;
  }
  
  &.premium {
    background: linear-gradient(135deg, #909399, #c8c9cc);
    color: white;
  }
}
</style> 
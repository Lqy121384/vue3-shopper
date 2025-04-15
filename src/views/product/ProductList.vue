<template>
  <div class="product-list">
    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索商品"
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>

      <el-select v-model="selectedCategory" placeholder="选择分类" @change="handleCategoryChange">
        <el-option label="全部" value="" />
        <el-option
          v-for="category in categories"
          :key="category.id"
          :label="category.name"
          :value="category.id"
        />
      </el-select>

      <el-select v-model="sortBy" placeholder="排序方式" @change="handleSortChange">
        <el-option label="默认排序" value="" />
        <el-option label="价格从低到高" value="price_asc" />
        <el-option label="价格从高到低" value="price_desc" />
        <el-option label="销量从高到低" value="sales_desc" />
      </el-select>
    </div>

    <!-- 商品列表 -->
    <el-row :gutter="20" class="product-grid">
      <el-col
        v-for="product in products"
        :key="product.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card :body-style="{ padding: '0px' }" class="product-card">
          <img :src="product.image || ''" class="product-image" />
          <div class="product-info">
            <h3 class="product-title">{{ product.name }}</h3>
            <p class="product-price">¥{{ product.price }}</p>
            <div class="product-footer">
              <span class="product-sales">销量: {{ product.sales }}</span>
              <el-button type="primary" size="small" @click="viewProduct(product.id)">
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getProductList, getCategories } from '@/api/product'
import type { Product, ProductCategory, ProductListResponse } from '@/types/product'

const router = useRouter()

// 状态变量
const products = ref<Product[]>([])
const categories = ref<ProductCategory[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const selectedCategory = ref('')
const searchQuery = ref('')
const sortBy = ref('')
const loading = ref(false)

// 获取商品列表
const fetchProducts = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      category: selectedCategory.value,
      search: searchQuery.value,
      sort: sortBy.value
    }
    const response = await getProductList(params)
    if (response.code === 0 && response.data) {
      const productListResponse = response.data as unknown as ProductListResponse
      products.value = productListResponse.list
      total.value = productListResponse.total
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

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await getCategories()
    if (response.code === 0 && response.data) {
      categories.value = response.data as unknown as ProductCategory[]
    } else {
      ElMessage.error(response.message || '获取分类列表失败')
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    ElMessage.error('获取分类列表失败')
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
}

// 处理分类变化
const handleCategoryChange = () => {
  currentPage.value = 1
  fetchProducts()
}

// 处理排序变化
const handleSortChange = () => {
  currentPage.value = 1
  fetchProducts()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchProducts()
}

// 处理每页数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchProducts()
}

// 查看商品详情
const viewProduct = (productId: string | number) => {
  router.push(`/products/${productId}`)
}

// 初始化
onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.product-grid {
  margin-bottom: 20px;
}

.product-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 14px;
}

.product-title {
  margin: 0;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-sales {
  color: #909399;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 
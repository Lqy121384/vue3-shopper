// 获取热门商品
const fetchHotProducts = async () => {
  try {
    const response = await getHotProducts()
    hotProducts.value = response.data
  } catch (error) {
    console.error('获取热门商品失败:', error)
    ElMessage.error('获取热门商品失败')
  }
} 
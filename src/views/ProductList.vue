const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await getProducts({
      page: currentPage.value,
      limit: pageSize.value,
      category: currentCategory.value,
      search: searchQuery.value,
      sort: currentSort.value
    });
    
    console.log('Products response:', response);
    console.log('Response data:', response.data);
    
    if (response.code === 0 && response.data) {
      products.value = response.data.list || [];
      total.value = response.data.total || 0;
    } else {
      ElMessage.error(response.message || '获取商品列表失败');
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
    ElMessage.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
}; 
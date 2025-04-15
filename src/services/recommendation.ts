import type { Product } from '@/types/product'
import type { UserBehavior } from '@/types/userBehavior'
import { mockData } from '@/mock/data'
import request from '@/utils/request'

// 计算商品相似度
function calculateSimilarity(product1: Product, product2: Product): number {
  let score = 0
  
  // 相同类别权重最高
  if (product1.categoryId === product2.categoryId) {
    score += 0.8  // 增加同类别的权重
  }
  
  // 标签匹配度
  const tags1 = product1.tags || []
  const tags2 = product2.tags || []
  const commonTags = tags1.filter(tag => tags2.includes(tag))
  score += (commonTags.length / Math.max(tags1.length, tags2.length)) * 0.15
  
  // 价格区间相似度
  const priceDiff = Math.abs(product1.price - product2.price)
  const avgPrice = (product1.price + product2.price) / 2
  score += (1 - priceDiff / avgPrice) * 0.05
  
  return score
}

// 获取相似商品推荐
export function getSimilarProducts(
  currentProduct: Product,
  allProducts: Product[],
  pageSize: number = 4
): Product[] {
  // 排除当前商品
  const otherProducts = allProducts.filter(p => p.id !== currentProduct.id)
  
  // 计算每个商品与当前商品的相似度
  const productsWithScore = otherProducts.map(product => ({
    product,
    score: calculateSimilarity(currentProduct, product)
  }))
  
  // 按相似度排序并返回前N个
  return productsWithScore
    .sort((a, b) => b.score - a.score)
    .slice(0, pageSize)
    .map(item => item.product)
}

// 获取同类别热门商品
export function getPopularInCategory(
  categoryId: string,
  allProducts: Product[],
  pageSize: number = 4
): Product[] {
  // 先按类别筛选，然后按销量和评分排序
  return allProducts
    .filter(p => p.categoryId === categoryId)
    .sort((a, b) => {
      // 销量权重 0.7，评分权重 0.3
      const scoreA = a.sales * 0.7 + a.rating * 0.3
      const scoreB = b.sales * 0.7 + b.rating * 0.3
      return scoreB - scoreA
    })
    .slice(0, pageSize)
}

// 协同过滤推荐 - 基于用户的协同过滤
export function getUserBasedCF(
  userId: string,
  allProducts: Product[],
  pageSize: number = 4
): Product[] {
  // 获取用户行为数据
  const userBehaviors = mockData.userBehaviors
  
  // 如果没有用户行为数据，返回空数组
  if (userBehaviors.length === 0) {
    return []
  }
  
  // 获取当前用户的行为
  const currentUserBehaviors = userBehaviors.filter(behavior => behavior.userId === userId)
  
  // 如果没有当前用户的行为数据，返回空数组
  if (currentUserBehaviors.length === 0) {
    return []
  }
  
  // 获取当前用户交互过的商品ID
  const userProductIds = new Set(currentUserBehaviors.map(behavior => behavior.productId))
  
  // 计算用户相似度
  const userSimilarities = new Map<string, number>()
  
  // 获取所有用户ID
  const allUserIds = new Set(userBehaviors.map(behavior => behavior.userId))
  
  // 对每个其他用户计算相似度
  allUserIds.forEach(otherUserId => {
    if (otherUserId === userId) return
    
    // 获取其他用户的行为
    const otherUserBehaviors = userBehaviors.filter(behavior => behavior.userId === otherUserId)
    
    // 获取其他用户交互过的商品ID
    const otherUserProductIds = new Set(otherUserBehaviors.map(behavior => behavior.productId))
    
    // 计算交集大小
    const intersection = new Set([...userProductIds].filter(id => otherUserProductIds.has(id)))
    
    // 计算并集大小
    const union = new Set([...userProductIds, ...otherUserProductIds])
    
    // 计算Jaccard相似度
    const similarity = intersection.size / union.size
    
    // 存储相似度
    userSimilarities.set(otherUserId, similarity)
  })
  
  // 获取相似用户交互过的商品
  const similarUserProducts = new Map<string, number>()
  
  // 对每个相似用户
  userSimilarities.forEach((similarity, similarUserId) => {
    // 获取相似用户的行为
    const similarUserBehaviors = userBehaviors.filter(behavior => behavior.userId === similarUserId)
    
    // 对每个行为
    similarUserBehaviors.forEach(behavior => {
      // 如果当前用户没有交互过该商品
      if (!userProductIds.has(behavior.productId)) {
        // 根据行为类型赋予不同权重
        let weight = 0
        switch (behavior.behaviorType) {
          case 'view':
            weight = 1
            break
          case 'favorite':
            weight = 3
            break
          case 'cart':
            weight = 5
            break
          case 'purchase':
            weight = 10
            break
        }
        
        // 计算加权分数
        const score = similarity * weight
        
        // 累加分数
        similarUserProducts.set(
          behavior.productId, 
          (similarUserProducts.get(behavior.productId) || 0) + score
        )
      }
    })
  })
  
  // 将Map转换为数组并排序
  const sortedProducts = Array.from(similarUserProducts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
  
  // 获取推荐商品
  const recommendedProductIds = sortedProducts.slice(0, pageSize)
  
  // 返回推荐商品
  return allProducts.filter(product => recommendedProductIds.includes(product.id))
}

// 协同过滤推荐 - 基于物品的协同过滤
export function getItemBasedCF(
  productId: string,
  allProducts: Product[],
  pageSize: number = 4
): Product[] {
  // 获取用户行为数据
  const userBehaviors = mockData.userBehaviors
  
  // 如果没有用户行为数据，返回空数组
  if (userBehaviors.length === 0) {
    return []
  }
  
  // 获取与当前商品交互过的用户
  const productUsers = userBehaviors
    .filter(behavior => behavior.productId === productId)
    .map(behavior => behavior.userId)
  
  // 如果没有与当前商品交互过的用户，返回空数组
  if (productUsers.length === 0) {
    return []
  }
  
  // 计算商品相似度
  const productSimilarities = new Map<string, number>()
  
  // 获取所有商品ID
  const allProductIds = new Set(userBehaviors.map(behavior => behavior.productId))
  
  // 对每个其他商品计算相似度
  allProductIds.forEach(otherProductId => {
    if (otherProductId === productId) return
    
    // 获取与其他商品交互过的用户
    const otherProductUsers = userBehaviors
      .filter(behavior => behavior.productId === otherProductId)
      .map(behavior => behavior.userId)
    
    // 计算交集大小
    const intersection = new Set([...productUsers].filter(id => otherProductUsers.includes(id)))
    
    // 计算并集大小
    const union = new Set([...productUsers, ...otherProductUsers])
    
    // 计算Jaccard相似度
    const similarity = intersection.size / union.size
    
    // 存储相似度
    productSimilarities.set(otherProductId, similarity)
  })
  
  // 将Map转换为数组并排序
  const sortedProducts = Array.from(productSimilarities.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
  
  // 获取推荐商品
  const recommendedProductIds = sortedProducts.slice(0, pageSize)
  
  // 返回推荐商品
  return allProducts.filter(product => recommendedProductIds.includes(product.id))
}

// 图神经网络推荐
export function getGNNRecommendations(
  productId: string,
  allProducts: Product[],
  pageSize: number = 4
): Product[] {
  // 获取用户行为数据
  const userBehaviors = mockData.userBehaviors
  
  // 如果没有用户行为数据，返回空数组
  if (userBehaviors.length === 0) {
    return []
  }
  
  // 构建商品-用户二分图
  const productUserGraph = new Map<string, Set<string>>()
  const userProductGraph = new Map<string, Set<string>>()
  
  // 初始化图
  userBehaviors.forEach(behavior => {
    // 初始化商品-用户图
    if (!productUserGraph.has(behavior.productId)) {
      productUserGraph.set(behavior.productId, new Set())
    }
    productUserGraph.get(behavior.productId)?.add(behavior.userId)
    
    // 初始化用户-商品图
    if (!userProductGraph.has(behavior.userId)) {
      userProductGraph.set(behavior.userId, new Set())
    }
    userProductGraph.get(behavior.userId)?.add(behavior.productId)
  })
  
  // 模拟GNN传播过程
  const productScores = new Map<string, number>()
  
  // 初始化当前商品分数为1
  productScores.set(productId, 1)
  
  // 第一层传播：商品 -> 用户
  const userScores = new Map<string, number>()
  
  // 获取与当前商品交互过的用户
  const connectedUsers = productUserGraph.get(productId) || new Set()
  
  // 计算用户分数
  connectedUsers.forEach(userId => {
    userScores.set(userId, 1 / connectedUsers.size)
  })
  
  // 第二层传播：用户 -> 商品
  userScores.forEach((score, userId) => {
    // 获取用户交互过的商品
    const userProducts = userProductGraph.get(userId) || new Set()
    
    // 计算商品分数
    userProducts.forEach(otherProductId => {
      if (otherProductId !== productId) {
        productScores.set(
          otherProductId,
          (productScores.get(otherProductId) || 0) + score / userProducts.size
        )
      }
    })
  })
  
  // 将Map转换为数组并排序
  const sortedProducts = Array.from(productScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
  
  // 获取推荐商品
  const recommendedProductIds = sortedProducts.slice(0, pageSize)
  
  // 返回推荐商品
  return allProducts.filter(product => recommendedProductIds.includes(product.id))
}

/**
 * 基于类别的推荐
 * @param currentProduct 当前商品
 * @param allProducts 所有商品
 * @param pageSize 推荐数量
 * @returns 推荐商品列表
 */
const categoryBasedRecommend = (
  currentProduct: Product,
  allProducts: Product[],
  pageSize: number = 4
): Product[] => {
  // 获取同类商品
  const sameCategoryProducts = allProducts.filter(
    product => product.categoryId === currentProduct.categoryId && product.id !== currentProduct.id
  )
  
  // 按销量排序
  return sameCategoryProducts
    .sort((a, b) => b.sales - a.sales)
    .slice(0, pageSize)
}

/**
 * 基于用户行为的协同过滤推荐
 * @param userId 用户ID
 * @param allProducts 所有商品
 * @param pageSize 推荐数量
 * @returns 推荐商品列表
 */
const userBasedCollaborativeFiltering = (
  userId: string,
  allProducts: Product[],
  pageSize: number = 4
): Product[] => {
  // 获取用户行为数据
  const userBehaviors = mockData.userBehaviors.filter(behavior => behavior.userId === userId)
  
  if (userBehaviors.length === 0) {
    return []
  }
  
  // 获取用户喜欢的商品类别
  const userFavoriteCategories = new Set<string>()
  userBehaviors.forEach(behavior => {
    const product = allProducts.find(p => p.id === behavior.productId)
    if (product?.categoryId) {
      userFavoriteCategories.add(product.categoryId)
    }
  })
  
  // 推荐同类别的商品
  const recommendedProducts = allProducts.filter(product => 
    product.categoryId && userFavoriteCategories.has(product.categoryId) && 
    !userBehaviors.some(behavior => behavior.productId === product.id)
  )
  
  // 按评分排序
  return recommendedProducts
    .sort((a, b) => b.rating - a.rating)
    .slice(0, pageSize)
}

/**
 * 基于商品相似度的协同过滤推荐
 * @param currentProduct 当前商品
 * @param allProducts 所有商品
 * @param pageSize 推荐数量
 * @returns 推荐商品列表
 */
const itemBasedCollaborativeFiltering = (
  currentProduct: Product,
  allProducts: Product[],
  pageSize: number = 4
): Product[] => {
  // 计算商品相似度
  const productSimilarities = allProducts
    .filter(product => product.id !== currentProduct.id)
    .map(product => {
      // 基于类别的相似度
      const categorySimilarity = product.categoryId === currentProduct.categoryId ? 1 : 0
      
      // 基于标签的相似度
      const productTags = product.tags || []
      const currentProductTags = currentProduct.tags || []
      const commonTags = productTags.filter(tag => currentProductTags.includes(tag))
      const tagSimilarity = commonTags.length / Math.max(productTags.length, currentProductTags.length)
      
      // 基于价格的相似度
      const priceDiff = Math.abs(product.price - currentProduct.price)
      const maxPrice = Math.max(product.price, currentProduct.price)
      const priceSimilarity = 1 - (priceDiff / maxPrice)
      
      // 综合相似度
      const similarity = (categorySimilarity * 0.5) + (tagSimilarity * 0.3) + (priceSimilarity * 0.2)
      
      return { product, similarity }
    })
  
  // 按相似度排序
  return productSimilarities
    .sort((a, b) => b.similarity - a.similarity)
    .map(item => item.product)
    .slice(0, pageSize)
}

/**
 * 基于图神经网络的推荐
 * @param currentProduct 当前商品
 * @param allProducts 所有商品
 * @param pageSize 推荐数量
 * @returns 推荐商品列表
 */
const graphNeuralNetworkRecommend = (
  currentProduct: Product,
  allProducts: Product[],
  pageSize: number = 4
): Product[] => {
  // 构建商品图
  const productGraph = new Map<string, Set<string>>()
  
  // 初始化图
  allProducts.forEach(product => {
    productGraph.set(product.id, new Set())
  })
  
  // 添加边（基于用户行为）
  mockData.userBehaviors.forEach(behavior => {
    if (behavior.behaviorType === 'purchase' || behavior.behaviorType === 'cart') {
      // 获取同一用户购买的其他商品
      const userBehaviors = mockData.userBehaviors.filter(
        b => b.userId === behavior.userId && 
        b.productId !== behavior.productId && 
        (b.behaviorType === 'purchase' || b.behaviorType === 'cart')
      )
      
      userBehaviors.forEach(otherBehavior => {
        const set1 = productGraph.get(behavior.productId)
        const set2 = productGraph.get(otherBehavior.productId)
        
        if (set1 && set2) {
          set1.add(otherBehavior.productId)
          set2.add(behavior.productId)
        }
      })
    }
  })
  
  // 添加边（基于类别）
  allProducts.forEach(product1 => {
    allProducts.forEach(product2 => {
      if (product1.id !== product2.id && product1.categoryId === product2.categoryId) {
        const set1 = productGraph.get(product1.id)
        const set2 = productGraph.get(product2.id)
        
        if (set1 && set2) {
          set1.add(product2.id)
          set2.add(product1.id)
        }
      }
    })
  })
  
  // 添加边（基于标签）
  allProducts.forEach(product1 => {
    allProducts.forEach(product2 => {
      if (product1.id !== product2.id) {
        const product1Tags = product1.tags || []
        const product2Tags = product2.tags || []
        const commonTags = product1Tags.filter(tag => product2Tags.includes(tag))
        if (commonTags.length > 0) {
          const set1 = productGraph.get(product1.id)
          const set2 = productGraph.get(product2.id)
          
          if (set1 && set2) {
            set1.add(product2.id)
            set2.add(product1.id)
          }
        }
      }
    })
  })
  
  // 从当前商品开始进行随机游走
  const visited = new Set<string>()
  const candidates = new Map<string, number>()
  
  const randomWalk = (productId: string, depth: number = 0, maxDepth: number = 3) => {
    if (depth >= maxDepth || visited.has(productId)) {
      return
    }
    
    visited.add(productId)
    
    const neighbors = productGraph.get(productId)
    if (!neighbors) {
      return
    }
    
    // 记录候选商品
    neighbors.forEach(neighborId => {
      if (neighborId !== currentProduct.id) {
        candidates.set(neighborId, (candidates.get(neighborId) || 0) + 1)
      }
    })
    
    // 随机选择邻居继续游走
    const neighborArray = Array.from(neighbors)
    if (neighborArray.length > 0) {
      const randomNeighbor = neighborArray[Math.floor(Math.random() * neighborArray.length)]
      randomWalk(randomNeighbor, depth + 1, maxDepth)
    }
  }
  
  // 从当前商品开始随机游走
  randomWalk(currentProduct.id)
  
  // 获取候选商品
  const candidateProducts = Array.from(candidates.entries())
    .map(([id, score]) => {
      const product = allProducts.find(p => p.id === id)
      return { product, score }
    })
    .filter(item => item.product !== undefined)
    .map(item => ({ product: item.product as Product, score: item.score }))
  
  // 按分数排序
  return candidateProducts
    .sort((a, b) => b.score - a.score)
    .map(item => item.product)
    .slice(0, pageSize)
}

/**
 * 获取衍生品推荐
 * @param currentProduct 当前商品
 * @param allProducts 所有商品
 * @param pageSize 推荐数量
 * @returns 推荐商品列表
 */
const getDerivativeProducts = (
  currentProduct: Product,
  allProducts: Product[],
  pageSize: number = 4
): Product[] => {
  // 基于当前商品的类别和标签推荐衍生品
  const currentProductTags = currentProduct.tags || []
  const derivativeProducts = allProducts.filter(product => 
    product.id !== currentProduct.id && 
    (product.categoryId === currentProduct.categoryId || 
     (product.tags || []).some(tag => currentProductTags.includes(tag)))
  )
  
  // 按评分和销量排序
  return derivativeProducts
    .sort((a, b) => (b.rating * 0.7 + b.sales * 0.3) - (a.rating * 0.7 + a.sales * 0.3))
    .slice(0, pageSize)
}

/**
 * 获取组合配套推荐
 * @param currentProduct 当前商品
 * @param allProducts 所有商品
 * @param pageSize 推荐数量
 * @returns 推荐商品列表
 */
const getComboProducts = (
  currentProduct: Product,
  allProducts: Product[],
  pageSize: number = 4
): Product[] => {
  // 定义常见的组合配套关系
  const comboRelations: Record<string, string[]> = {
    // 水果类组合
    '1': ['8', '7'], // 水果 + 饮料/零食
    // 蔬菜类组合
    '2': ['3', '4'], // 蔬菜 + 粮油/肉禽
    // 粮油调味组合
    '3': ['2', '4'], // 粮油 + 蔬菜/肉禽
    // 肉禽蛋品组合
    '4': ['2', '3'], // 肉禽 + 蔬菜/粮油
    // 水产海鲜组合
    '5': ['2', '3'], // 水产 + 蔬菜/粮油
    // 乳品烘焙组合
    '6': ['7', '8'], // 乳品 + 零食/饮料
    // 休闲零食组合
    '7': ['8', '6'], // 零食 + 饮料/乳品
    // 茶酒饮料组合
    '8': ['7', '6']  // 饮料 + 零食/乳品
  }
  
  // 获取当前商品类别的配套类别
  const comboCategories = comboRelations[currentProduct.categoryId] || []
  
  // 获取配套类别的商品
  const comboProducts = allProducts.filter(product => 
    product.id !== currentProduct.id && 
    comboCategories.includes(product.categoryId)
  )
  
  // 按评分和销量排序
  return comboProducts
    .sort((a, b) => (b.rating * 0.7 + b.sales * 0.3) - (a.rating * 0.7 + a.sales * 0.3))
    .slice(0, pageSize)
}

/**
 * 获取推荐商品
 * @param currentProduct 当前商品
 * @param allProducts 所有商品
 * @param pageSize 推荐数量
 * @param userId 用户ID（可选）
 * @returns 推荐商品列表
 */
export function getRecommendations(
  currentProduct: Product,
  allProducts: Product[],
  pageSize: number = 4,
  userId?: string
): Product[] {
  // 获取各种推荐结果
  const categoryBased = categoryBasedRecommend(currentProduct, allProducts, pageSize)
  const itemBased = itemBasedCollaborativeFiltering(currentProduct, allProducts, pageSize)
  const graphBased = graphNeuralNetworkRecommend(currentProduct, allProducts, pageSize)
  const derivativeBased = getDerivativeProducts(currentProduct, allProducts, pageSize)
  const comboBased = getComboProducts(currentProduct, allProducts, pageSize)
  
  // 如果有用户ID，获取基于用户的推荐
  let userBased: Product[] = []
  if (userId) {
    userBased = userBasedCollaborativeFiltering(userId, allProducts, pageSize)
  }
  
  // 合并所有推荐结果
  const allRecommendations = [
    ...categoryBased,
    ...itemBased,
    ...graphBased,
    ...derivativeBased,
    ...comboBased,
    ...userBased
  ]
  
  // 去重
  const uniqueRecommendations = Array.from(
    new Map(allRecommendations.map(item => [item.id, item])).values()
  )
  
  // 按评分和销量排序
  return uniqueRecommendations
    .sort((a, b) => (b.rating * 0.7 + b.sales * 0.3) - (a.rating * 0.7 + a.sales * 0.3))
    .slice(0, pageSize)
}

// 获取推荐商品
export async function getRecommendedProducts(params: any) {
  return request.get('/api/recommendations/products', { params })
}

// 获取相关商品
export async function getRelatedProducts(productId: string, params: any) {
  return request.get(`/api/recommendations/products/${productId}/related`, { params })
}

// 获取个性化推荐
export async function getPersonalizedRecommendations(params: any) {
  return request.get('/api/recommendations/personalized', { params })
}

// 获取相似商品推荐
export function getSimilarProductsByFeatures(
  currentProduct: Product,
  allProducts: Product[],
  limit: number = 4
): Product[] {
  // 计算商品相似度
  const similarities = allProducts.map(product => {
    if (product.id === currentProduct.id) return { product, similarity: 0 };
    
    let similarity = 0;
    
    // 1. 类别相似度
    if (product.categoryId === currentProduct.categoryId) {
      similarity += 0.4;
    }
    
    // 2. 价格相似度
    const priceDiff = Math.abs(product.price - currentProduct.price);
    const maxPrice = Math.max(product.price, currentProduct.price);
    const priceSimilarity = 1 - (priceDiff / maxPrice);
    similarity += priceSimilarity * 0.3;
    
    // 3. 标签相似度
    const productTags = product.tags || [];
    const currentProductTags = currentProduct.tags || [];
    const commonTags = productTags.filter(tag => currentProductTags.includes(tag));
    const tagSimilarity = commonTags.length / Math.max(productTags.length, currentProductTags.length);
    similarity += tagSimilarity * 0.3;
    
    return { product, similarity };
  });
  
  // 按相似度排序并返回前limit个商品
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.product);
} 
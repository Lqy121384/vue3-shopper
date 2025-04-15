import type { Product } from '@/types/product';

interface SimilarityScore {
  productId: string;
  score: number;
}

export class ProductSimilarityCalculator {
  // 计算两个商品之间的相似度
  static calculateSimilarity(product1: Product, product2: Product): number {
    let score = 0;
    let totalWeight = 0;

    // 1. 类别相似度 (权重: 0.4)
    if (product1.category === product2.category) {
      score += 0.4;
    }
    totalWeight += 0.4;

    // 2. 价格区间相似度 (权重: 0.2)
    const priceDiff = Math.abs(product1.price - product2.price);
    const avgPrice = (product1.price + product2.price) / 2;
    const priceSimilarity = avgPrice > 0 ? 1 - (priceDiff / avgPrice) : 0;
    score += priceSimilarity * 0.2;
    totalWeight += 0.2;

    // 3. 产地相似度 (权重: 0.2)
    if (product1.originPlace && product2.originPlace && product1.originPlace === product2.originPlace) {
      score += 0.2;
    }
    totalWeight += 0.2;

    // 4. 有机属性相似度 (权重: 0.1)
    if (typeof product1.isOrganic === 'boolean' && typeof product2.isOrganic === 'boolean' && 
        product1.isOrganic === product2.isOrganic) {
      score += 0.1;
    }
    totalWeight += 0.1;

    // 5. 保质期相似度 (权重: 0.1)
    if (product1.shelfLife && product2.shelfLife) {
      const shelfLifeDiff = Math.abs(product1.shelfLife - product2.shelfLife);
      const avgShelfLife = (product1.shelfLife + product2.shelfLife) / 2;
      const shelfLifeSimilarity = avgShelfLife > 0 ? 1 - (shelfLifeDiff / avgShelfLife) : 0;
      score += shelfLifeSimilarity * 0.1;
    }
    totalWeight += 0.1;

    // 返回归一化的相似度分数
    return totalWeight > 0 ? score / totalWeight : 0;
  }

  // 为指定商品找到最相似的商品
  static findMostSimilarProducts(
    targetProduct: Product,
    allProducts: Product[],
    limit: number = 5
  ): SimilarityScore[] {
    if (!targetProduct || !allProducts || !Array.isArray(allProducts)) {
      return [];
    }

    const similarities: SimilarityScore[] = allProducts
      .filter(p => p && p._id && targetProduct._id && p._id.toString() !== targetProduct._id.toString())
      .map(product => ({
        productId: product._id.toString(),
        score: this.calculateSimilarity(targetProduct, product)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return similarities;
  }

  // 生成组合商品
  static generateCombinations(products: Product[]): Array<{
    mainProduct: Product;
    relatedProduct: Product;
    combinedPrice: number;
    discount: number;
  }> {
    if (!products || !Array.isArray(products) || products.length === 0) {
      console.warn('No valid products array provided to generateCombinations');
      return [];
    }

    const combinations: Array<{
      mainProduct: Product;
      relatedProduct: Product;
      combinedPrice: number;
      discount: number;
    }> = [];

    products.forEach(product => {
      if (!product || !product._id) {
        return;
      }

      const similarProducts = this.findMostSimilarProducts(product, products, 1);
      if (similarProducts.length > 0) {
        const relatedProduct = products.find(
          p => p && p._id && p._id.toString() === similarProducts[0].productId
        );
        if (relatedProduct) {
          const originalTotalPrice = product.price + relatedProduct.price;
          // 组合价格设置为原价的85%
          const combinedPrice = originalTotalPrice * 0.85;
          const discount = 15; // 15%折扣

          combinations.push({
            mainProduct: product,
            relatedProduct,
            combinedPrice,
            discount
          });
        }
      }
    });

    return combinations;
  }
} 
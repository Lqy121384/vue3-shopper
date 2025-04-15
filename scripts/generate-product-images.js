const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// 商品图片配置
const PRODUCTS = [
  { name: '新鲜苹果', color: '#FFE5E5', emoji: '🍎' },
  { name: '有机胡萝卜', color: '#FFE8D6', emoji: '🥕' },
  { name: '新鲜香蕉', color: '#FFF9C4', emoji: '🍌' },
  { name: '有机西红柿', color: '#FFCDD2', emoji: '🍅' },
  { name: '新鲜橙子', color: '#FFE0B2', emoji: '🍊' },
  { name: '有机生菜', color: '#E8F5E9', emoji: '🥬' },
  { name: '新鲜葡萄', color: '#E1BEE7', emoji: '🍇' },
  { name: '有机土豆', color: '#FFE0B2', emoji: '🥔' },
  { name: '新鲜草莓', color: '#FFCDD2', emoji: '🍓' },
  { name: '有机黄瓜', color: '#C8E6C9', emoji: '🥒' }
];

const WIDTH = 400;
const HEIGHT = 300;

async function generateImage(config, index) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // 设置背景色
  ctx.fillStyle = config.color;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 添加商品名称
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.name, WIDTH / 2, HEIGHT / 2 - 40);

  // 添加 emoji
  ctx.font = '64px Arial';
  ctx.fillText(config.emoji, WIDTH / 2, HEIGHT / 2 + 40);

  // 添加装饰性边框
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, WIDTH - 40, HEIGHT - 40);

  // 保存图片
  const outputDir = path.join(__dirname, '../public/images/products');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  const outputPath = path.join(outputDir, `product-${index + 1}.jpg`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`生成商品图片: ${outputPath}`);

  return `/images/products/product-${index + 1}.jpg`;
}

// 生成所有商品图片
async function generateAllImages() {
  const images = [];
  for (let i = 0; i < PRODUCTS.length; i++) {
    const imagePath = await generateImage(PRODUCTS[i], i);
    images.push(imagePath);
  }
  return images;
}

// 执行生成
generateAllImages().then(images => {
  console.log('所有商品图片生成完成！');
  console.log('图片路径列表:', images);
}); 
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const IMAGES = [
  { name: 'fruit1.jpg', text: '新鲜水果 1', color: '#FFE5E5' },
  { name: 'fruit2.jpg', text: '新鲜水果 2', color: '#FFD6D6' },
  { name: 'fruit3.jpg', text: '新鲜水果 3', color: '#FFC7C7' },
  { name: 'vegetable1.jpg', text: '新鲜蔬菜 1', color: '#E5FFE5' },
  { name: 'vegetable2.jpg', text: '新鲜蔬菜 2', color: '#D6FFD6' },
  { name: 'vegetable3.jpg', text: '新鲜蔬菜 3', color: '#C7FFC7' },
];

const WIDTH = 400;
const HEIGHT = 300;

function generateImage(config) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // 设置背景色
  ctx.fillStyle = config.color;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 添加文字
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.text, WIDTH / 2, HEIGHT / 2);

  // 保存图片
  const buffer = canvas.toBuffer('image/jpeg');
  const outputPath = path.join(__dirname, '../public/images/products', config.name);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${config.name}`);
}

// 确保目录存在
const outputDir = path.join(__dirname, '../public/images/products');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 生成所有图片
IMAGES.forEach(generateImage); 
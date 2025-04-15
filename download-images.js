const https = require('https');
const fs = require('fs');
const path = require('path');

// 创建目录
const imagesDir = path.join(__dirname, 'public', 'images', 'products');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// 示例图片列表
const images = [
  {
    name: 'strawberry.jpg',
    url: 'https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg'
  },
  {
    name: 'strawberry-1.jpg',
    url: 'https://images.pexels.com/photos/70746/strawberries-red-fruit-royalty-free-70746.jpeg'
  },
  {
    name: 'strawberry-2.jpg',
    url: 'https://images.pexels.com/photos/934066/pexels-photo-934066.jpeg'
  },
  {
    name: 'strawberry-3.jpg',
    url: 'https://images.pexels.com/photos/1120970/pexels-photo-1120970.jpeg'
  }
];

// 下载图片
images.forEach(image => {
  const filePath = path.join(imagesDir, image.name);
  https.get(image.url, response => {
    const fileStream = fs.createWriteStream(filePath);
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      console.log(`Downloaded: ${image.name}`);
    });
  }).on('error', err => {
    console.error(`Error downloading ${image.name}:`, err);
  });
}); 
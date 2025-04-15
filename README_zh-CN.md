# Vue 3 + TypeScript + Vite

一个基于 Vue 3、TypeScript 和 Vite 的农产品商城模板。

## 特性

- 🚀 Vue 3 + TypeScript + Vite
- 🎨 Element Plus UI 框架
- 📦 Pinia 状态管理
- 🛣️ Vue Router 路由管理
- 🔒 JWT 认证
- 📱 响应式设计
- 🧪 Vitest 单元测试
- 📝 ESLint + Prettier 代码规范

## 前置要求

- Node.js >= 16
- npm >= 7

## 开始使用

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/vue-ecommerce.git
cd vue-ecommerce
```

2. 安装依赖：
```bash
npm install
```

3. 创建环境文件：
```bash
cp .env.example .env
cp .env.example .env.development
cp .env.example .env.production
```

4. 启动开发服务器：
```bash
npm run dev
```

5. 构建生产版本：
```bash
npm run build
```

6. 预览生产构建：
```bash
npm run preview
```

## 项目结构

```
src/
├── api/          # API 服务
├── assets/       # 静态资源
├── components/   # 可复用组件
├── layouts/      # 布局组件
├── router/       # Vue Router 配置
├── stores/       # Pinia 状态管理
├── styles/       # 全局样式
├── types/        # TypeScript 类型定义
├── utils/        # 工具函数
└── views/        # 页面组件
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run type-check` - 类型检查
- `npm run lint` - 代码检查
- `npm run format` - 代码格式化
- `npm run test` - 运行单元测试
- `npm run test:coverage` - 运行单元测试并生成覆盖率报告

## 环境变量

在根目录创建 `.env` 文件，包含以下变量：

```env
VITE_APP_TITLE=农产品商城
VITE_APP_DESCRIPTION=一个基于 Vue 3 + TypeScript + Vite 的农产品商城模板
VITE_API_BASE_URL=http://localhost:3000
VITE_UPLOAD_URL=http://localhost:3000/api/upload
VITE_PAYMENT_CALLBACK_URL=http://localhost:5173/payment/callback
VITE_DEVTOOLS=true
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加一些特性'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
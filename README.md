# Vue 3 + TypeScript + Vite

A Vue 3 e-commerce template built with TypeScript and Vite.

## Features

- 🚀 Vue 3 + TypeScript + Vite
- 🎨 Element Plus UI Framework
- 📦 Pinia for State Management
- 🛣️ Vue Router for Navigation
- 🔒 JWT Authentication
- 📱 Responsive Design
- 🧪 Unit Testing with Vitest
- 📝 ESLint + Prettier for Code Quality

## Prerequisites

- Node.js >= 16
- npm >= 7

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vue-ecommerce.git
cd vue-ecommerce
```

2. Install dependencies:
```bash
npm install
```

3. Create environment files:
```bash
cp .env.example .env
cp .env.example .env.development
cp .env.example .env.production
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

6. Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── api/          # API services
├── assets/       # Static assets
├── components/   # Reusable components
├── layouts/      # Layout components
├── router/       # Vue Router configuration
├── stores/       # Pinia stores
├── styles/       # Global styles
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
└── views/        # Page components
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Type check
- `npm run lint` - Lint code
- `npm run format` - Format code
- `npm run test` - Run unit tests
- `npm run test:coverage` - Run unit tests with coverage

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_APP_TITLE=Your App Title
VITE_APP_DESCRIPTION=Your App Description
VITE_API_BASE_URL=http://localhost:3000
VITE_UPLOAD_URL=http://localhost:3000/api/upload
VITE_PAYMENT_CALLBACK_URL=http://localhost:5173/payment/callback
VITE_DEVTOOLS=true
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

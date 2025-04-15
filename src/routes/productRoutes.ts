import express from 'express'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} from '../controllers/productController'
import auth from '../middleware/auth'

const router = express.Router()

// 公开路由
router.get('/', getProducts)
router.get('/categories', getCategories)
router.get('/:id', getProductById)

// 需要认证的路由
router.post('/', auth, createProduct)
router.put('/:id', auth, updateProduct)
router.delete('/:id', auth, deleteProduct)

export default router 
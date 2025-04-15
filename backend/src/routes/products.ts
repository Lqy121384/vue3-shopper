import express from 'express'
import { auth } from '../middleware/auth'
import { Product } from '../models/product'

const router = express.Router()

/**
 * @swagger
 * /products:
 *   get:
 *     summary: 获取商品列表
 *     tags: [商品]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 商品分类
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 总商品数
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           description:
 *                             type: string
 *                           image:
 *                             type: string
 *                           category:
 *                             type: string
 *                           stock:
 *                             type: integer
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sort } = req.query
    const query: any = { status: 'on_sale' }

    // 添加分类筛选
    if (category) {
      query.category = category
    }

    // 添加搜索条件
    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') }
      ]
    }

    // 构建排序条件
    let sortOption: any = { createdAt: -1 }
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOption = { price: 1 }
          break
        case 'price_desc':
          sortOption = { price: -1 }
          break
        case 'sales_desc':
          sortOption = { sales: -1 }
          break
        case 'rating_desc':
          sortOption = { rating: -1 }
          break
      }
    }

    // 执行查询
    const skip = (Number(page) - 1) * Number(limit)
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .exec(),
      Product.countDocuments(query)
    ])

    res.json({
      code: 0,
      data: {
        list: products,
        total,
        page: Number(page),
        pageSize: Number(limit)
      }
    })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    res.status(500).json({
      code: 1,
      message: '获取商品列表失败'
    })
  }
})

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: 获取商品详情
 *     tags: [商品]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                     category:
 *                       type: string
 *                     stock:
 *                       type: integer
 *       404:
 *         description: 商品不存在
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      status: 'on_sale'
    })

    if (!product) {
      return res.status(404).json({
        code: 1,
        message: '商品不存在'
      })
    }

    res.json({
      code: 0,
      data: product
    })
  } catch (error) {
    console.error('获取商品详情失败:', error)
    res.status(500).json({
      code: 1,
      message: '获取商品详情失败'
    })
  }
})

/**
 * @swagger
 * /products:
 *   post:
 *     summary: 创建商品
 *     tags: [商品]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *               - category
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 description: 商品名称
 *               price:
 *                 type: number
 *                 description: 商品价格
 *               description:
 *                 type: string
 *                 description: 商品描述
 *               image:
 *                 type: string
 *                 description: 商品图片URL
 *               category:
 *                 type: string
 *                 description: 商品分类
 *               stock:
 *                 type: integer
 *                 description: 库存数量
 *     responses:
 *       200:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: 创建成功
 *       401:
 *         description: 未授权
 */
router.post('/', auth, (req, res) => {
  // TODO: 实现创建商品的逻辑
})

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: 更新商品
 *     tags: [商品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 商品名称
 *               price:
 *                 type: number
 *                 description: 商品价格
 *               description:
 *                 type: string
 *                 description: 商品描述
 *               image:
 *                 type: string
 *                 description: 商品图片URL
 *               category:
 *                 type: string
 *                 description: 商品分类
 *               stock:
 *                 type: integer
 *                 description: 库存数量
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: 更新成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 商品不存在
 */
router.put('/:id', auth, (req, res) => {
  // TODO: 实现更新商品的逻辑
})

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: 删除商品
 *     tags: [商品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: 删除成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 商品不存在
 */
router.delete('/:id', auth, (req, res) => {
  // TODO: 实现删除商品的逻辑
})

export default router 
import express from 'express'
import { auth } from '../middleware/auth'
import { Category } from '../models/category'

const router = express.Router()

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: 获取商品分类列表
 *     tags: [分类]
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       parentId:
 *                         type: string
 *                       level:
 *                         type: integer
 *                       sort:
 *                         type: integer
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sort: 1, createdAt: -1 })
      .select('-__v')
    
    // 构建分类树
    const categoryTree = buildCategoryTree(categories)
    
    res.json({
      code: 0,
      message: 'success',
      data: categoryTree
    })
  } catch (error) {
    console.error('获取分类列表失败:', error)
    res.status(500).json({
      code: 1,
      message: '获取分类列表失败',
      data: null
    })
  }
})

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: 获取商品分类详情
 *     tags: [分类]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 分类ID
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
 *                     description:
 *                       type: string
 *                     parentId:
 *                       type: string
 *                     level:
 *                       type: integer
 *                     sort:
 *                       type: integer
 *                     children:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           parentId:
 *                             type: string
 *                           level:
 *                             type: integer
 *                           sort:
 *                             type: integer
 *       404:
 *         description: 分类不存在
 */
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .select('-__v')
    
    if (!category) {
      return res.status(404).json({
        code: 1,
        message: '分类不存在',
        data: null
      })
    }

    // 获取子分类
    const children = await Category.find({ 
      parentId: category._id,
      isActive: true 
    })
      .sort({ sort: 1, createdAt: -1 })
      .select('-__v')

    res.json({
      code: 0,
      message: 'success',
      data: {
        ...category.toObject(),
        children
      }
    })
  } catch (error) {
    console.error('获取分类详情失败:', error)
    res.status(500).json({
      code: 1,
      message: '获取分类详情失败',
      data: null
    })
  }
})

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: 创建商品分类
 *     tags: [分类]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类名称
 *               description:
 *                 type: string
 *                 description: 分类描述
 *               parentId:
 *                 type: string
 *                 description: 父分类ID
 *               sort:
 *                 type: integer
 *                 description: 排序
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
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, parentId, sort } = req.body

    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        code: 1,
        message: '分类名称不能为空',
        data: null
      })
    }

    // 如果有父分类，验证父分类是否存在
    let level = 1
    if (parentId) {
      const parentCategory = await Category.findById(parentId)
      if (!parentCategory) {
        return res.status(400).json({
          code: 1,
          message: '父分类不存在',
          data: null
        })
      }
      level = parentCategory.level + 1
    }

    // 创建分类
    const category = new Category({
      name,
      description,
      parentId,
      level,
      sort: sort || 0
    })

    await category.save()

    res.json({
      code: 0,
      message: '创建成功',
      data: category
    })
  } catch (error) {
    console.error('创建分类失败:', error)
    res.status(500).json({
      code: 1,
      message: '创建分类失败',
      data: null
    })
  }
})

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: 更新商品分类
 *     tags: [分类]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 分类ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类名称
 *               description:
 *                 type: string
 *                 description: 分类描述
 *               parentId:
 *                 type: string
 *                 description: 父分类ID
 *               sort:
 *                 type: integer
 *                 description: 排序
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
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 分类不存在
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, parentId, sort } = req.body

    // 查找分类
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({
        code: 1,
        message: '分类不存在',
        data: null
      })
    }

    // 如果有父分类，验证父分类是否存在
    let level = category.level
    if (parentId && parentId !== category.parentId?.toString()) {
      const parentCategory = await Category.findById(parentId)
      if (!parentCategory) {
        return res.status(400).json({
          code: 1,
          message: '父分类不存在',
          data: null
        })
      }
      level = parentCategory.level + 1
    }

    // 更新分类
    category.name = name || category.name
    category.description = description || category.description
    category.parentId = parentId || category.parentId
    category.level = level
    category.sort = sort || category.sort

    await category.save()

    res.json({
      code: 0,
      message: '更新成功',
      data: category
    })
  } catch (error) {
    console.error('更新分类失败:', error)
    res.status(500).json({
      code: 1,
      message: '更新分类失败',
      data: null
    })
  }
})

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: 删除商品分类
 *     tags: [分类]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 分类ID
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
 *       400:
 *         description: 分类下有商品，无法删除
 *       401:
 *         description: 未授权
 *       404:
 *         description: 分类不存在
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({
        code: 1,
        message: '分类不存在',
        data: null
      })
    }

    // 检查是否有子分类
    const hasChildren = await Category.exists({ parentId: category._id })
    if (hasChildren) {
      return res.status(400).json({
        code: 1,
        message: '该分类下有子分类，无法删除',
        data: null
      })
    }

    // 软删除
    category.isActive = false
    await category.save()

    res.json({
      code: 0,
      message: '删除成功',
      data: null
    })
  } catch (error) {
    console.error('删除分类失败:', error)
    res.status(500).json({
      code: 1,
      message: '删除分类失败',
      data: null
    })
  }
})

// 构建分类树的辅助函数
function buildCategoryTree(categories: any[]) {
  const categoryMap = new Map()
  const roots: any[] = []

  // 先将所有分类放入 Map
  categories.forEach(category => {
    categoryMap.set(category._id.toString(), {
      ...category.toObject(),
      children: []
    })
  })

  // 构建树结构
  categories.forEach(category => {
    const categoryObj = categoryMap.get(category._id.toString())
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId.toString())
      if (parent) {
        parent.children.push(categoryObj)
      }
    } else {
      roots.push(categoryObj)
    }
  })

  return roots
}

export default router 
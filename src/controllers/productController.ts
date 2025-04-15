import { Request, Response } from 'express'
import Product from '../models/Product'
import { ApiResponse } from '../types/api'
import { asyncHandler } from '../middleware/asyncHandler'

// 获取产品列表
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, category, search, sort } = req.query
  
  // 构建查询条件
  const query: any = {}
  if (category) {
    query.category = category
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
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
      case 'created_desc':
        sortOption = { createdAt: -1 }
        break
      case 'sales_desc':
        sortOption = { sales: -1 }
        break
    }
  }

  const skip = (+page - 1) * +limit
  
  try {
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(+limit),
      Product.countDocuments(query)
    ])

    res.json({
      code: 0,
      data: {
        list: products,
        total,
        page: +page,
        pageSize: +limit
      },
      message: 'success'
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({
      code: 1,
      data: null,
      message: '获取产品列表失败'
    })
  }
})

// 获取商品分类
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  try {
    const categories = await Product.distinct('category')
    const formattedCategories = categories.map((name, index) => ({
      id: String(index + 1),
      name
    }))
    
    res.json({
      code: 0,
      data: formattedCategories,
      message: 'success'
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({
      code: 1,
      data: null,
      message: '获取分类列表失败'
    })
  }
})

// 获取单个产品
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ 
        code: 1,
        data: null,
        message: '产品不存在' 
      })
    }
    res.json({
      code: 0,
      data: product,
      message: 'success'
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({
      code: 1,
      data: null,
      message: '获取产品详情失败'
    })
  }
})

// 创建产品
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json({
      code: 0,
      data: product,
      message: '创建产品成功'
    })
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({
      code: 1,
      data: null,
      message: '创建产品失败'
    })
  }
})

// 更新产品
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    if (!product) {
      return res.status(404).json({ 
        code: 1,
        data: null,
        message: '产品不存在' 
      })
    }
    res.json({
      code: 0,
      data: product,
      message: '更新产品成功'
    })
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({
      code: 1,
      data: null,
      message: '更新产品失败'
    })
  }
})

// 删除产品
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ 
        code: 1,
        data: null,
        message: '产品不存在' 
      })
    }
    res.json({
      code: 0,
      data: null,
      message: '删除产品成功'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({
      code: 1,
      data: null,
      message: '删除产品失败'
    })
  }
}) 
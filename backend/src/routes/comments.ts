import express from 'express'
import { auth } from '../middleware/auth'

const router = express.Router()

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: 获取商品评论列表
 *     tags: [评论]
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
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
 *         name: rating
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5]
 *         description: 评分
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
 *                       description: 总评论数
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           username:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           rating:
 *                             type: integer
 *                           content:
 *                             type: string
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 */
router.get('/', (req, res) => {
  // TODO: 实现获取商品评论列表的逻辑
})

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: 发表商品评论
 *     tags: [评论]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - orderId
 *               - rating
 *               - content
 *             properties:
 *               productId:
 *                 type: string
 *                 description: 商品ID
 *               orderId:
 *                 type: string
 *                 description: 订单ID
 *               rating:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5]
 *                 description: 评分
 *               content:
 *                 type: string
 *                 description: 评论内容
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 评论图片URL列表
 *     responses:
 *       200:
 *         description: 发表成功
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
 *                   example: 发表成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 商品或订单不存在
 */
router.post('/', auth, (req, res) => {
  // TODO: 实现发表商品评论的逻辑
})

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: 删除商品评论
 *     tags: [评论]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 评论ID
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
 *       403:
 *         description: 无权删除该评论
 *       404:
 *         description: 评论不存在
 */
router.delete('/:id', auth, (req, res) => {
  // TODO: 实现删除商品评论的逻辑
})

/**
 * @swagger
 * /comments/{id}/reply:
 *   post:
 *     summary: 回复商品评论
 *     tags: [评论]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 评论ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 回复内容
 *     responses:
 *       200:
 *         description: 回复成功
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
 *                   example: 回复成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 评论不存在
 */
router.post('/:id/reply', auth, (req, res) => {
  // TODO: 实现回复商品评论的逻辑
})

export default router 
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const path = require('path')
require('dotenv').config()

const app = express()

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 服务静态文件
app.use(express.static(path.join(__dirname, '../dist')))

// 所有路由都返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// 获取访问令牌
async function getAccessToken() {
  const API_KEY = process.env.ERNIE_API_KEY
  const SECRET_KEY = process.env.ERNIE_SECRET_KEY
  
  try {
    const response = await axios.post(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`
    )
    return response.data.access_token
  } catch (error) {
    console.error('获取访问令牌失败:', error)
    throw error
  }
}

// 系统提示词
const systemPrompt = `你是一个专业的电商客服助手，名字叫"小智"。你需要：
1. 保持友好、专业的语气
2. 根据用户的问题提供准确的商品推荐
3. 回答用户关于商品、物流、支付等方面的问题
4. 使用简洁、易懂的语言
5. 在适当的时候推荐相关商品`

// AI聊天路由
app.post('/api/chat', async (req, res) => {
  try {
    console.log('收到聊天请求:', req.body) // 添加日志
    const { message, history } = req.body
    
    // 使用环境变量中的API密钥
    const apiKey = process.env.VITE_AI_ASSISTANT_API_KEY
    console.log('API密钥:', apiKey ? '已配置' : '未配置') // 添加日志

    // 构建对话历史
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    // 调用AI API
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-turbo',
        input: {
          messages: messages
        },
        parameters: {
          temperature: 0.7,
          top_p: 0.8
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('AI响应:', response.data) // 添加日志
    const aiResponse = response.data.output.text

    // 解析响应中的商品推荐
    const products = parseProductRecommendations(aiResponse)

    res.json({
      response: aiResponse,
      products
    })
  } catch (error) {
    console.error('AI处理错误:', error)
    res.status(500).json({
      error: 'AI服务暂时不可用，请稍后再试'
    })
  }
})

// 解析商品推荐
function parseProductRecommendations(response) {
  // 这里可以根据实际需求实现商品推荐解析逻辑
  return []
}

const PORT = process.env.PORT || 3002
const HOST = '0.0.0.0'

app.listen(PORT, HOST, () => {
  console.log(`服务器运行在 http://${HOST}:${PORT}`)
  console.log(`本地访问地址: http://localhost:${PORT}`)
  console.log(`局域网访问地址: http://${getLocalIP()}:${PORT}`)
})

// 获取本地IP地址
function getLocalIP() {
  const { networkInterfaces } = require('os')
  const nets = networkInterfaces()
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // 跳过内部IP和非IPv4地址
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
} 
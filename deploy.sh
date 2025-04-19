#!/bin/bash

# 服务器信息
SERVER_IP="8.137.121.139"
SERVER_USER="root"
SERVER_PATH="/root/vue3-shopper"

# 本地打包
echo "正在打包项目..."
npm install
npm run build

# 创建部署目录
echo "正在创建远程目录..."
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${SERVER_PATH}"

# 复制文件到服务器
echo "正在复制文件到服务器..."
scp -r package.json ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/
scp -r package-lock.json ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/
scp -r .env ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/
scp -r mock-server.js ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/
scp -r dist ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

# 在服务器上安装依赖并启动服务
echo "正在服务器上安装依赖..."
ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH} && npm install"

# 使用 PM2 管理进程
echo "正在启动服务..."
ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH} && npm install -g pm2 && pm2 delete mock-server || true && pm2 start mock-server.js --name mock-server"

echo "部署完成！"
echo "服务器地址: http://${SERVER_IP}:3002" 
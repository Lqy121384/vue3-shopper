#!/bin/bash

# 安装依赖
echo "Installing dependencies..."
npm install

# 构建前端
echo "Building frontend..."
npm run build

# 服务器信息
SERVER_IP="8.137.121.139"
SERVER_USER="root"
SERVER_PASS="Lqy12253546"
DEPLOY_PATH="/var/www/html"  # 默认部署路径，可以根据实际情况修改

# 确保dist目录存在
if [ ! -d "dist" ]; then
    echo "Error: dist directory not found!"
    echo "Please run 'npm run build' first."
    exit 1
fi

# 创建临时密码文件
echo "Creating temporary password file..."
echo "$SERVER_PASS" > temp_pass.txt

# 上传文件到服务器
echo "Uploading files to server..."
scp -r dist/* $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/

# 清理临时密码文件
rm temp_pass.txt

# 设置权限
ssh $SERVER_USER@$SERVER_IP "chmod -R 755 $DEPLOY_PATH"

echo "Deployment completed!" 
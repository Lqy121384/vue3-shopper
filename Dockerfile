# ========= 构建阶段 =========
FROM hub-mirror.c.163.com/library/nginx:alpine
WORKDIR /app

# 安装依赖（包括 devDependencies）
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm install

# 拷贝源代码 & 构建
COPY . .
RUN npm run build-only

# ========= 部署阶段 =========
FROM registry.cn-hangzhou.aliyuncs.com/lts/nginx:alpine

# 复制构建产物和 nginx 配置
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]




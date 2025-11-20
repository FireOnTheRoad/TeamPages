#!/bin/bash

echo "🚀 团队成员管理系统启动脚本"
echo "================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 和 npm 已安装"

# 安装根目录依赖
echo "📦 安装根目录依赖..."
npm install

# 安装前端依赖
echo "📦 安装前端依赖..."
cd client && npm install && cd ..

echo "🗄️ 初始化管理员账户..."
node server/scripts/init-admin.js

echo "🌟 启动开发服务器..."

# 读取实际配置的端口
if [ -f ".env" ]; then
    BACKEND_PORT=$(grep "PORT=" .env | cut -d'=' -f2)
    BACKEND_PORT=${BACKEND_PORT:-3000}
else
    BACKEND_PORT=3000
fi

echo "后端服务器: http://localhost:$BACKEND_PORT"
echo "前端开发服务器: http://localhost:5173 (或自动分配的端口)"
echo "管理员登录: http://localhost:$BACKEND_PORT/secret-login"
echo ""
echo "默认管理员账户:"
echo "邮箱: admin@team.com"
echo "密码: admin123"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
npm run dev
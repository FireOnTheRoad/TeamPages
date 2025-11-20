#!/bin/bash

echo "🧹 清理并重启开发环境..."

# 停止所有node进程
pkill -f node.exe 2>/dev/null || true

# 等待进程完全停止
sleep 2

echo "✅ 进程清理完成"

# 运行配置脚本
echo "🔧 配置环境..."
node server/scripts/fix-ports.js
node server/database/migrate.js

echo "🚀 启动开发服务器..."
echo "请在当前终端窗口运行："
echo "npm run dev"
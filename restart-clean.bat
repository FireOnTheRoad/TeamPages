@echo off
echo 🧹 清理并重启开发环境...

REM 停止所有node进程
taskkill /f /im node.exe 2>nul

REM 等待进程完全停止
timeout /t 2 /nobreak >nul

echo ✅ 进程清理完成

REM 运行配置脚本
echo 🔧 配置环境...
node server/scripts/fix-ports.js
node server/database/migrate.js

echo 🚀 启动开发服务器...
echo 请在当前终端窗口运行：
echo npm run dev
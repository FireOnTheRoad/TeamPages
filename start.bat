@echo off
echo 🚀 团队成员管理系统启动脚本
echo ================================

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查npm是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 未安装，请先安装 npm
    pause
    exit /b 1
)

echo ✅ Node.js 和 npm 已安装

REM 安装根目录依赖
echo 📦 安装根目录依赖...
call npm install

REM 安装前端依赖
echo 📦 安装前端依赖...
cd client
call npm install
cd ..

echo 🗄️ 初始化管理员账户...
node server/scripts/init-admin.js

echo 🌟 启动开发服务器...

REM 读取实际配置的端口
if exist ".env" (
    for /f "tokens=2 delims==" %%a in ('findstr "PORT=" .env') do set BACKEND_PORT=%%a
) else (
    set BACKEND_PORT=3000
)

echo 后端服务器: http://localhost:%BACKEND_PORT%
echo 前端开发服务器: http://localhost:5173 (或自动分配的端口)
echo 管理员登录: http://localhost:%BACKEND_PORT%/secret-login
echo.
echo 默认管理员账户:
echo 邮箱: admin@team.com
echo 密码: admin123
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 启动服务器
call npm run dev
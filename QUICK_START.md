# 快速开始指南

## 🚀 一键启动

### Windows用户
```bash
双击运行 start.bat
```

### Mac/Linux用户
```bash
chmod +x start.sh
./start.sh
```

## 📋 手动启动步骤

### 1. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd client && npm install && cd ..
```

### 2. 初始化数据库
```bash
node server/scripts/init-admin.js
```

### 3. 启动开发服务器
```bash
npm run dev
```

## 🔐 默认管理员账户

- **邮箱**: admin@team.com
- **密码**: admin123
- **登录地址**: http://localhost:3000/secret-login

## 🌐 访问地址

- **主页（公开展示）**: http://localhost:3000
- **管理员登录**: http://localhost:3000/secret-login
- **管理后台**: http://localhost:3000/admin（登录后访问）
- **API健康检查**: http://localhost:3000/api/health

## 🧪 测试系统

运行测试脚本验证系统功能：
```bash
node test-system.js
```

## 📱 功能演示

### 公开用户
1. 访问主页查看团队成员
2. 点击成员卡片查看公开信息
3. 查看分组成员列表

### 管理员操作
1. 登录管理后台
2. 创建和管理分组
3. 添加、编辑、删除成员
4. 设置成员权限

### 普通成员
1. 登录后查看隐私信息
2. 编辑个人资料
3. 查看其他成员的隐私信息

## 🔧 常见问题

### Q: 启动失败怎么办？
A: 检查端口3000和5173是否被占用，确保Node.js版本 >= 16

### Q: 忘记管理员密码？
A: 运行 `node server/scripts/fix-admin-password.js` 重置

### Q: 默认管理员无法登录？
A: 运行 `node server/scripts/fix-admin-password.js` 修复密码哈希

### Q: 如何修改JWT密钥？
A: 编辑 `.env` 文件中的 `JWT_SECRET`

### Q: 数据库文件在哪里？
A: `database/team.db`，可删除重新初始化

## 📞 技术支持

如遇问题，请检查：
1. Node.js 和 npm 是否正确安装
2. 所有依赖是否安装完成
3. 端口是否被占用
4. 防火墙设置

---

🎉 **享受使用团队成员管理系统！**
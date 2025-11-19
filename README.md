# 团队成员信息展示与管理系统

一个基于 Vue 3 + Express.js + SQLite 的团队成员管理系统，支持公开展示和权限管理。

## 功能特性

- 🏢 **分组管理**: 支持创建和管理不同的团队分组
- 👥 **成员管理**: 完整的成员信息CRUD操作
- 🔒 **权限控制**: 基于JWT的认证系统，区分公开和隐私信息
- 👤 **个人中心**: 成员可以编辑自己的非敏感信息
- 🛡️ **安全机制**: Bcrypt密码哈希，JWT令牌认证
- 📱 **响应式设计**: 现代化的用户界面，支持移动端

## 技术栈

### 后端
- Node.js + Express.js
- SQLite3 数据库
- JWT 认证
- Bcrypt 密码加密

### 前端
- Vue 3 (Composition API)
- Vue Router 4
- Pinia 状态管理
- Axios HTTP客户端

## 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
npm run install-all
```

### 2. 启动开发服务器

```bash
# 同时启动前后端开发服务器
npm run dev
```

这将启动：
- 后端服务器: http://localhost:3000
- 前端开发服务器: http://localhost:5173

### 3. 默认管理员账户

系统会自动创建默认管理员账户：

- **邮箱**: admin@team.com
- **密码**: admin123
- **登录地址**: http://localhost:3000/secret-login

## 数据库结构

### Groups 表
- `group_id` (INTEGER PRIMARY KEY): 分组ID
- `name` (TEXT NOT NULL): 分组名称

### Members 表
- `member_id` (INTEGER PRIMARY KEY): 成员ID
- `group_id` (INTEGER): 所属分组ID (外键)
- `name` (TEXT NOT NULL): 姓名 (公开)
- `position` (TEXT): 职位 (公开)
- `bio` (TEXT): 个人简介 (公开)
- `photo_url` (TEXT): 头像URL (公开)
- `email_public` (TEXT): 公开邮箱 (公开)
- `email_private` (TEXT): 私有邮箱 (隐私)
- `phone_number` (TEXT): 电话号码 (隐私)
- `password_hash` (TEXT NOT NULL): 密码哈希
- `is_admin` (BOOLEAN): 管理员标识

## API 接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/init-admin` - 创建管理员账户

### 公开接口
- `GET /api/public/members` - 获取所有成员的公开信息（按分组）
- `GET /api/public/members/:id` - 获取单个成员的公开信息

### 需要认证的接口
- `GET /api/members/:id` - 获取成员的隐私信息
- `PUT /api/member/self` - 成员自编辑个人信息
- `GET /api/member/current` - 获取当前用户信息

### 管理员接口
- `GET /api/admin/members` - 获取所有成员信息
- `POST /api/admin/members` - 创建成员
- `PUT /api/admin/members/:id` - 更新成员
- `DELETE /api/admin/members/:id` - 删除成员
- `GET /api/admin/groups` - 获取所有分组
- `POST /api/admin/groups` - 创建分组
- `PUT /api/admin/groups/:id` - 更新分组
- `DELETE /api/admin/groups/:id` - 删除分组

## 页面路由

### 公开页面
- `/` - 主页，展示所有团队成员（按分组）
- `/member/:id` - 成员详情页（仅显示公开信息）

### 认证页面
- `/secret-login` - 登录页面（隐藏路由，无公开链接）

### 管理页面
- `/admin` - 管理后台（需要管理员权限）

## 权限说明

### 未登录用户
- 只能查看成员的公开信息（姓名、职位、简介、头像、公开邮箱）
- 无法看到任何联系方式或隐私信息

### 普通成员（登录后）
- 可以查看自己的隐私信息
- 可以编辑自己的非敏感字段（姓名、职位、简介、头像、公开邮箱）
- 可以查看其他成员的隐私信息（如果知道其ID）

### 管理员
- 拥有所有权限
- 可以管理所有成员和分组信息
- 可以创建、编辑、删除成员账户
- 可以管理分组

## 安全特性

1. **密码安全**: 使用Bcrypt进行密码哈希，盐值轮数为10
2. **认证安全**: JWT令牌有效期24小时，支持自动刷新
3. **权限控制**: 细粒度的权限检查，防止越权访问
4. **隐藏登录**: 登录页面地址为 `/secret-login`，无公开链接指向

## 部署说明

### 生产环境部署

1. 构建前端项目
```bash
npm run build
```

2. 设置环境变量
```bash
export JWT_SECRET=your-production-secret-key
export PORT=3000
export DB_PATH=/path/to/your/database.db
```

3. 启动服务器
```bash
npm start
```

### 环境变量配置

- `JWT_SECRET`: JWT签名密钥（生产环境必须更改）
- `PORT`: 服务器端口（默认3000）
- `DB_PATH`: 数据库文件路径

## 开发指南

### 项目结构

```
TeamPages/
├── server/                 # 后端代码
│   ├── database/           # 数据库相关
│   ├── middleware/         # 中间件
│   ├── routes/            # 路由文件
│   ├── scripts/           # 脚本文件
│   └── index.js           # 服务器入口
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── views/         # 页面
│   │   ├── stores/        # 状态管理
│   │   ├── services/      # API服务
│   │   └── router/        # 路由配置
│   └── dist/              # 构建输出
├── database/              # 数据库文件
└── package.json           # 项目配置
```

### 添加新功能

1. 后端API：在 `server/routes/` 目录下添加新路由
2. 前端页面：在 `client/src/views/` 目录下添加新页面
3. 组件：在 `client/src/components/` 目录下添加可复用组件
4. 状态管理：在 `client/src/stores/` 目录下添加store

## 常见问题

### Q: 忘记管理员密码怎么办？
A: 可以运行 `node server/scripts/init-admin.js` 重新创建管理员账户。

### Q: 如何修改JWT密钥？
A: 修改 `.env` 文件中的 `JWT_SECRET` 值，重启服务器即可。

### Q: 数据库文件在哪里？
A: 默认位置是 `database/team.db`，可通过环境变量 `DB_PATH` 修改。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。
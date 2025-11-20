require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/members'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));

// 静态文件服务（用于生产环境）
app.use(express.static(path.join(__dirname, '../client/dist')));

// API路由
app.get('/api/health', (req, res) => {
    res.json({ 
        message: '服务器运行正常',
        timestamp: new Date().toISOString()
    });
});

// 处理前端路由（SPA支持）
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ 
        error: '服务器内部错误' 
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ 
        error: '接口不存在' 
    });
});

// 启动服务器
async function startServer() {
    try {
        // 连接数据库
        await database.connect();
        
        // 启动HTTP服务器
        app.listen(PORT, () => {
            console.log(`服务器运行在 http://localhost:${PORT}`);
            console.log(`前端页面: http://localhost:${PORT}`);
            console.log(`API文档: http://localhost:${PORT}/api/health`);
        });
        
    } catch (error) {
        console.error('启动服务器失败:', error);
        process.exit(1);
    }
}

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    database.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n正在关闭服务器...');
    database.close();
    process.exit(0);
});

startServer();
const express = require('express');
const bcrypt = require('bcrypt');
const database = require('../database/connection');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// 登录API
router.post('/login', async (req, res) => {
    try {
        const { email_private, password } = req.body;

        if (!email_private || !password) {
            return res.status(400).json({ 
                error: '邮箱和密码不能为空' 
            });
        }

        // 查找用户
        const user = await database.get(
            'SELECT member_id, email_private, password_hash, is_admin FROM Members WHERE email_private = ?',
            [email_private]
        );

        if (!user) {
            return res.status(401).json({ 
                error: '邮箱或密码错误' 
            });
        }

        // 验证密码
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ 
                error: '邮箱或密码错误' 
            });
        }

        // 生成JWT令牌
        const token = generateToken(user);

        res.json({
            message: '登录成功',
            token,
            user: {
                member_id: user.member_id,
                is_admin: user.is_admin
            }
        });

    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ 
            error: '服务器内部错误' 
        });
    }
});

// 创建管理员账户的辅助函数（仅用于初始化）
router.post('/init-admin', async (req, res) => {
    try {
        const { email_private, password, name, position } = req.body;
        
        // 检查是否已有管理员
        const existingAdmin = await database.get(
            'SELECT COUNT(*) as count FROM Members WHERE is_admin = 1'
        );
        
        if (existingAdmin.count > 0) {
            return res.status(400).json({ 
                error: '管理员账户已存在' 
            });
        }

        // 哈希密码
        const passwordHash = await bcrypt.hash(password, 10);

        // 创建管理员账户
        const result = await database.run(
            `INSERT INTO Members (group_id, name, position, email_private, password_hash, is_admin) 
             VALUES (1, ?, ?, ?, ?, 1)`,
            [name, position, email_private, passwordHash]
        );

        res.json({
            message: '管理员账户创建成功',
            member_id: result.id
        });

    } catch (error) {
        console.error('创建管理员错误:', error);
        res.status(500).json({ 
            error: '服务器内部错误' 
        });
    }
});

module.exports = router;
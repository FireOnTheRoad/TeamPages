const express = require('express');
const bcrypt = require('bcrypt');
const database = require('../database/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 所有管理路由都需要认证和管理员权限
router.use(authenticateToken);
router.use(requireAdmin);

// ========== 分组管理 ==========

// 获取所有分组
router.get('/groups', async (req, res) => {
    try {
        const groups = await database.query(
            'SELECT * FROM Groups ORDER BY group_id'
        );
        res.json(groups);
    } catch (error) {
        console.error('获取分组错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 创建分组
router.post('/groups', async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: '分组名称不能为空' });
        }

        const result = await database.run(
            'INSERT INTO Groups (name) VALUES (?)',
            [name]
        );

        res.json({
            message: '分组创建成功',
            group_id: result.id
        });
    } catch (error) {
        console.error('创建分组错误:', error);
        if (error.code === 'SQLITE_CONSTRAINT') {
            res.status(400).json({ error: '分组名称已存在' });
        } else {
            res.status(500).json({ error: '服务器内部错误' });
        }
    }
});

// 更新分组
router.put('/groups/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: '分组名称不能为空' });
        }

        const result = await database.run(
            'UPDATE Groups SET name = ? WHERE group_id = ?',
            [name, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: '分组不存在' });
        }

        res.json({ message: '分组更新成功' });
    } catch (error) {
        console.error('更新分组错误:', error);
        if (error.code === 'SQLITE_CONSTRAINT') {
            res.status(400).json({ error: '分组名称已存在' });
        } else {
            res.status(500).json({ error: '服务器内部错误' });
        }
    }
});

// 删除分组
router.delete('/groups/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 检查是否有成员属于该分组
        const membersCount = await database.get(
            'SELECT COUNT(*) as count FROM Members WHERE group_id = ?',
            [id]
        );

        if (membersCount.count > 0) {
            return res.status(400).json({ 
                error: '该分组下还有成员，无法删除' 
            });
        }

        const result = await database.run(
            'DELETE FROM Groups WHERE group_id = ?',
            [id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: '分组不存在' });
        }

        res.json({ message: '分组删除成功' });
    } catch (error) {
        console.error('删除分组错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// ========== 成员管理 ==========

// 获取所有成员（包括隐私信息）
router.get('/members', async (req, res) => {
    try {
        const members = await database.query(
            `SELECT 
                m.member_id,
                m.group_id,
                g.name as group_name,
                m.name,
                m.position,
                m.bio,
                m.photo_url,
                m.photo_filename,
                m.email_public,
                m.email_private,
                m.phone_number,
                m.is_admin
            FROM Members m
            LEFT JOIN Groups g ON m.group_id = g.group_id
            ORDER BY m.group_id, m.name`
        );
        res.json(members);
    } catch (error) {
        console.error('获取成员错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 创建成员
router.post('/members', async (req, res) => {
    try {
        const { 
            group_id, 
            name, 
            position, 
            bio, 
            photo_url, 
            photo_filename,
            email_public, 
            email_private, 
            phone_number, 
            password, 
            is_admin 
        } = req.body;

        if (!name || !email_private || !password) {
            return res.status(400).json({ 
                error: '姓名、私有邮箱和密码不能为空' 
            });
        }

        // 检查邮箱是否已存在
        const existingMember = await database.get(
            'SELECT member_id FROM Members WHERE email_private = ?',
            [email_private]
        );

        if (existingMember) {
            return res.status(400).json({ 
                error: '该邮箱已被使用' 
            });
        }

        // 哈希密码
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await database.run(
            `INSERT INTO Members (
                group_id, name, position, bio, photo_url, photo_filename,
                email_public, email_private, phone_number, 
                password_hash, is_admin
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                group_id || null,
                name,
                position || null,
                bio || null,
                photo_url || null,
                photo_filename || null,
                email_public || null,
                email_private,
                phone_number || null,
                passwordHash,
                is_admin ? 1 : 0
            ]
        );

        res.json({
            message: '成员创建成功',
            member_id: result.id
        });

    } catch (error) {
        console.error('创建成员错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 更新成员
router.put('/members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            group_id, 
            name, 
            position, 
            bio, 
            photo_url, 
            photo_filename,
            email_public, 
            email_private, 
            phone_number, 
            password, 
            is_admin 
        } = req.body;

        // 构建动态更新SQL
        const updates = [];
        const values = [];

        if (group_id !== undefined) {
            updates.push('group_id = ?');
            values.push(group_id);
        }
        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (position !== undefined) {
            updates.push('position = ?');
            values.push(position);
        }
        if (bio !== undefined) {
            updates.push('bio = ?');
            values.push(bio);
        }
        if (photo_url !== undefined) {
            updates.push('photo_url = ?');
            values.push(photo_url);
        }
        if (email_public !== undefined) {
            updates.push('email_public = ?');
            values.push(email_public);
        }
        if (email_private !== undefined) {
            // 检查新邮箱是否已被使用
            const existingMember = await database.get(
                'SELECT member_id FROM Members WHERE email_private = ? AND member_id != ?',
                [email_private, id]
            );
            
            if (existingMember) {
                return res.status(400).json({ 
                    error: '该邮箱已被其他成员使用' 
                });
            }
            
            updates.push('email_private = ?');
            values.push(email_private);
        }
        if (phone_number !== undefined) {
            updates.push('phone_number = ?');
            values.push(phone_number);
        }
        if (password !== undefined) {
            const passwordHash = await bcrypt.hash(password, 10);
            updates.push('password_hash = ?');
            values.push(passwordHash);
        }
        if (is_admin !== undefined) {
            updates.push('is_admin = ?');
            values.push(is_admin ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({ 
                error: '没有提供有效的更新字段' 
            });
        }

        values.push(id); // WHERE条件的参数

        const result = await database.run(
            `UPDATE Members SET ${updates.join(', ')} WHERE member_id = ?`,
            values
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: '成员不存在' });
        }

        res.json({ message: '成员信息更新成功' });

    } catch (error) {
        console.error('更新成员错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 删除成员
router.delete('/members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        // 防止管理员删除自己
        if (currentUser.member_id == id) {
            return res.status(400).json({ 
                error: '不能删除自己的账户' 
            });
        }

        const result = await database.run(
            'DELETE FROM Members WHERE member_id = ?',
            [id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: '成员不存在' });
        }

        res.json({ message: '成员删除成功' });

    } catch (error) {
        console.error('删除成员错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

module.exports = router;
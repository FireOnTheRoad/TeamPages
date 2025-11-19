const express = require('express');
const database = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取所有成员的公开信息，按分组返回
router.get('/public/members', async (req, res) => {
    try {
        // 获取所有分组
        const groups = await database.query(
            'SELECT group_id, name FROM Groups ORDER BY group_id'
        );

        // 获取所有成员的公开信息
        const members = await database.query(
            `SELECT 
                m.member_id,
                m.group_id,
                m.name,
                m.position,
                m.bio,
                m.photo_url,
                m.email_public
            FROM Members m 
            ORDER BY m.group_id, m.name`
        );

        // 按分组组织数据
        const result = groups.map(group => ({
            ...group,
            members: members.filter(member => member.group_id === group.group_id)
        }));

        res.json(result);

    } catch (error) {
        console.error('获取公开成员信息错误:', error);
        res.status(500).json({ 
            error: '服务器内部错误' 
        });
    }
});

// 获取单个成员的公开信息
router.get('/public/members/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const member = await database.get(
            `SELECT 
                m.member_id,
                m.group_id,
                g.name as group_name,
                m.name,
                m.position,
                m.bio,
                m.photo_url,
                m.email_public
            FROM Members m
            LEFT JOIN Groups g ON m.group_id = g.group_id
            WHERE m.member_id = ?`,
            [id]
        );

        if (!member) {
            return res.status(404).json({ 
                error: '成员不存在' 
            });
        }

        res.json(member);

    } catch (error) {
        console.error('获取成员公开信息错误:', error);
        res.status(500).json({ 
            error: '服务器内部错误' 
        });
    }
});

// 获取指定成员的隐私信息（需要JWT认证）
router.get('/members/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        // 检查权限：只有本人或管理员可以查看隐私信息
        if (currentUser.member_id != id && !currentUser.is_admin) {
            return res.status(403).json({ 
                error: '无权查看该成员的隐私信息' 
            });
        }

        const member = await database.get(
            `SELECT 
                m.member_id,
                m.group_id,
                g.name as group_name,
                m.name,
                m.position,
                m.bio,
                m.photo_url,
                m.email_public,
                m.email_private,
                m.phone_number,
                m.is_admin
            FROM Members m
            LEFT JOIN Groups g ON m.group_id = g.group_id
            WHERE m.member_id = ?`,
            [id]
        );

        if (!member) {
            return res.status(404).json({ 
                error: '成员不存在' 
            });
        }

        res.json(member);

    } catch (error) {
        console.error('获取成员隐私信息错误:', error);
        res.status(500).json({ 
            error: '服务器内部错误' 
        });
    }
});

// 成员自编辑个人信息（需要JWT认证）
router.put('/member/self', authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const { name, position, bio, photo_url, email_public } = req.body;

        // 只允许修改特定字段
        const allowedFields = {};
        if (name !== undefined) allowedFields.name = name;
        if (position !== undefined) allowedFields.position = position;
        if (bio !== undefined) allowedFields.bio = bio;
        if (photo_url !== undefined) allowedFields.photo_url = photo_url;
        if (email_public !== undefined) allowedFields.email_public = email_public;

        if (Object.keys(allowedFields).length === 0) {
            return res.status(400).json({ 
                error: '没有提供有效的更新字段' 
            });
        }

        // 构建动态SQL
        const setClause = Object.keys(allowedFields)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = Object.values(allowedFields);

        await database.run(
            `UPDATE Members SET ${setClause} WHERE member_id = ?`,
            [...values, currentUser.member_id]
        );

        res.json({ message: '个人信息更新成功' });

    } catch (error) {
        console.error('更新个人信息错误:', error);
        res.status(500).json({ 
            error: '服务器内部错误' 
        });
    }
});

// 获取当前用户信息
router.get('/member/current', authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;

        const member = await database.get(
            `SELECT 
                member_id,
                group_id,
                name,
                position,
                bio,
                photo_url,
                email_public,
                email_private,
                phone_number,
                is_admin
            FROM Members 
            WHERE member_id = ?`,
            [currentUser.member_id]
        );

        if (!member) {
            return res.status(404).json({ 
                error: '用户不存在' 
            });
        }

        res.json(member);

    } catch (error) {
        console.error('获取当前用户信息错误:', error);
        res.status(500).json({ 
            error: '服务器内部错误' 
        });
    }
});

module.exports = router;
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB限制
    },
    fileFilter: function (req, file, cb) {
        // 只允许图片文件
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'), false);
        }
    }
});

// 上传头像
router.post('/avatar', authenticateToken, upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '没有上传文件' });
        }

        const filename = req.file.filename;
        const fileUrl = `/uploads/${filename}`;
        
        console.log('📸 头像上传成功:', filename);
        
        res.json({
            message: '头像上传成功',
            filename: filename,
            url: fileUrl
        });
        
    } catch (error) {
        console.error('头像上传失败:', error);
        res.status(500).json({ error: '头像上传失败' });
    }
});

// 删除头像
router.delete('/avatar/:filename', authenticateToken, (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadDir, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('🗑️ 头像删除成功:', filename);
            res.json({ message: '头像删除成功' });
        } else {
            res.status(404).json({ error: '文件不存在' });
        }
        
    } catch (error) {
        console.error('头像删除失败:', error);
        res.status(500).json({ error: '头像删除失败' });
    }
});

// 获取头像文件
router.get('/avatar/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadDir, filename);
        
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).json({ error: '文件不存在' });
        }
        
    } catch (error) {
        console.error('获取头像失败:', error);
        res.status(500).json({ error: '获取头像失败' });
    }
});

// 获取随机默认头像
router.get('/default-avatars', (req, res) => {
    const defaultAvatars = [
        'avatar-1.jpg', 'avatar-2.jpg', 'avatar-3.jpg', 
        'avatar-4.jpg', 'avatar-5.jpg', 'avatar-6.jpg',
        'avatar-7.jpg', 'avatar-8.jpg', 'avatar-9.jpg'
    ];
    
    res.json({
        avatars: defaultAvatars
    });
});

module.exports = router;
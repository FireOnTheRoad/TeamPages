const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-me';

if (!process.env.JWT_SECRET) {
    console.warn('警告: 未设置 JWT_SECRET，已使用开发环境默认值。请在生产环境中配置安全的密钥。');
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: '访问令牌缺失' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '令牌无效或已过期' });
        }
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ error: '需要管理员权限' });
    }
    next();
};

const generateToken = (user) => {
    return jwt.sign(
        { 
            member_id: user.member_id, 
            is_admin: user.is_admin 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

module.exports = {
    authenticateToken,
    requireAdmin,
    generateToken
};
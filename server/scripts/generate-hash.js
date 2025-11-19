const bcrypt = require('bcrypt');

async function generatePasswordHash(password) {
    try {
        const hash = await bcrypt.hash(password, 10);
        console.log('密码:', password);
        console.log('哈希值:', hash);
        return hash;
    } catch (error) {
        console.error('生成哈希失败:', error);
    }
}

// 生成 admin123 的哈希
generatePasswordHash('admin123');
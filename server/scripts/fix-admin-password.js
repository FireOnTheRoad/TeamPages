const bcrypt = require('bcrypt');
const database = require('../database/connection');

async function fixAdminPassword() {
    try {
        // 连接数据库
        await database.connect();
        
        const newPassword = 'admin123';
        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        // 更新管理员密码
        const result = await database.run(
            'UPDATE Members SET password_hash = ? WHERE email_private = ?',
            [passwordHash, 'admin@team.com']
        );
        
        if (result.changes > 0) {
            console.log('✅ 管理员密码已重置成功！');
            console.log('邮箱: admin@team.com');
            console.log('密码: admin123');
            console.log('登录地址: http://localhost:3000/secret-login');
        } else {
            console.log('❌ 未找到管理员账户，正在创建...');
            
            // 如果没有找到账户，创建一个
            const createResult = await database.run(
                `INSERT INTO Members (group_id, name, position, email_private, password_hash, is_admin) 
                 VALUES (1, ?, ?, ?, ?, 1)`,
                ['系统管理员', '系统管理员', 'admin@team.com', passwordHash]
            );
            
            console.log('✅ 管理员账户创建成功！');
            console.log('邮箱: admin@team.com');
            console.log('密码: admin123');
            console.log('登录地址: http://localhost:3000/secret-login');
        }
        
    } catch (error) {
        console.error('❌ 修复管理员密码失败:', error);
    } finally {
        database.close();
    }
}

fixAdminPassword();
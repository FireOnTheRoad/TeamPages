const database = require('./connection');

async function smartInit() {
    try {
        await database.connect();
        
        // 检查是否已经初始化过
        const tableExists = await database.get(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='Members'
        `);
        
        if (!tableExists) {
            console.log('🗄️ 首次运行，正在初始化数据库...');
            // 首次运行，执行完整初始化
            await database.initDatabase();
        } else {
            console.log('📋 数据库已存在，跳过初始化');
        }
        
        // 检查管理员账户是否存在
        const adminExists = await database.get(`
            SELECT member_id FROM Members 
            WHERE email_private = 'admin@team.com' AND is_admin = 1
        `);
        
        if (!adminExists) {
            console.log('👤 管理员账户不存在，正在创建...');
            const bcrypt = require('bcrypt');
            const passwordHash = await bcrypt.hash('admin123', 10);
            
            await database.run(`
                INSERT INTO Members (group_id, name, position, email_private, password_hash, is_admin) 
                VALUES (1, ?, ?, ?, ?, 1)
            `, ['系统管理员', '系统管理员', 'admin@team.com', passwordHash]);
            
            console.log('✅ 管理员账户创建成功');
        }
        
        database.close();
        
    } catch (error) {
        console.error('数据库初始化检查失败:', error);
        database.close();
    }
}

module.exports = smartInit;
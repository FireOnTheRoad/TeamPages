const database = require('../database/connection');

async function checkDatabase() {
    try {
        await database.connect();
        
        // 检查表结构
        const tables = await database.query(`
            SELECT name FROM sqlite_master 
            WHERE type='table'
        `);
        
        console.log('📊 数据库表:');
        tables.forEach(table => {
            console.log(`  - ${table.name}`);
        });
        
        // 检查数据
        const groupCount = await database.get('SELECT COUNT(*) as count FROM Groups');
        const memberCount = await database.get('SELECT COUNT(*) as count FROM Members');
        const adminCount = await database.get('SELECT COUNT(*) as count FROM Members WHERE is_admin = 1');
        
        console.log('\n📈 数据统计:');
        console.log(`  - 分组数量: ${groupCount.count}`);
        console.log(`  - 成员数量: ${memberCount.count}`);
        console.log(`  - 管理员数量: ${adminCount.count}`);
        
        // 显示管理员信息
        const admins = await database.query(`
            SELECT member_id, name, email_private FROM Members 
            WHERE is_admin = 1
        `);
        
        console.log('\n👤 管理员账户:');
        admins.forEach(admin => {
            console.log(`  - ID: ${admin.member_id}, 姓名: ${admin.name}, 邮箱: ${admin.email_private}`);
        });
        
        database.close();
        
    } catch (error) {
        console.error('❌ 检查数据库失败:', error);
    }
}

checkDatabase();
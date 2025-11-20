const database = require('./connection');
const fs = require('fs');

async function runMigration() {
    try {
        console.log('🔄 开始数据库迁移...');
        
        await database.connect();
        
        // 检查photo_filename字段是否已存在
        const tableInfo = await database.query(`
            PRAGMA table_info(Members)
        `);
        
        const hasPhotoFilename = tableInfo.some(col => col.name === 'photo_filename');
        
        if (!hasPhotoFilename) {
            console.log('📝 添加photo_filename字段...');
            
            // 添加新字段
            await database.run(`
                ALTER TABLE Members ADD COLUMN photo_filename TEXT
            `);
            
            console.log('✅ photo_filename字段添加成功');
        } else {
            console.log('ℹ️  photo_filename字段已存在，跳过');
        }
        
        database.close();
        console.log('🎉 数据库迁移完成！');
        
    } catch (error) {
        console.error('❌ 数据库迁移失败:', error);
        database.close();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    runMigration();
}

module.exports = runMigration;
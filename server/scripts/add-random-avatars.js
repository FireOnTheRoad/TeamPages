const database = require('../database/connection');

const randomAvatars = [
    'https://picsum.photos/seed/avatar1/200/200.jpg',
    'https://picsum.photos/seed/avatar2/200/200.jpg',
    'https://picsum.photos/seed/avatar3/200/200.jpg',
    'https://picsum.photos/seed/avatar4/200/200.jpg',
    'https://picsum.photos/seed/avatar5/200/200.jpg',
    'https://picsum.photos/seed/avatar6/200/200.jpg',
    'https://picsum.photos/seed/avatar7/200/200.jpg',
    'https://picsum.photos/seed/avatar8/200/200.jpg',
    'https://picsum.photos/seed/avatar9/200/200.jpg',
    'https://picsum.photos/seed/avatar10/200/200.jpg',
    'https://picsum.photos/seed/avatar11/200/200.jpg',
    'https://picsum.photos/seed/avatar12/200/200.jpg'
];

async function addRandomAvatars() {
    try {
        console.log('🎨 开始为成员添加随机头像...');
        
        await database.connect();
        
        // 获取所有没有头像的成员（不包括管理员）
        const membersWithoutAvatar = await database.query(`
            SELECT member_id, name, photo_url 
            FROM Members 
            WHERE (photo_url IS NULL OR photo_url = '') 
            AND is_admin = 0
        `);
        
        if (membersWithoutAvatar.length === 0) {
            console.log('✅ 所有成员都有头像了！');
            return;
        }
        
        console.log(`📝 找到 ${membersWithoutAvatar.length} 个需要头像的成员`);
        
        // 为每个成员分配随机头像
        for (const member of membersWithoutAvatar) {
            const randomIndex = Math.floor(Math.random() * randomAvatars.length);
            const randomAvatar = randomAvatars[randomIndex];
            
            await database.run(`
                UPDATE Members 
                SET photo_url = ? 
                WHERE member_id = ?
            `, [randomAvatar, member.member_id]);
            
            console.log(`✅ 已为 ${member.name} 设置头像: ${randomAvatar}`);
        }
        
        console.log('🎉 所有成员头像设置完成！');
        
        // 显示更新后的成员列表
        const updatedMembers = await database.query(`
            SELECT member_id, name, photo_url, photo_filename 
            FROM Members 
            ORDER BY member_id
        `);
        
        console.log('\n📊 当前成员头像状态:');
        updatedMembers.forEach(member => {
            const avatarStatus = member.photo_url || member.photo_filename || '无头像';
            console.log(`  - ${member.name}: ${avatarStatus}`);
        });
        
    } catch (error) {
        console.error('❌ 添加随机头像失败:', error);
    } finally {
        database.close();
    }
}

async function createDefaultAvatars() {
    console.log('🎨 创建默认头像文件夹和占位符...');
    
    const fs = require('fs');
    const path = require('path');
    
    // 创建默认头像文件夹
    const defaultAvatarsDir = path.join(__dirname, '../../public/default-avatars');
    
    if (!fs.existsSync(defaultAvatarsDir)) {
        fs.mkdirSync(defaultAvatarsDir, { recursive: true });
        console.log('✅ 创建默认头像文件夹');
    }
    
    // 创建占位符文件列表
    const avatarList = [
        'avatar-1.jpg', 'avatar-2.jpg', 'avatar-3.jpg', 
        'avatar-4.jpg', 'avatar-5.jpg', 'avatar-6.jpg',
        'avatar-7.jpg', 'avatar-8.jpg', 'avatar-9.jpg'
    ];
    
    console.log('📝 可用的默认头像:');
    avatarList.forEach(avatar => {
        console.log(`  - ${avatar}`);
    });
    
    console.log('💡 提示: 您可以将自定义头像文件放在 public/default-avatars/ 目录中');
}

// 主函数
async function main() {
    console.log('🎨 团队成员头像设置工具');
    console.log('=====================================\n');
    
    await createDefaultAvatars();
    await addRandomAvatars();
    
    console.log('\n🚀 完成！现在可以重启服务器查看效果。');
    console.log('💡 管理员可以在后台为成员上传自定义头像。');
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { addRandomAvatars, createDefaultAvatars };
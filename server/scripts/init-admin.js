const bcrypt = require('bcrypt');
const database = require('../database/connection');

async function createAdminAccount() {
  try {
    // 连接数据库
    await database.connect();
    
    const adminData = {
      email_private: 'admin@team.com',
      password: 'admin123',
      name: '系统管理员',
      position: '系统管理员'
    };
    
    // 哈希密码
    const passwordHash = await bcrypt.hash(adminData.password, 10);
    
    // 先尝试更新现有管理员账户
    const updateResult = await database.run(
      'UPDATE Members SET password_hash = ? WHERE email_private = ?',
      [passwordHash, adminData.email_private]
    );
    
    if (updateResult.changes > 0) {
      console.log('✅ 管理员密码已更新成功！');
    } else {
      // 如果没有现有账户，创建一个新的
      const result = await database.run(
        `INSERT INTO Members (group_id, name, position, email_private, password_hash, is_admin) 
         VALUES (1, ?, ?, ?, ?, 1)`,
        [adminData.name, adminData.position, adminData.email_private, passwordHash]
      );
      
      console.log('✅ 管理员账户创建成功！');
    }
    
    console.log('邮箱: admin@team.com');
    console.log('密码: admin123');
    console.log('登录地址: http://localhost:3000/secret-login');
    
  } catch (error) {
    console.error('设置管理员账户失败:', error);
  } finally {
    database.close();
  }
}

createAdminAccount();
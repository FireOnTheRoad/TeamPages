const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAPIs() {
    console.log('🧪 开始测试系统API接口...\n');

    try {
        // 1. 测试服务器健康状态
        console.log('1. 测试服务器健康状态...');
        const health = await axios.get(`${API_BASE}/health`);
        console.log('✅ 服务器状态:', health.data.message);

        // 2. 测试获取公开成员数据
        console.log('\n2. 测试获取公开成员数据...');
        const publicMembers = await axios.get(`${API_BASE}/public/members`);
        console.log('✅ 获取到', publicMembers.data.length, '个分组');

        // 3. 测试管理员登录
        console.log('\n3. 测试管理员登录...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email_private: 'admin@team.com',
            password: 'admin123'
        });
        console.log('✅ 登录成功，获取到Token');
        const token = loginResponse.data.token;
        
        // 设置认证头
        const authAPI = axios.create({
            baseURL: API_BASE,
            headers: { Authorization: `Bearer ${token}` }
        });

        // 4. 测试获取管理员权限的数据
        console.log('\n4. 测试获取管理员数据...');
        const adminMembers = await authAPI.get('/admin/members');
        console.log('✅ 获取到', adminMembers.data.length, '个成员的管理数据');

        // 5. 测试获取分组数据
        console.log('\n5. 测试获取分组数据...');
        const groups = await authAPI.get('/admin/groups');
        console.log('✅ 获取到', groups.data.length, '个分组');

        // 6. 测试创建新分组
        console.log('\n6. 测试创建新分组...');
        const newGroup = await authAPI.post('/admin/groups', {
            name: '测试分组_' + Date.now()
        });
        console.log('✅ 创建分组成功，ID:', newGroup.data.group_id);

        // 7. 测试创建新成员
        console.log('\n7. 测试创建新成员...');
        const testGroupName = groups.data[0]?.name || '默认分组';
        const newMember = await authAPI.post('/admin/members', {
            name: '测试成员',
            position: '测试职位',
            bio: '这是一个测试成员',
            email_private: 'test' + Date.now() + '@example.com',
            password: 'test123',
            is_admin: false
        });
        console.log('✅ 创建成员成功，ID:', newMember.data.member_id);

        console.log('\n🎉 所有API测试通过！系统运行正常。');

    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 提示：请确保服务器正在运行 (npm run dev)');
        }
    }
}

// 检查是否直接运行此文件
if (require.main === module) {
    testAPIs();
}

module.exports = testAPIs;
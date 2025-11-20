const net = require('net');
const fs = require('fs');
const path = require('path');

console.log('🔍 检查端口配置...\n');

// 检查端口是否被占用
function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.listen(port, () => {
            server.once('close', () => {
                resolve(true); // 端口可用
            });
            server.close();
        });
        
        server.on('error', () => {
            resolve(false); // 端口被占用
        });
    });
}

async function fixPortIssues() {
    try {
        // 1. 检查当前配置
        const envPath = path.join(__dirname, '../../.env');
        let envContent = '';
        
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
            console.log('📋 当前 .env 配置:');
            console.log(envContent);
        } else {
            console.log('❌ .env 文件不存在，将创建默认配置');
            envContent = 'JWT_SECRET=your-super-secret-jwt-key-change-this-in-production\nPORT=3000\nDB_PATH=./database/team.db';
        }

        // 2. 检查端口占用情况
        console.log('\n🔍 检查端口占用:');
        
        const port3000 = await checkPort(3000);
        const port5173 = await checkPort(5173);
        
        if (!port3000) {
            console.log('❌ 端口 3000 被占用');
            // 查找可用端口
            const availablePort = await findAvailablePort(3001);
            console.log(`✅ 找到可用端口: ${availablePort}`);
            
            // 更新 .env 文件
            envContent = envContent.replace(/PORT=\d+/, `PORT=${availablePort}`);
            console.log(`📝 将后端端口更新为: ${availablePort}`);
            
            // 同时更新 vite 配置
            const viteConfigPath = path.join(__dirname, '../../client/vite.config.js');
            if (fs.existsSync(viteConfigPath)) {
                let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
                viteConfig = viteConfig.replace(/target: 'http:\/\/localhost:\d+/, `target: 'http://localhost:${availablePort}'`);
                fs.writeFileSync(viteConfigPath, viteConfig);
                console.log(`📝 已更新 Vite 代理配置为: ${availablePort}`);
            }
        } else {
            console.log('✅ 端口 3000 可用');
        }
        
        if (!port5173) {
            console.log('❌ 端口 5173 被占用');
            // Vite 会自动寻找其他端口，这是正常的
            console.log('ℹ️  Vite 会自动使用其他可用端口');
        } else {
            console.log('✅ 端口 5173 可用');
        }

        // 3. 保存更新后的 .env 文件
        fs.writeFileSync(envPath, envContent);
        console.log('✅ 配置已保存');

        // 4. 显示最终配置
        console.log('\n📊 最终配置:');
        const backendPort = envContent.match(/PORT=(\d+)/)?.[1] || '3000';
        console.log(`后端端口: ${backendPort}`);
        console.log(`前端端口: ${port5173 ? '5173' : '自动选择'}`);
        console.log(`访问地址: http://localhost:${backendPort}`);

        // 5. 提供访问建议
        console.log('\n🚀 启动建议:');
        console.log('1. 重启开发服务器: npm run dev');
        console.log(`2. 访问主页: http://localhost:${backendPort}`);
        console.log(`3. 管理员登录: http://localhost:${backendPort}/secret-login`);
        
        // 如果端口不是3000，提醒用户
        if (backendPort !== '3000') {
            console.log('\n⚠️  注意: 后端端口已更改为非默认值');
            console.log(`   请访问: http://localhost:${backendPort}`);
        }

    } catch (error) {
        console.error('❌ 检查端口时出错:', error);
    }
}

function findAvailablePort(startPort) {
    return new Promise(async (resolve) => {
        for (let port = startPort; port <= 3010; port++) {
            if (await checkPort(port)) {
                resolve(port);
                return;
            }
        }
        resolve(3000); // 如果都不可用，返回默认值
    });
}

// 显示当前运行的服务
async function showRunningServices() {
    console.log('\n🔍 检查当前运行的服务:');
    
    const commonPorts = [3000, 3001, 3002, 5173, 5174, 5175];
    for (const port of commonPorts) {
        const isAvailable = await checkPort(port);
        if (!isAvailable) {
            console.log(`❌ 端口 ${port} 被占用`);
        }
    }
}

// 主函数
async function main() {
    await showRunningServices();
    await fixPortIssues();
    console.log('\n🎉 端口检查完成！');
}

main();
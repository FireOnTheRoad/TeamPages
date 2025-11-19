const { exec } = require('child_process');
const path = require('path');

console.log('🧪 测试前端构建是否正常...\n');

// 测试前端构建
exec('cd client && npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ 前端构建失败:');
    console.error(stderr);
    
    // 尝试安装依赖并重新构建
    console.log('\n💡 尝试安装前端依赖...');
    exec('cd client && npm install', (installError, installStdout, installStderr) => {
      if (installError) {
        console.error('❌ 依赖安装失败:', installStderr);
        return;
      }
      
      console.log('✅ 依赖安装完成，重新构建...');
      exec('cd client && npm run build', (retryError, retryStdout, retryStderr) => {
        if (retryError) {
          console.error('❌ 重新构建仍然失败:', retryStderr);
        } else {
          console.log('✅ 前端构建成功！');
        }
      });
    });
  } else {
    console.log('✅ 前端构建成功！');
    console.log('输出目录:', path.join(__dirname, 'client/dist'));
  }
});
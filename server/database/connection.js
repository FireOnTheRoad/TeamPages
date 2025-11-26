const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        this.db = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            const dbPath = process.env.DB_PATH || './database/team.db';
            
            // 确保数据库目录存在
            const dbDir = path.dirname(dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('数据库连接失败:', err.message);
                    reject(err);
                } else {
                    console.log('已连接到SQLite数据库');
                    this.initDatabase().then(resolve).catch(reject);
                }
            });
        });
    }

    async initDatabase() {
        const executeInitScript = () => {
            return new Promise((resolve, reject) => {
                const sqlPath = path.join(__dirname, 'init.sql');
                const sql = fs.readFileSync(sqlPath, 'utf8');

                this.db.exec(sql, (err) => {
                    if (err) {
                        console.error('数据库初始化失败:', err.message);
                        reject(err);
                    } else {
                        console.log('数据库初始化完成');
                        resolve();
                    }
                });
            });
        };

        await executeInitScript();
        await this.runMigrations();
    }

    async runMigrations() {
        try {
            const tableInfo = await this.query('PRAGMA table_info(Members)');
            const hasPhotoFilename = tableInfo.some(col => col.name === 'photo_filename');

            if (!hasPhotoFilename) {
                console.log('检测到缺失字段 photo_filename，正在自动补齐...');
                await this.run('ALTER TABLE Members ADD COLUMN photo_filename TEXT');
                console.log('photo_filename 字段添加完成');
            }
        } catch (error) {
            console.error('执行数据库迁移失败:', error.message);
            throw error;
        }
    }

    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ 
                        id: this.lastID, 
                        changes: this.changes 
                    });
                }
            });
        });
    }

    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('关闭数据库连接失败:', err.message);
                } else {
                    console.log('数据库连接已关闭');
                }
            });
        }
    }
}

module.exports = new Database();
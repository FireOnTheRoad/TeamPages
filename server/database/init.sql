-- 创建Groups表
CREATE TABLE IF NOT EXISTS Groups (
    group_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- 创建Members表
CREATE TABLE IF NOT EXISTS Members (
    member_id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER,
    name TEXT NOT NULL,
    position TEXT,
    bio TEXT,
    photo_url TEXT,
    email_public TEXT,
    email_private TEXT,
    phone_number TEXT,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    FOREIGN KEY (group_id) REFERENCES Groups(group_id)
);

-- 插入默认分组
INSERT OR IGNORE INTO Groups (name) VALUES ('开发团队');
INSERT OR IGNORE INTO Groups (name) VALUES ('设计团队');
INSERT OR IGNORE INTO Groups (name) VALUES ('管理团队');

-- 插入默认管理员账户 (密码: admin123)
INSERT OR IGNORE INTO Members (
    group_id, 
    name, 
    position, 
    bio, 
    photo_url, 
    email_public, 
    email_private, 
    phone_number, 
    password_hash, 
    is_admin
) VALUES (
    3,
    '系统管理员',
    '系统管理员',
    '系统默认管理员账户',
    '',
    'admin@team.com',
    'admin@team.com',
    '',
    '$2b$10$8K1O/orWOhlOjnLhk1V8/.3ukOzT8H6XE5l.FdCAzO8SQaBz8xCzO',
    1
);
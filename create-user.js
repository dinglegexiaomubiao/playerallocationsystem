const { Pool } = require('pg');
const bcrypt = require('bcrypt');
// PostgreSQL数据库连接
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_xZBodH1Auk7n@ep-aged-haze-admxtuaz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: {
        rejectUnauthorized: true
    }
});

// 创建用户函数
async function createUser(username, password) {
    try {
        const client = await pool.connect();
        
        // 检查用户名是否已存在
        const existingUser = await client.query('SELECT * FROM users WHERE name = $1', [username]);
        
        if (existingUser.rows.length > 0) {
            console.log(`用户 "${username}" 已存在！`);
            client.release();
            return false;
        }
        
        // 密码加密
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 创建用户
        await client.query('INSERT INTO users (name, password) VALUES ($1, $2)', [username, hashedPassword]);
        
        console.log(`用户 "${username}" 创建成功！`);
        client.release();
        return true;
        
    } catch (err) {
        console.error('创建用户失败:', err);
        return false;
    }
}

// 列出所有用户
async function listUsers() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT name FROM users ORDER BY name');
        client.release();
        
        console.log('现有用户列表:');
        result.rows.forEach(row => {
            console.log(`- ${row.name}`);
        });
        
        return result.rows;
    } catch (err) {
        console.error('获取用户列表失败:', err);
        return [];
    }
}

// 删除用户
async function deleteUser(username) {
    try {
        const client = await pool.connect();
        
        // 检查用户是否存在
        const existingUser = await client.query('SELECT * FROM users WHERE name = $1', [username]);
        
        if (existingUser.rows.length === 0) {
            console.log(`用户 "${username}" 不存在！`);
            client.release();
            return false;
        }
        
        // 删除用户
        await client.query('DELETE FROM users WHERE name = $1', [username]);
        
        console.log(`用户 "${username}" 删除成功！`);
        client.release();
        return true;
        
    } catch (err) {
        console.error('删除用户失败:', err);
        return false;
    }
}

// 命令行交互
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('使用方法:');
        console.log('  node create-user.js list                    # 列出所有用户');
        console.log('  node create-user.js create <username> <password>  # 创建用户');
        console.log('  node create-user.js delete <username>       # 删除用户');
        console.log('');
        console.log('示例:');
        console.log('  node create-user.js create testuser test123');
        console.log('  node create-user.js list');
        console.log('  node create-user.js delete testuser');
        return;
    }
    
    const command = args[0];
    
    switch (command) {
        case 'list':
            await listUsers();
            break;
            
        case 'create':
            if (args.length !== 3) {
                console.log('错误: 创建用户需要提供用户名和密码');
                console.log('使用方法: node create-user.js create <username> <password>');
                return;
            }
            await createUser(args[1], args[2]);
            break;
            
        case 'delete':
            if (args.length !== 2) {
                console.log('错误: 删除用户需要提供用户名');
                console.log('使用方法: node create-user.js delete <username>');
                return;
            }
            await deleteUser(args[1]);
            break;
            
        default:
            console.log(`未知命令: ${command}`);
            console.log('可用命令: list, create, delete');
    }
    
    // 关闭数据库连接
    await pool.end();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { createUser, listUsers, deleteUser };

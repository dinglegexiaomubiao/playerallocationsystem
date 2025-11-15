const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL数据库连接
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// 中间件
app.use(cors({
    origin: ['https://teamlist.vercel.app', 'http://localhost:3000', 'file://'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session配置
app.use(session({
    secret: process.env.SESSION_SECRET || 'teamlist-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24小时
    }
}));

// 验证数据库连接
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('数据库连接成功');
        
        // 确保users表存在
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.users (
                "name" varchar NOT NULL,
                "password" varchar NULL,
                CONSTRAINT users_pk PRIMARY KEY (name)
            );
        `);
        
        // 创建默认管理员用户（如果不存在）
        const adminExists = await client.query('SELECT * FROM users WHERE name = $1', ['admin']);
        if (adminExists.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await client.query('INSERT INTO users (name, password) VALUES ($1, $2)', ['admin', hashedPassword]);
            console.log('默认管理员用户已创建: admin/admin123');
        }
        
        client.release();
    } catch (err) {
        console.error('数据库连接错误:', err);
    }
}

// 登录接口
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名和密码不能为空' 
            });
        }
        
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE name = $1', [username]);
        client.release();
        
        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: '用户名或密码错误' 
            });
        }
        
        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: '用户名或密码错误' 
            });
        }
        
        // 设置session
        req.session.user = {
            name: user.name
        };
        
        res.json({ 
            success: true, 
            message: '登录成功',
            user: {
                name: user.name
            }
        });
        
    } catch (err) {
        console.error('登录错误:', err);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 检查登录状态
app.get('/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ 
            authenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// 登出接口
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: '登出失败' 
            });
        }
        res.json({ 
            success: true, 
            message: '登出成功' 
        });
    });
});

// 注册用户接口（管理员功能）
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名和密码不能为空' 
            });
        }
        
        // 检查用户名是否已存在
        const client = await pool.connect();
        const existingUser = await client.query('SELECT * FROM users WHERE name = $1', [username]);
        
        if (existingUser.rows.length > 0) {
            client.release();
            return res.status(400).json({ 
                success: false, 
                message: '用户名已存在' 
            });
        }
        
        // 密码加密
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 创建用户
        await client.query('INSERT INTO users (name, password) VALUES ($1, $2)', [username, hashedPassword]);
        client.release();
        
        res.json({ 
            success: true, 
            message: '用户创建成功' 
        });
        
    } catch (err) {
        console.error('注册错误:', err);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 获取所有用户（管理员功能）
app.get('/users', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT name FROM users ORDER BY name');
        client.release();
        
        res.json({ 
            success: true, 
            users: result.rows 
        });
        
    } catch (err) {
        console.error('获取用户列表错误:', err);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 启动服务器
app.listen(PORT, async () => {
    console.log(`API服务器运行在 ${PORT}`);
    await testConnection();
});

module.exports = app;

# 环境变量配置说明
## 环境变量位置

你的环境变量现在配置在以下文件中：

### 1. `.env` 文件（主要配置文件）
**位置**: `e:/1_work/teamlist/.env`

**当前内容**:
```env
# 数据库配置
DATABASE_URL=postgresql://neondb_owner:npg_xZBodH1Auk7n@ep-aged-haze-admxtuaz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# 服务器配置
PORT=3000

# 会话配置
SESSION_SECRET=teamlist-secret-key-2024-change-this-in-production

# 环境设置
NODE_ENV=development
```

### 2. `.env.example` 文件（模板文件）
**位置**: `e:/1_work/teamlist/.env.example`
这个文件作为示例，供其他开发者参考。

## 环境变量说明

| 变量名 | Key | Value | 说明 |
|--------|-----|-------|------|
| `DATABASE_URL` | 数据库连接字符串 | `postgresql://neondb_owner:npg_xZBodH1Auk7n@ep-aged-haze-admxtuaz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` | PostgreSQL数据库连接信息 |
| `PORT` | 服务器端口 | `3000` | 后端服务器运行端口 |
| `SESSION_SECRET` | 会话密钥 | `teamlist-secret-key-2024-change-this-in-production` | 用于session加密的密钥 |
| `NODE_ENV` | 运行环境 | `development` | 当前运行环境（development/production） |

## 如何修改环境变量

### 方法一：直接编辑.env文件
1. 打开 `e:/1_work/teamlist/.env` 文件
2. 修改相应的值
3. 重启服务器使更改生效

### 方法二：命令行临时设置
```bash
# Windows (cmd)
set DATABASE_URL=your_database_url
set PORT=3000
npm start

# Windows (PowerShell)
$env:DATABASE_URL="your_database_url"
$env:PORT="3000"
npm start

# Linux/Mac
export DATABASE_URL="your_database_url"
export PORT="3000"
npm start
```

## 安全建议

1. **不要提交.env文件到版本控制**
   - `.env` 文件已添加到 `.gitignore`
   - 只提交 `.env.example` 作为模板

2. **生产环境配置**
   - 修改 `SESSION_SECRET` 为随机字符串
   - 设置 `NODE_ENV=production`
   - 使用环境特定的数据库连接字符串

3. **数据库安全**
   - 定期更换数据库密码
   - 使用连接池配置
   - 启用SSL连接

## 测试当前配置

运行以下命令测试配置是否正确：

```bash
# 检查环境变量是否加载
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL); console.log('PORT:', process.env.PORT)"

# 测试数据库连接
node create-user.js list
```

## 常见问题

### Q: 数据库连接失败怎么办？
A: 检查 `DATABASE_URL` 中的：
- 用户名和密码是否正确
- 主机地址是否可达
- SSL设置是否正确

### Q: 如何在不同环境使用不同配置？
A: 创建环境特定的.env文件：
- `.env.development` - 开发环境
- `.env.production` - 生产环境
- `.env.local` - 本地覆盖配置

### Q: 如何生成安全的SESSION_SECRET？
A: 使用以下命令生成随机密钥：
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

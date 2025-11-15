# Vercel 部署指南
## 🚀 部署步骤

### 1. 准备工作

确保你的项目结构如下：
```
teamlist/
├── public/                 # 静态文件目录
│   ├── index.html          # 主页面
│   ├── login.html          # 登录页面
│   ├── style.css          # 样式文件
│   ├── script.js          # 主脚本
│   └── auth.js           # 认证脚本
├── api/                   # API服务器
│   └── index.js           # 后端服务器
├── vercel.json           # Vercel配置
├── package.json          # 依赖配置
└── .env.example          # 环境变量示例
```

### 2. Vercel 项目设置

#### 2.1 创建/导入项目
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 连接你的GitHub仓库或直接拖拽上传

#### 2.2 配置环境变量
在 Vercel 项目设置中添加以下环境变量：

| 环境变量名称 | 值 | 说明 |
|---------------|-----|------|
| `database_url` | 你的PostgreSQL连接字符串 | Neon数据库连接 |
| `session_secret` | 随机生成的密钥 | 用于session加密 |
| `NODE_ENV` | `production` | 运行环境 |

#### 2.3 数据库连接字符串格式
```
postgresql://neondb_owner:YOUR_PASSWORD@ep-aged-haze-admxtuaz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3. 部署配置文件

#### 3.1 `vercel.json` 配置说明
- **builds**: 定义构建规则
  - `public/**/*` → 静态文件
  - `api/index.js` → Node.js服务器函数
- **routes**: 定义路由规则
  - `/` → 主页面
  - `/login` → 登录页面
  - `/api/*` → API服务器

#### 3.2 环境变量映射
```json
{
  "env": {
    "DATABASE_URL": "@database_url",
    "SESSION_SECRET": "@session_secret",
    "NODE_ENV": "production"
  }
}
```

### 4. 生成安全的SESSION_SECRET

在终端运行以下命令生成随机密钥：
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. 部署过程

1. **推送代码到GitHub**：
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

2. **自动部署**：
   - Vercel会自动检测到推送并开始部署
   - 部署完成后会得到一个 `.vercel.app` 域名

3. **配置域名**（可选）：
   - 在项目设置中添加自定义域名
   - 配置DNS记录指向Vercel

### 6. 验证部署

#### 6.1 检查前端
访问 `https://your-project.vercel.app` 确认主页面加载正常

#### 6.2 检查登录
访问 `https://your-project.vercel.app/login` 测试登录功能

#### 6.3 检查API
```bash
curl -X GET https://your-project.vercel.app/api/check-auth
```

### 7. 故障排除

#### 7.1 常见错误

**错误**: `No Output Directory named "public" found`
**解决**: 确保 `public` 目录存在且包含 `index.html`

**错误**: `DATABASE_URL is not defined`
**解决**: 检查Vercel环境变量配置

**错误**: `Cannot find module 'dotenv'`
**解决**: 确保 `api/index.js` 中正确引用依赖

#### 7.2 调试方法

1. **查看部署日志**：
   - 在 Vercel Dashboard 中点击项目
   - 查看 "Functions" 标签页的日志

2. **本地测试**：
```bash
# 安装Vercel CLI
npm i -g vercel

# 本地测试
vercel dev
```

3. **环境变量测试**：
在 `api/index.js` 中添加调试代码：
```javascript
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
```

### 8. 安全配置

#### 8.1 生产环境安全
- 使用HTTPS（Vercel自动提供）
- 设置强密码的SESSION_SECRET
- 定期更换数据库密码
- 启用数据库SSL连接

#### 8.2 性能优化
- 启用Vercel的边缘缓存
- 优化静态资源压缩
- 配置适当的缓存头

### 9. 维护和更新

#### 9.1 更新流程
1. 修改代码
2. 测试本地环境
3. 推送到GitHub
4. Vercel自动部署

#### 9.2 回滚
- 在Vercel Dashboard中查看部署历史
- 点击 "..." 菜单选择 "Promote to Production"

### 10. 成本和限制

- **免费额度**: 100GB带宽/月，无限制静态托管
- **函数调用**: 免费额度内足够个人项目使用
- **数据库**: Neon有免费层级

## 📞 支持

如果遇到问题：
1. 检查本指南的故障排除部分
2. 查看[Vercel文档](https://vercel.com/docs)
3. 在GitHub Issues中提问

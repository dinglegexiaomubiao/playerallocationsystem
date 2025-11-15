class AuthService {
    constructor() {
        this.serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? `http://localhost:3000` 
            : `http://${window.location.hostname}:3000`;
    }
    async login(username, password) {
        try {
            const response = await fetch(`${this.serverUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (data.success) {
                // 保存登录状态到localStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('登录请求失败:', error);
            return { success: false, message: '网络连接失败，请检查服务器是否运行' };
        }
    }

    async logout() {
        try {
            const response = await fetch(`${this.serverUrl}/api/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            
            // 清除本地存储
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            
            return { success: true };
        } catch (error) {
            console.error('登出请求失败:', error);
            // 即使请求失败也清除本地存储
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            return { success: true };
        }
    }

    async checkAuth() {
        try {
            // 首先检查本地存储
            const localLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const localUser = localStorage.getItem('currentUser');
            
            if (!localLoggedIn || !localUser) {
                return { authenticated: false };
            }

            // 然后验证服务器session
            const response = await fetch(`${this.serverUrl}/api/check-auth`, {
                credentials: 'include'
            });

            const data = await response.json();
            
            if (data.authenticated) {
                return { authenticated: true, user: data.user };
            } else {
                // 服务器session已过期，清除本地存储
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                return { authenticated: false };
            }
        } catch (error) {
            console.error('验证认证状态失败:', error);
            // 网络错误时，如果本地有登录信息，暂时保持登录状态
            const localLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const localUser = localStorage.getItem('currentUser');
            if (localLoggedIn && localUser) {
                try {
                    return { authenticated: true, user: JSON.parse(localUser) };
                } catch (e) {
                    return { authenticated: false };
                }
            }
            return { authenticated: false };
        }
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }
}

// 登录页面逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 只在登录页面执行
    if (!window.location.pathname.includes('login.html')) {
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    
    const authService = new AuthService();

    // 检查是否已经登录
    authService.checkAuth().then(result => {
        if (result.authenticated) {
            window.location.href = 'index.html';
        }
    });

    // 表单提交处理
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showError('请填写用户名和密码');
            return;
        }

        // 显示加载状态
        setLoading(true);
        hideError();

        try {
            const result = await authService.login(username, password);
            
            if (result.success) {
                // 显示成功消息
                await Swal.fire({
                    icon: 'success',
                    title: '登录成功',
                    text: '正在跳转到主系统...',
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // 跳转到主页面
                window.location.href = 'index.html';
            } else {
                showError(result.message);
            }
        } catch (error) {
            showError('登录过程中发生错误，请重试');
        } finally {
            setLoading(false);
        }
    });

    // 输入框回车登录
    document.getElementById('username').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('password').focus();
        }
    });

    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    function setLoading(isLoading) {
        if (isLoading) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="loading-spinner"></span>正在登录...';
            loading.style.display = 'block';
        } else {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '登录系统';
            loading.style.display = 'none';
        }
    }
});

// 管理员密码
const ADMIN_PASSWORD = "150226"; // 您可以修改这个密码

// 服务器端点 - 使用GitHub Pages来存储数据
const API_URL = "https://charles-150226.github.io/dai/codes.json";
const BACKUP_API_URL = "https://api.github.com/repos/charles-150226/dai/contents/codes.json"; // 备用API端点
const ACCESS_TOKEN = "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"; // GitHub个人访问令牌

// 存储已提交的代码
let submittedCodes = [];

// DOM元素
const codeForm = document.getElementById('codeForm');
const adminPasswordInput = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const codeList = document.getElementById('codeList');
const codesContainer = document.getElementById('codesContainer');

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 检查是否已登录
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    if (isLoggedIn) {
        showMessage('正在加载数据...', 'success');
        await loadCodesFromServer();
        showCodeList();
    }

    // 即使未登录，也尝试加载本地存储的数据作为备份
    if (!isLoggedIn && submittedCodes.length === 0) {
        submittedCodes = JSON.parse(localStorage.getItem('submittedCodes')) || [];
    }
});

// 从服务器加载代码数据
async function loadCodesFromServer() {
    try {
        // 首先尝试从GitHub Pages加载数据
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            cache: 'no-store'
        });

        if (response.ok) {
            const data = await response.json();
            submittedCodes = data || [];
            console.log('成功从GitHub Pages加载数据');
            return;
        }

        // 如果GitHub Pages加载失败，尝试使用GitHub API
        const apiResponse = await fetch(BACKUP_API_URL, {
            headers: {
                'Authorization': `token ${ACCESS_TOKEN}`
            }
        });

        if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            // GitHub API返回的是base64编码的内容，需要解码
            const content = atob(apiData.content);
            submittedCodes = JSON.parse(content) || [];
            console.log('成功从GitHub API加载数据');
        } else {
            throw new Error('无法从服务器加载数据');
        }
    } catch (error) {
        console.error('加载数据失败:', error);
        showMessage('加载数据失败，使用本地存储', 'error');
        // 回退到本地存储
        submittedCodes = JSON.parse(localStorage.getItem('submittedCodes')) || [];
    }
}

// 保存代码数据到服务器
async function saveCodesToServer() {
    try {
        // 首先保存到本地存储作为备份
        localStorage.setItem('submittedCodes', JSON.stringify(submittedCodes));
        console.log('数据已保存到本地存储');

        // 使用GitHub API更新数据
        // 首先获取文件的SHA值（更新文件时需要）
        const getResponse = await fetch(BACKUP_API_URL, {
            headers: {
                'Authorization': `token ${ACCESS_TOKEN}`
            }
        });

        let sha = null;
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
            console.log('获取到文件SHA值:', sha);
        }

        // 更新或创建文件
        const method = sha ? 'PUT' : 'POST';
        const url = sha ? BACKUP_API_URL : BACKUP_API_URL.replace('/contents/codes.json', '/contents/codes.json');

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `token ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: '更新代码数据',
                content: btoa(unescape(encodeURIComponent(JSON.stringify(submittedCodes)))), // 转换为base64，并处理Unicode字符
                sha: sha
            })
        });

        if (response.ok) {
            console.log('数据成功保存到GitHub');
            return true;
        } else {
            const errorData = await response.json();
            console.error('保存到GitHub失败:', errorData);
            throw new Error(`无法保存数据到服务器: ${errorData.message}`);
        }
    } catch (error) {
        console.error('保存数据失败:', error);
        showMessage('保存数据失败，但已保存到本地存储', 'error');
        return false;
    }
}

// 处理代码提交
codeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const title = document.getElementById('title').value;
    const language = document.getElementById('language').value;
    const code = document.getElementById('code').value;
    const description = document.getElementById('description').value;

    // 创建新的代码条目
    const newCode = {
        id: Date.now(),
        username,
        title,
        language,
        code,
        description,
        timestamp: new Date().toLocaleString()
    };

    // 添加到数组
    submittedCodes.push(newCode);

    // 保存到服务器
    const success = await saveCodesToServer();

    if (success) {
        // 显示成功消息
        showMessage('代码提交成功！', 'success');

        // 重置表单
        codeForm.reset();
    }
});

// 处理管理员登录
loginBtn.addEventListener('click', async () => {
    const password = adminPasswordInput.value;

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        showMessage('登录成功！正在加载数据...', 'success');

        // 从服务器加载代码数据
        await loadCodesFromServer();

        // 显示代码列表
        showCodeList();
    } else {
        showMessage('密码错误，请重试！', 'error');
        adminPasswordInput.value = '';
    }
});

// 处理管理员退出登录
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    codeList.classList.add('hidden');
    adminPasswordInput.value = '';
    showMessage('已成功退出登录！', 'success');
});

// 显示已提交的代码列表
function showCodeList() {
    codeList.classList.remove('hidden');
    codesContainer.innerHTML = '';

    if (submittedCodes.length === 0) {
        codesContainer.innerHTML = '<p>暂无提交的代码</p>';
        return;
    }

    // 按时间倒序排列
    const sortedCodes = [...submittedCodes].sort((a, b) => b.id - a.id);

    // 显示每个代码条目
    sortedCodes.forEach(codeEntry => {
        const codeElement = document.createElement('div');
        codeElement.className = 'code-entry';

        codeElement.innerHTML = `
            <div class="code-header">
                <div class="code-title">${codeEntry.title}</div>
                <div class="code-meta">
                    <span>语言: ${codeEntry.language}</span>
                    <span>提交者: ${codeEntry.username}</span>
                    <span>时间: ${codeEntry.timestamp}</span>
                </div>
                <button class="delete-btn" data-id="${codeEntry.id}">删除</button>
            </div>
            <div class="code-content">${escapeHtml(codeEntry.code)}</div>
            ${codeEntry.description ? `<div class="code-description"><strong>描述:</strong> ${codeEntry.description}</div>` : ''}
        `;

        codesContainer.appendChild(codeElement);
    });

    // 添加删除按钮事件监听
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const codeId = parseInt(this.getAttribute('data-id'));
            deleteCode(codeId);
        });
    });
}

// 删除代码
async function deleteCode(id) {
    if (confirm('确定要删除这段代码吗？此操作不可撤销。')) {
        // 从数组中移除代码
        submittedCodes = submittedCodes.filter(code => code.id !== id);

        // 保存到服务器
        const success = await saveCodesToServer();

        if (success) {
            // 重新显示代码列表
            showCodeList();

            // 显示成功消息
            showMessage('代码已成功删除！', 'success');
        }
    }
}

// 显示消息
function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;

    document.querySelector('.container').insertBefore(messageElement, document.querySelector('.section'));

    // 3秒后移除消息
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// HTML转义函数，防止XSS攻击
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, m => map[m]);

}

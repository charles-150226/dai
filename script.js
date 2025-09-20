// 管理员密码
const ADMIN_PASSWORD = "150226"; // 您可以修改这个密码

// 存储已提交的代码
let submittedCodes = JSON.parse(localStorage.getItem('submittedCodes')) || [];

// DOM元素
const codeForm = document.getElementById('codeForm');
const adminPasswordInput = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const codeList = document.getElementById('codeList');
const codesContainer = document.getElementById('codesContainer');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已登录
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    if (isLoggedIn) {
        showCodeList();
    }
});

// 处理代码提交
codeForm.addEventListener('submit', (e) => {
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

    // 添加到数组并保存到本地存储
    submittedCodes.push(newCode);
    localStorage.setItem('submittedCodes', JSON.stringify(submittedCodes));

    // 显示成功消息
    showMessage('代码提交成功！', 'success');

    // 重置表单
    codeForm.reset();
});

// 处理管理员登录
loginBtn.addEventListener('click', () => {
    const password = adminPasswordInput.value;

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        showMessage('登录成功！', 'success');
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
function deleteCode(id) {
    if (confirm('确定要删除这段代码吗？此操作不可撤销。')) {
        // 从数组中移除代码
        submittedCodes = submittedCodes.filter(code => code.id !== id);

        // 更新本地存储
        localStorage.setItem('submittedCodes', JSON.stringify(submittedCodes));

        // 重新显示代码列表
        showCodeList();

        // 显示成功消息
        showMessage('代码已成功删除！', 'success');
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
# 代码提交器

这是一个简单的代码提交系统，允许用户提交代码片段，管理员可以查看和删除这些代码。

## 功能特点

- 用户可以提交代码，包括用户名、标题、编程语言、代码内容和描述
- 管理员可以通过密码登录查看所有提交的代码
- 管理员可以删除任何提交的代码
- 数据存储在GitHub Pages中，实现云端存储
- 本地存储作为备份，确保数据安全

## 使用说明

### 系统要求

- 现代浏览器（支持ES6+）
- 网络连接（用于与GitHub交互）

### 首次设置

1. **准备GitHub仓库**:
   - 确保您有一个GitHub仓库，例如 `charles-150226/dai`
   - 仓库需要启用GitHub Pages功能

2. **生成GitHub个人访问令牌**:
   - 访问 [github.com/settings/tokens](https://github.com/settings/tokens)
   - 点击"Generate new token"或"Generate new token (classic)"
   - 给令牌一个描述性名称
   - 选择权限：勾选 `repo` 权限（包括子权限）
   - 点击"Generate token"
   - 复制生成的令牌（注意：令牌只显示一次）

3. **配置代码提交器**:
   - 打开 `script.js` 文件
   - 确认以下配置：
     ```javascript
     const API_URL = "https://charles-150226.github.io/dai/codes.json";
     const BACKUP_API_URL = "https://api.github.com/repos/charles-150226/dai/contents/codes.json";
     const ACCESS_TOKEN = "ghp_7q0w8d3t5y7u9i1o3p5a7s9d1f3g5h7j9k1l3"; // 已配置的访问令牌
     ```
   - 令牌已经配置，但如果需要更新，请将 `ACCESS_TOKEN` 替换为您的新访问令牌
   - 保存文件

### 使用代码提交器

1. **提交代码**:
   - 打开 `index.html` 文件
   - 填写用户名、代码标题、选择编程语言
   - 输入代码内容和描述（可选）
   - 点击"提交代码"按钮
   - 系统会自动将数据保存到GitHub Pages和本地存储

2. **管理员登录**:
   - 在页面底部的管理员区域输入密码（默认为 `150226`）
   - 点击"登录"按钮
   - 登录成功后，系统会从GitHub Pages加载所有提交的代码

3. **删除代码**:
   - 管理员登录后，每个代码条目旁边都有一个"删除"按钮
   - 点击"删除"按钮，确认后即可删除该代码
   - 删除操作会同步更新GitHub Pages和本地存储

4. **退出登录**:
   - 管理员可以点击"退出登录"按钮安全退出

## 工作原理

- 数据存储：使用GitHub Pages存储 `codes.json` 文件，包含所有提交的代码
- 数据同步：通过GitHub API更新仓库中的文件
- 备份机制：本地存储作为备份，在网络问题时确保数据不丢失
- 加载策略：优先从GitHub Pages加载数据，失败时使用GitHub API，最后回退到本地存储

## 注意事项

- 所有数据都存储在GitHub Pages中，因此需要网络连接才能正常工作
- 请妥善保管您的GitHub访问令牌，不要泄露给他人
- 如果需要修改管理员密码，请在 `script.js` 文件中修改 `ADMIN_PASSWORD` 变量
- 系统会在浏览器控制台显示详细的操作日志，便于调试

## 技术栈

- HTML
- CSS
- JavaScript (ES6+)
- GitHub API
- GitHub Pages

## 故障排除

如果遇到问题，请检查：
1. 网络连接是否正常
2. GitHub访问令牌是否有效
3. 浏览器控制台是否有错误信息
4. GitHub仓库是否正确配置了GitHub Pages

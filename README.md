# Claude API Switcher

一个用于管理 Claude Code CLI 工具 API 配置的桌面应用程序。

## 功能特性

- 🔧 **配置管理**: 读取和修改 `~/.claude/settings.json` 配置文件
- 🔄 **快速切换**: 一键切换不同的 API 配置和 Token
- 💾 **预设保存**: 保存多个 API 配置预设供快速切换
- 🎨 **现代化界面**: 使用 Tauri + React 构建的原生桌面应用
- 🍎 **Mac 原生支持**: 针对 macOS 优化的用户体验
- 📍 **系统托盘支持**: 在状态栏显示图标，支持后台运行
- ⚡ **托盘快速操作**: 直接从状态栏切换配置预设
- 🔍 **智能菜单**: 动态更新托盘菜单显示当前配置状态

## 系统要求

- macOS 10.15 或更高版本
- Claude Code CLI 工具已安装

## 安装使用

### 开发环境

1. 安装依赖：
```bash
# 安装 Rust (如果尚未安装)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安装 Node.js 依赖
npm install

# 安装 Tauri CLI
npm install -g @tauri-apps/cli
```

2. 开发模式运行：
```bash
npm run tauri dev
```

3. 构建生产版本：
```bash
npm run tauri build
```

### 从发布版本安装

1. 从 [Releases](../../releases) 页面下载最新的 `.dmg` 文件
2. 双击安装包并将应用拖入 Applications 文件夹
3. 首次运行时可能需要在系统偏好设置中允许来自未知开发者的应用

## 使用说明

### 首次使用

1. 启动应用后，它会自动读取你当前的 Claude Code 配置
2. 应用会在 macOS 状态栏（右上角）显示一个图标
3. 在"Current Configuration"部分可以查看当前的配置信息
4. 你可以创建新的预设来保存不同的 API 配置

### 系统托盘操作

**状态栏图标功能**：
- **左键点击**: 显示/隐藏主窗口
- **右键点击**: 打开快速操作菜单

**托盘菜单功能**：
- 显示当前配置状态（官方 API 或自定义 API）
- 快速切换到任何已保存的预设（显示前 5 个）
- 显示或隐藏主窗口
- 退出应用程序

### 主窗口操作

**窗口管理**：
- 点击右上角的"Hide to Tray"按钮最小化到系统托盘
- 关闭窗口时应用会隐藏到托盘而不是退出
- 从托盘菜单选择"Quit"才能完全退出应用

### 创建预设

1. 点击"Add Preset"按钮
2. 填写预设名称（如：Production API、Test API）
3. 输入对应的配置信息：
   - **Preset Name**: 预设名称
   - **Base URL**: API 基础地址（默认：https://api.anthropic.com）
   - **Auth Token**: 你的 Anthropic API Token
   - **Max Output Tokens**: 最大输出 Token 数（默认：32000）
   - **Disable Non-essential Traffic**: 是否禁用非必要流量（推荐：Yes）
4. 点击"Save"保存预设

### 切换配置

1. 在预设列表中找到要使用的配置
2. 点击对应预设的"Apply"按钮
3. 应用会自动更新 Claude Code 的配置文件
4. 重启 Claude Code CLI 工具以使新配置生效

### 管理预设

- **编辑**: 点击预设旁的编辑按钮修改配置
- **删除**: 点击删除按钮移除不需要的预设
- **复制当前配置**: 在创建新预设时，可以点击"Copy from Current"复制当前配置

## 技术栈

- **后端**: Rust + Tauri
- **前端**: React + TypeScript + Tailwind CSS
- **构建工具**: Vite
- **图标**: Lucide React

## 目录结构

```
claude-api-switcher/
├── src/                    # React 前端代码
│   ├── App.tsx            # 主应用组件
│   ├── api.ts             # API 调用封装
│   ├── types.ts           # TypeScript 类型定义
│   └── main.tsx           # 应用入口
├── src-tauri/             # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs        # 主程序入口
│   │   └── config.rs      # 配置文件操作
│   ├── Cargo.toml         # Rust 依赖配置
│   └── tauri.conf.json    # Tauri 配置
├── package.json           # Node.js 依赖配置
└── README.md             # 本文件
```

## 安全说明

- 应用只会读写 `~/.claude/` 目录下的配置文件
- API Token 在界面上会进行脱敏显示
- 预设文件保存在本地，不会上传到任何服务器

## 故障排除

### 应用无法启动
- 确保已安装 Claude Code CLI 工具
- 检查 `~/.claude/settings.json` 文件是否存在且格式正确

### 配置切换不生效
- 重启 Claude Code CLI 工具
- 检查 API Token 是否正确
- 确认网络连接正常

### 权限问题
- 在系统偏好设置 > 安全性与隐私中允许应用运行
- 确保应用有读写 `~/.claude/` 目录的权限

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
#!/bin/bash

echo "🚀 Starting Claude API Switcher in development mode..."

# 检查依赖
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust first:"
    echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Node.js/npm is not installed. Please install Node.js first."
    exit 1
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# 启动开发服务器
echo "🔧 Starting development server..."
npm run tauri dev
#!/bin/bash

echo "🚀 Building Claude API Switcher..."

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

# 安装依赖
echo "📦 Installing dependencies..."
npm install

# 构建应用
echo "🔨 Building application..."
npm run tauri build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📦 The built application can be found in src-tauri/target/release/bundle/"
    
    # 查找构建的 .dmg 文件
    DMG_PATH=$(find src-tauri/target/release/bundle/dmg -name "*.dmg" 2>/dev/null | head -1)
    if [ -n "$DMG_PATH" ]; then
        echo "🍎 Mac installer: $DMG_PATH"
    fi
    
    # 查找构建的 .app 文件
    APP_PATH=$(find src-tauri/target/release/bundle/macos -name "*.app" 2>/dev/null | head -1)
    if [ -n "$APP_PATH" ]; then
        echo "📱 Mac application: $APP_PATH"
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
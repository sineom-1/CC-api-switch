#!/bin/bash

APP_PATH="/Users/sineom/workspace/idfairy/CC-api-switch/src-tauri/target/release/bundle/macos/Claude API Switcher.app"

echo "🚀 Launching Claude API Switcher with Pure Emoji Status Bar..."
echo "📱 App location: $APP_PATH"

if [ -d "$APP_PATH" ]; then
    echo "✅ Application found, launching..."
    open "$APP_PATH"
    echo "🎉 Application launched successfully!"
    echo ""
    echo "🎭 Pure Emoji Status Bar Experience:"
    echo "• 😊 Happy emoji = API is fully configured and ready!"
    echo "• 😢 Sad emoji = API needs configuration"
    echo "• 😐 Neutral emoji = Initial state, checking configuration"
    echo "• No logo clutter - just pure, expressive emoji feedback!"
    echo ""
    echo "📍 Status Bar Features:"
    echo "• Look for the EMOJI in your macOS menu bar (no logo distraction)"
    echo "• Instant visual feedback - emotions tell the story!"
    echo "• Left-click the emoji to show/hide the main window"
    echo "• Right-click for comprehensive quick actions menu:"
    echo "  - Configuration status with emoji feedback"
    echo "  - Switch to any saved preset (if configured)" 
    echo "  - Show or hide the main window"
    echo "  - Quit the application"
    echo ""
    echo "🪟 Main Window (Logo Still There):"
    echo "• Beautiful logo display in the header (logo stays in main UI)"
    echo "• Configuration status indicator with emoji feedback"
    echo "• Visual warnings when configuration is incomplete"
    echo "• Professional interface for detailed management"
    echo ""
    echo "💡 Design Philosophy:"
    echo "• Status bar = Pure emoji emotion (simple, instant understanding)"
    echo "• Main window = Professional logo + detailed interface"
    echo "• Best of both worlds: fun status + professional management"
    echo ""
    echo "⚠️  Important: Restart Claude Code CLI after switching configurations"
    echo "🎯 Tip: Watch the emoji change from 😢 to 😊 as you configure!"
else
    echo "❌ Application not found. Please run './build.sh' first."
    exit 1
fi
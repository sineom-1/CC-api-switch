#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;

use config::*;
use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem, WindowEvent,
};

fn create_system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show Window");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide Window");
    let separator = SystemTrayMenuItem::Separator;
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(separator)
        .add_item(quit);

    // Create tray with logo icon
    SystemTray::new()
        .with_menu(tray_menu)
}

fn handle_system_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            let window = app.get_window("main").unwrap();
            if window.is_visible().unwrap() {
                window.hide().unwrap();
            } else {
                window.show().unwrap();
                window.set_focus().unwrap();
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            let id_string = id.clone();
            match id_string.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                _ => {
                    if id_string.starts_with("preset_") {
                        // Handle preset switching from tray menu
                        let preset_name = id_string.strip_prefix("preset_").unwrap().to_string();
                        let app_handle = app.clone();
                        
                        tauri::async_runtime::spawn(async move {
                            if let Ok(presets) = read_presets().await {
                                if let Some(preset) = presets.iter().find(|p| p.name == preset_name) {
                                    if let Err(e) = apply_preset(preset.clone()).await {
                                        eprintln!("Failed to apply preset: {}", e);
                                    } else {
                                        // Update tray menu after switching
                                        let _ = update_system_tray_menu(app_handle.clone()).await;
                                        
                                        // Show notification
                                        if let Some(window) = app_handle.get_window("main") {
                                            let _ = window.emit("preset-applied", &preset_name);
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            }
        },
        _ => {}
    }
}

fn main() {
    tauri::Builder::default()
        .system_tray(create_system_tray())
        .on_system_tray_event(handle_system_tray_event)
        .on_window_event(|event| match event.event() {
            WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            read_claude_config,
            write_claude_config,
            read_presets,
            save_presets,
            apply_preset,
            get_current_config_as_preset,
            update_system_tray_menu,
            check_config_status,
            update_tray_icon
        ])
        .setup(|app| {
            // Update tray icon and menu on startup
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                let _ = update_system_tray_menu(app_handle).await;
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
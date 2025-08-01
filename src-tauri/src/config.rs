use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClaudeConfig {
    pub env: HashMap<String, String>,
    pub permissions: HashMap<String, Vec<String>>,
    #[serde(rename = "feedbackSurveyState")]
    pub feedback_survey_state: Option<HashMap<String, i64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConfigPreset {
    pub name: String,
    pub auth_token: String,
    pub base_url: String,
    pub max_output_tokens: String,
    pub disable_nonessential_traffic: String,
}

fn get_claude_config_path() -> PathBuf {
    let home_dir = dirs::home_dir().expect("Failed to get home directory");
    home_dir.join(".claude").join("settings.json")
}

fn get_presets_path() -> PathBuf {
    let home_dir = dirs::home_dir().expect("Failed to get home directory");
    home_dir.join(".claude").join("api-presets.json")
}

#[command]
pub async fn read_claude_config() -> Result<ClaudeConfig, String> {
    let config_path = get_claude_config_path();
    
    if !config_path.exists() {
        return Err("Claude configuration file not found".to_string());
    }
    
    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;
    
    let config: ClaudeConfig = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config file: {}", e))?;
    
    Ok(config)
}

#[command]
pub async fn write_claude_config(config: ClaudeConfig) -> Result<(), String> {
    let config_path = get_claude_config_path();
    
    let content = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    fs::write(&config_path, content)
        .map_err(|e| format!("Failed to write config file: {}", e))?;
    
    Ok(())
}

#[command]
pub async fn read_presets() -> Result<Vec<ConfigPreset>, String> {
    let presets_path = get_presets_path();
    
    if !presets_path.exists() {
        return Ok(vec![]);
    }
    
    let content = fs::read_to_string(&presets_path)
        .map_err(|e| format!("Failed to read presets file: {}", e))?;
    
    let presets: Vec<ConfigPreset> = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse presets file: {}", e))?;
    
    Ok(presets)
}

#[command]
pub async fn save_presets(presets: Vec<ConfigPreset>) -> Result<(), String> {
    let presets_path = get_presets_path();
    
    let content = serde_json::to_string_pretty(&presets)
        .map_err(|e| format!("Failed to serialize presets: {}", e))?;
    
    fs::write(&presets_path, content)
        .map_err(|e| format!("Failed to write presets file: {}", e))?;
    
    Ok(())
}

#[command]
pub async fn apply_preset(preset: ConfigPreset) -> Result<(), String> {
    let mut config = read_claude_config().await?;
    
    config.env.insert("ANTHROPIC_AUTH_TOKEN".to_string(), preset.auth_token);
    config.env.insert("ANTHROPIC_BASE_URL".to_string(), preset.base_url);
    config.env.insert("CLAUDE_CODE_MAX_OUTPUT_TOKENS".to_string(), preset.max_output_tokens);
    config.env.insert("CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC".to_string(), preset.disable_nonessential_traffic);
    
    write_claude_config(config).await?;
    Ok(())
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConfigStatus {
    pub is_configured: bool,
    pub has_token: bool,
    pub has_base_url: bool,
    pub status_message: String,
}

#[command]
pub async fn check_config_status() -> Result<ConfigStatus, String> {
    match read_claude_config().await {
        Ok(config) => {
            let has_token = config.env.get("ANTHROPIC_AUTH_TOKEN")
                .map(|token| !token.trim().is_empty())
                .unwrap_or(false);
            
            let has_base_url = config.env.get("ANTHROPIC_BASE_URL")
                .map(|url| !url.trim().is_empty())
                .unwrap_or(false);
            
            let is_configured = has_token && has_base_url;
            
            let status_message = if is_configured {
                "Configuration is complete and ready! 😊".to_string()
            } else if has_token && !has_base_url {
                "Missing API base URL 😐".to_string()
            } else if !has_token && has_base_url {
                "Missing authentication token 😐".to_string()
            } else {
                "No configuration found. Please set up your API credentials 😢".to_string()
            };
            
            Ok(ConfigStatus {
                is_configured,
                has_token,
                has_base_url,
                status_message,
            })
        }
        Err(_) => {
            Ok(ConfigStatus {
                is_configured: false,
                has_token: false,
                has_base_url: false,
                status_message: "Configuration file not found 😢".to_string(),
            })
        }
    }
}

#[command]
pub async fn update_tray_icon(app_handle: tauri::AppHandle) -> Result<(), String> {
    let status = check_config_status().await?;
    
    // Use the logo as icon, no need to change title for visual feedback
    // The menu will show the status information instead
    
    Ok(())
}

#[command]
pub async fn get_current_config_as_preset() -> Result<ConfigPreset, String> {
    let config = read_claude_config().await?;
    
    let preset = ConfigPreset {
        name: "Current Config".to_string(),
        auth_token: config.env.get("ANTHROPIC_AUTH_TOKEN").unwrap_or(&"".to_string()).clone(),
        base_url: config.env.get("ANTHROPIC_BASE_URL").unwrap_or(&"https://api.anthropic.com".to_string()).clone(),
        max_output_tokens: config.env.get("CLAUDE_CODE_MAX_OUTPUT_TOKENS").unwrap_or(&"32000".to_string()).clone(),
        disable_nonessential_traffic: config.env.get("CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC").unwrap_or(&"0".to_string()).clone(),
    };
    
    Ok(preset)
}

#[command]
pub async fn update_system_tray_menu(app_handle: tauri::AppHandle) -> Result<(), String> {
    use tauri::{CustomMenuItem, SystemTrayMenu, SystemTrayMenuItem};
    
    let presets = read_presets().await?;
    let current_config = get_current_config_as_preset().await?;
    let status = check_config_status().await?;
    
    // Update tray icon based on configuration status first
    let _ = update_tray_icon(app_handle.clone()).await;
    
    // Create menu items
    let show = CustomMenuItem::new("show".to_string(), "Show Window");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide Window");
    let separator1 = SystemTrayMenuItem::Separator;
    
    let mut tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(separator1);
    
    // Add configuration status info with emoji
    let status_info = CustomMenuItem::new(
        "status".to_string(), 
        status.status_message.clone()
    ).disabled();
    tray_menu = tray_menu.add_item(status_info);
    
    // Add current config info if configured
    if status.is_configured {
        // Find the matching preset name for current config
        let current_preset_name = presets.iter()
            .find(|preset| {
                preset.auth_token == current_config.auth_token &&
                preset.base_url == current_config.base_url &&
                preset.max_output_tokens == current_config.max_output_tokens &&
                preset.disable_nonessential_traffic == current_config.disable_nonessential_traffic
            })
            .map(|preset| preset.name.clone())
            .unwrap_or_else(|| {
                if current_config.base_url.contains("api.anthropic.com") { 
                    "Official API".to_string()
                } else { 
                    "Custom API".to_string()
                }
            });

        let current_info = CustomMenuItem::new(
            "current".to_string(), 
            format!("Current: {}", current_preset_name)
        ).disabled();
        tray_menu = tray_menu.add_item(current_info);
    }
    
    // Add presets if any exist and configuration is valid
    if !presets.is_empty() && status.is_configured {
        let separator2 = SystemTrayMenuItem::Separator;
        tray_menu = tray_menu.add_native_item(separator2);
        
        let switch_label = CustomMenuItem::new("switch_label".to_string(), "Switch to:").disabled();
        tray_menu = tray_menu.add_item(switch_label);
        
        for preset in presets.iter().take(5) { // Limit to 5 presets to avoid menu being too long
            // Check if this preset is currently active
            let is_active = preset.auth_token == current_config.auth_token &&
                           preset.base_url == current_config.base_url &&
                           preset.max_output_tokens == current_config.max_output_tokens &&
                           preset.disable_nonessential_traffic == current_config.disable_nonessential_traffic;
            
            let preset_label = if is_active {
                format!("✓ {}", preset.name)
            } else {
                format!("→ {}", preset.name)
            };
            
            let preset_item = CustomMenuItem::new(
                format!("preset_{}", preset.name),
                preset_label
            );
            tray_menu = tray_menu.add_item(preset_item);
        }
    } else if !presets.is_empty() && !status.is_configured {
        let separator2 = SystemTrayMenuItem::Separator;
        tray_menu = tray_menu.add_native_item(separator2);
        
        let config_needed = CustomMenuItem::new(
            "config_needed".to_string(), 
            "⚠️ Configure API credentials first"
        ).disabled();
        tray_menu = tray_menu.add_item(config_needed);
    }
    
    let separator_final = SystemTrayMenuItem::Separator;
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    
    tray_menu = tray_menu
        .add_native_item(separator_final)
        .add_item(quit);
    
    app_handle.tray_handle().set_menu(tray_menu)
        .map_err(|e| format!("Failed to update tray menu: {}", e))?;
    
    Ok(())
}
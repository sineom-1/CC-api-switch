import { invoke } from '@tauri-apps/api/tauri';
import { ClaudeConfig, ConfigPreset, ConfigStatus } from './types';

export const configApi = {
  async readClaudeConfig(): Promise<ClaudeConfig> {
    return await invoke('read_claude_config');
  },

  async writeClaudeConfig(config: ClaudeConfig): Promise<void> {
    return await invoke('write_claude_config', { config });
  },

  async readPresets(): Promise<ConfigPreset[]> {
    return await invoke('read_presets');
  },

  async savePresets(presets: ConfigPreset[]): Promise<void> {
    return await invoke('save_presets', { presets });
  },

  async applyPreset(preset: ConfigPreset): Promise<void> {
    return await invoke('apply_preset', { preset });
  },

  async getCurrentConfigAsPreset(): Promise<ConfigPreset> {
    return await invoke('get_current_config_as_preset');
  },

  async updateSystemTrayMenu(): Promise<void> {
    return await invoke('update_system_tray_menu');
  },

  async checkConfigStatus(): Promise<ConfigStatus> {
    return await invoke('check_config_status');
  },

  async updateTrayIcon(): Promise<void> {
    return await invoke('update_tray_icon');
  },
};
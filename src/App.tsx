import { useState, useEffect } from 'react';
import { Plus, Settings, Check, X, Edit, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { listen } from '@tauri-apps/api/event';
import { configApi } from './api';
import { ConfigPreset, ConfigStatus } from './types';
import './App.css';

function App() {
  const [presets, setPresets] = useState<ConfigPreset[]>([]);
  const [currentConfig, setCurrentConfig] = useState<ConfigPreset | null>(null);
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPreset, setEditingPreset] = useState<ConfigPreset | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<ConfigPreset>({
    name: '',
    auth_token: '',
    base_url: 'https://api.anthropic.com',
    max_output_tokens: '32000',
    disable_nonessential_traffic: '1',
  });

  useEffect(() => {
    loadData();
    
    // Listen for preset applied events from tray menu
    const unlisten = listen('preset-applied', (event) => {
      const presetName = event.payload as string;
      showMessage('success', `Applied preset: ${presetName} (from tray menu)`);
      loadData(); // Refresh data
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  const loadData = async () => {
    try {
      const [presetsData, currentConfigData, statusData] = await Promise.all([
        configApi.readPresets(),
        configApi.getCurrentConfigAsPreset(),
        configApi.checkConfigStatus(),
      ]);
      setPresets(presetsData);
      setCurrentConfig(currentConfigData);
      setConfigStatus(statusData);
    } catch (error) {
      showMessage('error', `Failed to load data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const updateTrayMenu = async () => {
    try {
      await configApi.updateSystemTrayMenu();
    } catch (error) {
      console.error('Failed to update tray menu:', error);
    }
  };

  const handleSavePreset = async () => {
    if (!formData.name.trim()) {
      showMessage('error', 'Preset name is required');
      return;
    }

    try {
      let updatedPresets;
      if (editingPreset) {
        updatedPresets = presets.map(p => 
          p.name === editingPreset.name ? formData : p
        );
      } else {
        if (presets.some(p => p.name === formData.name)) {
          showMessage('error', 'Preset name already exists');
          return;
        }
        updatedPresets = [...presets, formData];
      }

      await configApi.savePresets(updatedPresets);
      setPresets(updatedPresets);
      await updateTrayMenu(); // Update tray menu with new presets
      resetForm();
      showMessage('success', `Preset ${editingPreset ? 'updated' : 'saved'} successfully`);
    } catch (error) {
      showMessage('error', `Failed to save preset: ${error}`);
    }
  };

  const handleApplyPreset = async (preset: ConfigPreset) => {
    try {
      await configApi.applyPreset(preset);
      const newCurrentConfig = await configApi.getCurrentConfigAsPreset();
      setCurrentConfig(newCurrentConfig);
      await updateTrayMenu(); // Update tray menu to reflect current config
      showMessage('success', `Applied preset: ${preset.name}`);
    } catch (error) {
      showMessage('error', `Failed to apply preset: ${error}`);
    }
  };

  const handleDeletePreset = async (presetName: string) => {
    if (!confirm(`Are you sure you want to delete "${presetName}"?`)) return;

    try {
      const updatedPresets = presets.filter(p => p.name !== presetName);
      await configApi.savePresets(updatedPresets);
      setPresets(updatedPresets);
      await updateTrayMenu(); // Update tray menu after deletion
      showMessage('success', 'Preset deleted successfully');
    } catch (error) {
      showMessage('error', `Failed to delete preset: ${error}`);
    }
  };

  const handleEditPreset = (preset: ConfigPreset) => {
    setFormData(preset);
    setEditingPreset(preset);
    setShowAddForm(true);
  };

  const handleCopyFromCurrent = () => {
    if (currentConfig) {
      setFormData({
        ...currentConfig,
        name: 'New Preset',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      auth_token: '',
      base_url: 'https://api.anthropic.com',
      max_output_tokens: '32000',
      disable_nonessential_traffic: '1',
    });
    setShowAddForm(false);
    setEditingPreset(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-4">
                <img 
                  src="/logo.png" 
                  alt="Claude API Switcher Logo" 
                  className="h-16 w-auto"
                  onError={(e) => {
                    // Hide image if logo not found
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Claude API Switcher</h1>
                <p className="text-gray-600">Manage your Claude Code API configurations with ease</p>
              </div>
            </div>
          </div>
        </header>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Current Configuration */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold">Current Configuration</h2>
            </div>
            {configStatus && (
              <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                configStatus.is_configured 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {configStatus.is_configured ? (
                  <>😊 Configured</>
                ) : (
                  <>😢 Not Configured</>
                )}
              </div>
            )}
          </div>
          
          {configStatus && !configStatus.is_configured && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                <span className="text-yellow-800 text-sm">{configStatus.status_message}</span>
              </div>
            </div>
          )}
          
          {currentConfig && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Base URL:</span>
                <p className="text-gray-600 break-all">{currentConfig.base_url}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Max Output Tokens:</span>
                <p className="text-gray-600">{currentConfig.max_output_tokens}</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Auth Token:</span>
                <p className="text-gray-600 font-mono break-all">
                  {currentConfig.auth_token ? (
                    `${currentConfig.auth_token.slice(0, 20)}...${currentConfig.auth_token.slice(-10)}`
                  ) : (
                    <span className="text-red-500">No token configured</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Presets Management */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Configuration Presets</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Preset
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-medium mb-4">
                {editingPreset ? 'Edit Preset' : 'Add New Preset'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Preset Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Production API"
                  />
                </div>
                <div>
                  <label className="form-label">Base URL</label>
                  <input
                    type="text"
                    value={formData.base_url}
                    onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                    className="form-input"
                    placeholder="https://api.anthropic.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Auth Token</label>
                  <input
                    type="password"
                    value={formData.auth_token}
                    onChange={(e) => setFormData({ ...formData, auth_token: e.target.value })}
                    className="form-input"
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <label className="form-label">Max Output Tokens</label>
                  <input
                    type="text"
                    value={formData.max_output_tokens}
                    onChange={(e) => setFormData({ ...formData, max_output_tokens: e.target.value })}
                    className="form-input"
                    placeholder="32000"
                  />
                </div>
                <div>
                  <label className="form-label">Disable Non-essential Traffic</label>
                  <select
                    value={formData.disable_nonessential_traffic}
                    onChange={(e) => setFormData({ ...formData, disable_nonessential_traffic: e.target.value })}
                    className="form-input"
                  >
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={handleCopyFromCurrent}
                  className="btn-secondary flex items-center"
                  disabled={!currentConfig}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy from Current
                </button>
                <div className="flex space-x-2">
                  <button onClick={resetForm} className="btn-secondary flex items-center">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button onClick={handleSavePreset} className="btn-primary flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    {editingPreset ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Presets List */}
          <div className="space-y-4">
            {presets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No presets configured. Add your first preset to get started.
              </p>
            ) : (
              presets.map((preset) => (
                <div key={preset.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{preset.name}</h3>
                    <p className="text-sm text-gray-600">{preset.base_url}</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      Token: {preset.auth_token.slice(0, 15)}...
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className="btn-primary text-sm"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => handleEditPreset(preset)}
                      className="btn-secondary text-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePreset(preset.name)}
                      className="btn-danger text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
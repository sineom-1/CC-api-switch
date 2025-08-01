export interface ClaudeConfig {
  env: Record<string, string>;
  permissions: Record<string, string[]>;
  feedbackSurveyState?: Record<string, number>;
}

export interface ConfigStatus {
  is_configured: boolean;
  has_token: boolean;
  has_base_url: boolean;
  status_message: string;
}

export interface ConfigPreset {
  name: string;
  auth_token: string;
  base_url: string;
  max_output_tokens: string;
  disable_nonessential_traffic: string;
}
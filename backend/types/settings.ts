export type SettingsLanguage = 'en-US' | 'fr-FR';
export type SettingsTheme = 'light' | 'dark';
export type UnitsSystem = 'metric' | 'imperial';
export type ProfileVisibility = 'private' | 'community';

export interface UserSettingsRecord {
  user_id: string;
  language: SettingsLanguage;
  theme: SettingsTheme;
  units_system: UnitsSystem;
  profile_visibility: ProfileVisibility;
  share_location: boolean;
  allow_analytics: boolean;
  push_notifications: boolean;
  email_alerts: boolean;
  created_at?: string;
  updated_at?: string;
}

export type UserSettingsUpdate = Partial<Omit<UserSettingsRecord, 'user_id' | 'created_at' | 'updated_at'>>;

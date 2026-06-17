import api from './api';
import type { SettingsTheme, UserSettings, UserSettingsUpdate } from '../types/settings';

const SETTINGS_STORAGE_KEY = 'agro_user_settings';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  language: 'en-US',
  theme: 'light',
  units_system: 'metric',
  profile_visibility: 'community',
  share_location: true,
  allow_analytics: true,
  push_notifications: true,
  email_alerts: false,
};

export const loadStoredSettings = (): UserSettings => {
  try {
    const rawValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!rawValue) {
      return DEFAULT_USER_SETTINGS;
    }

    return {
      ...DEFAULT_USER_SETTINGS,
      ...(JSON.parse(rawValue) as Partial<UserSettings>),
    };
  } catch {
    return DEFAULT_USER_SETTINGS;
  }
};

export const persistSettings = (settings: UserSettings) => {
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

export const applyThemeToDocument = (theme: SettingsTheme) => {
  const root = document.documentElement;
  root.classList.toggle('theme-dark', theme === 'dark');
  root.dataset.theme = theme;
};

// Frontend workflow:
// 1. Load local settings immediately for fast startup and theme continuity.
// 2. Refresh from the backend after login to sync Supabase preferences.
export const fetchUserSettings = async () => {
  const { data } = await api.get('/settings');
  return {
    ...DEFAULT_USER_SETTINGS,
    ...(data.data ?? {}),
  } as UserSettings;
};

// Save a partial payload; the backend validates and merges it with the
// existing record before persisting the full settings object in Supabase.
export const saveUserSettings = async (settings: UserSettingsUpdate) => {
  const { data } = await api.put('/settings', settings);
  return {
    ...DEFAULT_USER_SETTINGS,
    ...(data.data ?? {}),
  } as UserSettings;
};

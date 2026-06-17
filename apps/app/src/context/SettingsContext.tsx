import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  applyThemeToDocument,
  DEFAULT_USER_SETTINGS,
  fetchUserSettings,
  loadStoredSettings,
  persistSettings,
  saveUserSettings,
} from '../services/userSettings';
import type { SettingsTheme, UserSettings, UserSettingsUpdate } from '../types/settings';

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  saving: boolean;
  error: string;
  refreshSettings: () => Promise<void>;
  updateSettings: (updates: UserSettingsUpdate) => Promise<UserSettings>;
  previewTheme: (theme: SettingsTheme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(() => loadStoredSettings());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    applyThemeToDocument(settings.theme);
    persistSettings(settings);
  }, [settings]);

  const refreshSettings = async () => {
    if (!isAuthenticated || !token) {
      const nextSettings = loadStoredSettings();
      setSettings(nextSettings);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const remoteSettings = await fetchUserSettings();
      setSettings(remoteSettings);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unable to load your settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshSettings();
  }, [isAuthenticated, token]);

  const updateSettings = async (updates: UserSettingsUpdate) => {
    const previousSettings = settings;
    const optimisticSettings = {
      ...previousSettings,
      ...updates,
    };

    setSettings(optimisticSettings);

    if (!isAuthenticated || !token) {
      return optimisticSettings;
    }

    try {
      setSaving(true);
      setError('');
      const savedSettings = await saveUserSettings(updates);
      setSettings(savedSettings);
      return savedSettings;
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unable to save your settings.');
      setSettings(previousSettings);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const previewTheme = (theme: SettingsTheme) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      theme,
    }));
  };

  const value = useMemo(
    () => ({
      settings,
      loading,
      saving,
      error,
      refreshSettings,
      updateSettings,
      previewTheme,
    }),
    [error, loading, saving, settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
};

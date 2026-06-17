import { supabaseServiceClient } from '../config/supabase.js';
import type {
  ProfileVisibility,
  SettingsLanguage,
  SettingsTheme,
  UnitsSystem,
  UserSettingsRecord,
  UserSettingsUpdate,
} from '../types/settings.js';

const ALLOWED_LANGUAGES: SettingsLanguage[] = ['en-US', 'fr-FR'];
const ALLOWED_THEMES: SettingsTheme[] = ['light', 'dark'];
const ALLOWED_UNITS: UnitsSystem[] = ['metric', 'imperial'];
const ALLOWED_VISIBILITY: ProfileVisibility[] = ['private', 'community'];

export const DEFAULT_USER_SETTINGS: Omit<UserSettingsRecord, 'user_id'> = {
  language: 'en-US',
  theme: 'light',
  units_system: 'metric',
  profile_visibility: 'community',
  share_location: true,
  allow_analytics: true,
  push_notifications: true,
  email_alerts: false,
};

const createHttpError = (message: string, statusCode: number) =>
  Object.assign(new Error(message), { statusCode });

const ensureLanguage = (value: unknown) => {
  if (value === undefined) return;
  if (!ALLOWED_LANGUAGES.includes(value as SettingsLanguage)) {
    throw createHttpError('Unsupported language selection.', 400);
  }
};

const ensureTheme = (value: unknown) => {
  if (value === undefined) return;
  if (!ALLOWED_THEMES.includes(value as SettingsTheme)) {
    throw createHttpError('Unsupported theme selection.', 400);
  }
};

const ensureUnits = (value: unknown) => {
  if (value === undefined) return;
  if (!ALLOWED_UNITS.includes(value as UnitsSystem)) {
    throw createHttpError('Unsupported units system.', 400);
  }
};

const ensureVisibility = (value: unknown) => {
  if (value === undefined) return;
  if (!ALLOWED_VISIBILITY.includes(value as ProfileVisibility)) {
    throw createHttpError('Unsupported privacy visibility option.', 400);
  }
};

const ensureBoolean = (value: unknown, label: string) => {
  if (value === undefined) return;
  if (typeof value !== 'boolean') {
    throw createHttpError(`${label} must be true or false.`, 400);
  }
};

const validateSettingsUpdate = (settings: UserSettingsUpdate) => {
  ensureLanguage(settings.language);
  ensureTheme(settings.theme);
  ensureUnits(settings.units_system);
  ensureVisibility(settings.profile_visibility);
  ensureBoolean(settings.share_location, 'share_location');
  ensureBoolean(settings.allow_analytics, 'allow_analytics');
  ensureBoolean(settings.push_notifications, 'push_notifications');
  ensureBoolean(settings.email_alerts, 'email_alerts');
};

const normalizeRow = (userId: string, row?: Partial<UserSettingsRecord> | null): UserSettingsRecord => ({
  user_id: userId,
  ...DEFAULT_USER_SETTINGS,
  ...(row ?? {}),
});

// Frontend settings are fetched right after login. This method guarantees
// that the app always receives a complete settings object, even for a user
// who has never opened the settings page before.
export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabaseServiceClient
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw createHttpError(`Unable to load user settings: ${error.message}`, 400);
  }

  if (!data) {
    return createDefaultUserSettings(userId);
  }

  return normalizeRow(userId, data as Partial<UserSettingsRecord>);
};

export const createDefaultUserSettings = async (userId: string) => {
  const payload: UserSettingsRecord = {
    user_id: userId,
    ...DEFAULT_USER_SETTINGS,
  };

  const { data, error } = await supabaseServiceClient
    .from('user_settings')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) {
    throw createHttpError(`Unable to initialize user settings: ${error.message}`, 400);
  }

  return normalizeRow(userId, data as Partial<UserSettingsRecord>);
};

// The frontend saves a partial payload; the backend validates and merges it
// before writing to Supabase so that missing fields keep their previous values.
export const saveUserSettings = async (userId: string, settings: UserSettingsUpdate) => {
  validateSettingsUpdate(settings);

  const currentSettings = await getUserSettings(userId);
  const nextSettings: UserSettingsRecord = {
    ...currentSettings,
    ...settings,
    user_id: userId,
  };

  const { data, error } = await supabaseServiceClient
    .from('user_settings')
    .upsert(nextSettings, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) {
    throw createHttpError(`Unable to save user settings: ${error.message}`, 400);
  }

  return normalizeRow(userId, data as Partial<UserSettingsRecord>);
};

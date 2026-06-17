import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Globe,
  LoaderCircle,
  LogOut,
  Mail,
  Moon,
  Ruler,
  Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { useSettings } from '../../context/SettingsContext';
import type { UserSettings } from '../../types/settings';

const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-all duration-300 ${
      enabled ? 'bg-primary justify-end' : 'bg-slate-200 justify-start'
    }`}
  >
    <div className="h-full w-[27px] rounded-full bg-white shadow-md" />
  </button>
);

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { hasPermission } = usePermissions();
  const { settings, loading, saving, error, updateSettings, previewTheme } = useSettings();
  const [formState, setFormState] = useState<UserSettings>(settings);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setFormState(settings);
  }, [settings]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(formState) !== JSON.stringify(settings);
  }, [formState, settings]);

  const updateField = <Key extends keyof UserSettings>(key: Key, value: UserSettings[Key]) => {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
    setSuccessMessage('');

    if (key === 'theme') {
      previewTheme(value as UserSettings['theme']);
    }
  };

  const validateForm = () => {
    if (!formState.language) return 'Please choose a language.';
    if (!formState.theme) return 'Please choose a theme.';
    if (!formState.units_system) return 'Please choose a units system.';
    if (!formState.profile_visibility) return 'Please choose a privacy option.';
    return '';
  };

  const handleSave = async () => {
    if (!hasPermission('settings.update')) {
      setValidationError('Your role is not allowed to update settings.');
      return;
    }

    const nextValidationError = validateForm();
    setValidationError(nextValidationError);
    setSuccessMessage('');

    if (nextValidationError) {
      return;
    }

    try {
      await updateSettings(formState);
      setSuccessMessage('Your settings were saved successfully.');
    } catch {
      // The shared provider already exposes the backend error message.
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-[var(--app-surface)] text-[var(--app-text)]"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-primary/10 bg-[var(--app-card)] p-4 pb-2 backdrop-blur-sm">
        <button
          onClick={() => navigate(-1)}
          className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-primary/10"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-[var(--app-text)] flex-1 ml-4">Settings</h2>
      </header>

      <main className="flex flex-1 flex-col pb-10">
        <section className="px-4 pt-4">
          <div className="rounded-3xl bg-gradient-to-br from-primary via-[#1b6472] to-[#2c9074] p-5 text-white shadow-xl shadow-primary/10">
            <h3 className="text-xl font-bold">Personalize your AgroSmart workspace</h3>
            <p className="mt-2 text-sm leading-6 text-white/80">
              These preferences are loaded right after login, then synced back to Supabase when you save.
            </p>
          </div>
        </section>

        {(validationError || error || successMessage) && (
          <section className="px-4 pt-4">
            {validationError && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                {validationError}
              </div>
            )}
            {!validationError && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
            {!validationError && !error && successMessage && (
              <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <CheckCircle2 size={16} />
                {successMessage}
              </div>
            )}
          </section>
        )}

        <section className="mt-4">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-4 pb-2">Notifications</h3>
          <div className="bg-[var(--app-card)]">
            <div className="flex min-h-[64px] items-center justify-between gap-4 border-b border-primary/5 px-4">
              <div className="flex items-center gap-4">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                  <Bell size={20} />
                </div>
                <div className="flex flex-col">
                  <p className="text-base font-medium text-[var(--app-text)]">Push Notifications</p>
                  <p className="text-xs text-[var(--app-muted)] text-nowrap">Receive real-time alerts</p>
                </div>
              </div>
              <Toggle
                enabled={formState.push_notifications}
                onToggle={() => updateField('push_notifications', !formState.push_notifications)}
              />
            </div>

            <div className="flex min-h-[64px] items-center justify-between gap-4 px-4">
              <div className="flex items-center gap-4">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                  <Mail size={20} />
                </div>
                <div className="flex flex-col">
                  <p className="text-base font-medium text-[var(--app-text)]">Email Alerts</p>
                  <p className="text-xs text-[var(--app-muted)] text-nowrap">Weekly summaries and reports</p>
                </div>
              </div>
              <Toggle
                enabled={formState.email_alerts}
                onToggle={() => updateField('email_alerts', !formState.email_alerts)}
              />
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-4 pb-2">Preferences</h3>
          <div className="bg-[var(--app-card)]">
            <div className="flex min-h-[64px] items-center justify-between gap-4 border-b border-primary/5 px-4">
              <div className="flex items-center gap-4">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                  <Globe size={20} />
                </div>
                <div className="flex flex-col">
                  <p className="text-base font-medium text-[var(--app-text)]">Language</p>
                  <p className="text-xs text-[var(--app-muted)]">Saved and restored on every login</p>
                </div>
              </div>
              <select
                value={formState.language}
                onChange={(event) => updateField('language', event.target.value as UserSettings['language'])}
                className="rounded-xl border border-slate-200 bg-[var(--app-card)] px-3 py-2 text-sm text-[var(--app-text)] outline-none transition focus:border-primary"
              >
                <option value="en-US">English (US)</option>
                <option value="fr-FR">French (FR)</option>
              </select>
            </div>

            <div className="flex min-h-[64px] items-center justify-between gap-4 border-b border-primary/5 px-4">
              <div className="flex items-center gap-4">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                  <Ruler size={20} />
                </div>
                <div className="flex flex-col">
                  <p className="text-base font-medium text-[var(--app-text)]">Unit System</p>
                  <p className="text-xs text-[var(--app-muted)]">Used by weather and future crop measurements</p>
                </div>
              </div>
              <select
                value={formState.units_system}
                onChange={(event) =>
                  updateField('units_system', event.target.value as UserSettings['units_system'])
                }
                className="rounded-xl border border-slate-200 bg-[var(--app-card)] px-3 py-2 text-sm text-[var(--app-text)] outline-none transition focus:border-primary"
              >
                <option value="metric">Metric (C, kg, mm)</option>
                <option value="imperial">Imperial (F, lb, in)</option>
              </select>
            </div>

            <div className="flex min-h-[64px] items-center justify-between gap-4 px-4">
              <div className="flex items-center gap-4">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                  <Moon size={20} />
                </div>
                <div className="flex flex-col">
                  <p className="text-base font-medium text-[var(--app-text)]">Appearance</p>
                  <p className="text-xs text-[var(--app-muted)]">Theme preview applies instantly in the UI</p>
                </div>
              </div>
              <select
                value={formState.theme}
                onChange={(event) => updateField('theme', event.target.value as UserSettings['theme'])}
                className="rounded-xl border border-slate-200 bg-[var(--app-card)] px-3 py-2 text-sm text-[var(--app-text)] outline-none transition focus:border-primary"
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-4 pb-2">Privacy</h3>
          <div className="bg-[var(--app-card)]">
            <div className="flex min-h-[64px] items-center justify-between gap-4 border-b border-primary/5 px-4">
              <div className="flex items-center gap-4">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                  <Shield size={20} />
                </div>
                <div className="flex flex-col">
                  <p className="text-base font-medium text-[var(--app-text)]">Profile Visibility</p>
                  <p className="text-xs text-[var(--app-muted)]">Control who can discover your presence in the app</p>
                </div>
              </div>
              <select
                value={formState.profile_visibility}
                onChange={(event) =>
                  updateField(
                    'profile_visibility',
                    event.target.value as UserSettings['profile_visibility'],
                  )
                }
                className="rounded-xl border border-slate-200 bg-[var(--app-card)] px-3 py-2 text-sm text-[var(--app-text)] outline-none transition focus:border-primary"
              >
                <option value="community">Visible to community</option>
                <option value="private">Private account</option>
              </select>
            </div>

            <div className="flex min-h-[64px] items-center justify-between gap-4 border-b border-primary/5 px-4">
              <div className="flex flex-col">
                <p className="text-base font-medium text-[var(--app-text)]">Share location for precision weather</p>
                <p className="text-xs text-[var(--app-muted)]">Improves local forecasts and crop suggestions</p>
              </div>
              <Toggle
                enabled={formState.share_location}
                onToggle={() => updateField('share_location', !formState.share_location)}
              />
            </div>

            <div className="flex min-h-[64px] items-center justify-between gap-4 px-4">
              <div className="flex flex-col">
                <p className="text-base font-medium text-[var(--app-text)]">Allow personalized analytics</p>
                <p className="text-xs text-[var(--app-muted)]">Lets AgroSmart tailor dashboards and insights</p>
              </div>
              <Toggle
                enabled={formState.allow_analytics}
                onToggle={() => updateField('allow_analytics', !formState.allow_analytics)}
              />
            </div>
          </div>
        </section>

        <section className="px-4 pt-8">
          <button
            onClick={() => void handleSave()}
            disabled={saving || loading || !hasChanges || !hasPermission('settings.update')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {(saving || loading) && <LoaderCircle size={18} className="animate-spin" />}
            {saving ? 'Saving settings...' : loading ? 'Loading settings...' : 'Save settings'}
          </button>
        </section>

        <section className="mt-8">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-4 pb-2">Session</h3>
          <div className="flex min-h-[64px] items-center justify-between gap-4 bg-[var(--app-card)] px-4">
            <div className="flex items-center gap-4">
              <div className="text-red-500 flex items-center justify-center rounded-lg bg-red-50 shrink-0 size-10">
                <LogOut size={20} />
              </div>
              <div className="flex flex-col">
                <p className="text-base font-medium text-[var(--app-text)]">Logout</p>
                <p className="text-xs text-[var(--app-muted)]">Ends the current session and returns to login</p>
              </div>
            </div>
            <button
              onClick={() => void handleLogout()}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        </section>

        <div className="mt-auto px-4 pt-12">
          <p className="mb-4 mt-6 text-center text-xs font-light text-[var(--app-muted)]">
            AgroSmart v2.4.0 - Built for sustainable farming
          </p>
        </div>
      </main>
    </motion.div>
  );
};

export default Settings;

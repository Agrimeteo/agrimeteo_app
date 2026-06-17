import React, { useEffect, useState } from 'react';
import {
  fetchAdminAnalytics,
  fetchAdminWeatherAlerts,
} from '../../services/adminAnalytics';
import {
  AdminPreferenceState,
  defaultAdminPreferences,
  exportJson,
  loadAdminPreferences,
  resetAdminPreferences,
  saveAdminPreferences,
} from '../../services/adminTools';

const AdminSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<AdminPreferenceState>(defaultAdminPreferences);
  const [feedback, setFeedback] = useState<string>('');
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    setPreferences(loadAdminPreferences());
  }, []);

  const setMessage = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 4000);
  };

  const updateNotifications = (key: keyof AdminPreferenceState['notifications'], value: boolean) => {
    setPreferences((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [key]: value,
      },
    }));
  };

  const updateSystemSettings = (key: keyof AdminPreferenceState['systemSettings'], value: boolean) => {
    setPreferences((current) => ({
      ...current,
      systemSettings: {
        ...current.systemSettings,
        [key]: value,
      },
    }));
  };

  const updateSecurity = (key: keyof AdminPreferenceState['security'], value: string) => {
    setPreferences((current) => ({
      ...current,
      security: {
        ...current.security,
        [key]: value,
      },
    }));
  };

  const persistPreferences = (message: string) => {
    saveAdminPreferences(preferences);
    setMessage(message);
  };

  const exportAllData = async (mode: 'export' | 'backup') => {
    setBusyAction(mode);
    try {
      const [analytics, weatherAlerts] = await Promise.all([
        fetchAdminAnalytics(),
        fetchAdminWeatherAlerts(),
      ]);

      exportJson(
        `${mode === 'backup' ? 'admin-backup' : 'admin-export'}-${new Date().toISOString().slice(0, 10)}.json`,
        {
          generatedAt: new Date().toISOString(),
          preferences,
          analytics,
          weatherAlerts,
        },
      );
      setMessage(mode === 'backup' ? 'Database snapshot downloaded.' : 'Admin data export downloaded.');
    } catch (error) {
      console.error(`Failed to ${mode} admin data`, error);
      setMessage(`Unable to ${mode} admin data right now.`);
    } finally {
      setBusyAction(null);
    }
  };

  const clearCache = async () => {
    setBusyAction('cache');
    try {
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }
      setMessage('Browser caches cleared for this app.');
    } catch (error) {
      console.error('Failed to clear cache', error);
      setMessage('Unable to clear cache right now.');
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-600">Configure system preferences and manage application settings</p>
      </div>

      {feedback && (
        <div className="mb-6 rounded-xl border border-[#71B280]/20 bg-[#71B280]/10 px-4 py-3 text-sm text-[#13515e]">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Notification Settings</h2>
          <div className="space-y-4">
            {([
              ['email', 'Email Notifications', 'Receive alerts via email'],
              ['push', 'Push Notifications', 'Receive push notifications'],
              ['sms', 'SMS Alerts', 'Receive critical alerts via SMS'],
            ] as const).map(([key, label, description]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">{label}</h3>
                  <p className="text-xs text-slate-500">{description}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications[key]}
                    onChange={(event) => updateNotifications(key, event.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-[#13515e] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#13515e]/25 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">System Configuration</h2>
          <div className="space-y-4">
            {([
              ['maintenance', 'Maintenance Mode', 'Put system in maintenance mode', 'red'],
              ['debug', 'Debug Mode', 'Enable detailed logging', 'slate'],
              ['analytics', 'Analytics', 'Collect usage analytics', 'green'],
            ] as const).map(([key, label, description, tone]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">{label}</h3>
                  <p className="text-xs text-slate-500">{description}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={preferences.systemSettings[key]}
                    onChange={(event) => updateSystemSettings(key, event.target.checked)}
                    className="peer sr-only"
                  />
                  <div
                    className={`h-6 w-11 rounded-full bg-slate-200 peer-focus:outline-none peer-focus:ring-4 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full ${
                      tone === 'red'
                        ? 'peer-focus:ring-red-300 peer-checked:bg-red-600'
                        : 'peer-focus:ring-[#13515e]/25 peer-checked:bg-[#13515e]'
                    }`}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Data Management</h2>
          <div className="space-y-4">
            <button
              onClick={() => exportAllData('export')}
              disabled={busyAction === 'export'}
              className="w-full rounded-lg bg-[#13515e] px-4 py-2 text-white transition-colors hover:bg-[#13515e]/90 disabled:opacity-60"
            >
              {busyAction === 'export' ? 'Exporting...' : 'Export All Data'}
            </button>
            <button
              onClick={() => exportAllData('backup')}
              disabled={busyAction === 'backup'}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              {busyAction === 'backup' ? 'Preparing backup...' : 'Backup Database'}
            </button>
            <button
              onClick={clearCache}
              disabled={busyAction === 'cache'}
              className="w-full rounded-lg border border-red-200 px-4 py-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              {busyAction === 'cache' ? 'Clearing cache...' : 'Clear Cache'}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Security</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Session Timeout</label>
              <select
                value={preferences.security.sessionTimeout}
                onChange={(event) => updateSecurity('sessionTimeout', event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/20"
              >
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password Policy</label>
              <select
                value={preferences.security.passwordPolicy}
                onChange={(event) => updateSecurity('passwordPolicy', event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/20"
              >
                <option>Basic (8+ characters)</option>
                <option>Strong (12+ chars, mixed case)</option>
                <option>Very Strong (16+ chars, symbols)</option>
              </select>
            </div>
            <button
              onClick={() => persistPreferences('Security settings saved.')}
              className="w-full rounded-lg bg-[#71B280] px-4 py-2 text-white transition-colors hover:bg-[#71B280]/90"
            >
              Update Security Settings
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={() => {
            setPreferences(resetAdminPreferences());
            setMessage('Preferences reset to defaults.');
          }}
          className="rounded-lg border border-slate-200 px-6 py-2 text-slate-600 transition-colors hover:bg-slate-50"
        >
          Reset to Defaults
        </button>
        <button
          onClick={() => persistPreferences('Admin preferences saved successfully.')}
          className="rounded-lg bg-[#13515e] px-6 py-2 text-white transition-colors hover:bg-[#13515e]/90"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;

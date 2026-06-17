export const downloadBlob = (filename: string, content: BlobPart, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const escapeCsvValue = (value: unknown) => {
  if (value == null) return '';
  const stringValue = String(value).replace(/"/g, '""');
  return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue;
};

export const exportRowsToCsv = <T extends Record<string, unknown>>(filename: string, rows: T[]) => {
  if (!rows.length) {
    downloadBlob(filename, 'No data available', 'text/plain;charset=utf-8');
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
  ].join('\n');

  downloadBlob(filename, csv, 'text/csv;charset=utf-8');
};

export const exportJson = (filename: string, data: unknown) => {
  downloadBlob(filename, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
};

export type AdminPreferenceState = {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  systemSettings: {
    maintenance: boolean;
    debug: boolean;
    analytics: boolean;
  };
  security: {
    sessionTimeout: string;
    passwordPolicy: string;
  };
};

export const defaultAdminPreferences: AdminPreferenceState = {
  notifications: {
    email: true,
    push: false,
    sms: true,
  },
  systemSettings: {
    maintenance: false,
    debug: false,
    analytics: true,
  },
  security: {
    sessionTimeout: '1 hour',
    passwordPolicy: 'Strong (12+ chars, mixed case)',
  },
};

const ADMIN_PREFERENCES_KEY = 'agro_admin_preferences';

export const loadAdminPreferences = (): AdminPreferenceState => {
  try {
    const raw = localStorage.getItem(ADMIN_PREFERENCES_KEY);
    if (!raw) return defaultAdminPreferences;

    const parsed = JSON.parse(raw) as Partial<AdminPreferenceState>;
    return {
      notifications: {
        ...defaultAdminPreferences.notifications,
        ...parsed.notifications,
      },
      systemSettings: {
        ...defaultAdminPreferences.systemSettings,
        ...parsed.systemSettings,
      },
      security: {
        ...defaultAdminPreferences.security,
        ...parsed.security,
      },
    };
  } catch {
    return defaultAdminPreferences;
  }
};

export const saveAdminPreferences = (preferences: AdminPreferenceState) => {
  localStorage.setItem(ADMIN_PREFERENCES_KEY, JSON.stringify(preferences));
};

export const resetAdminPreferences = () => {
  localStorage.removeItem(ADMIN_PREFERENCES_KEY);
  return defaultAdminPreferences;
};

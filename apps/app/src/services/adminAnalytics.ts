import api from './api';

export interface AdminStats {
  total_users: number;
  admin_count: number;
  total_crops: number;
  total_reports: number;
  total_alerts: number;
  unread_notifications: number;
  avg_harvest_days: number;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  location?: string;
  crop_count: number;
  report_count: number;
}

export interface AdminCrop {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  crop_type?: string;
  name?: string;
  planting_date: string;
  expected_harvest?: string;
  status: string;
  location?: string;
  area?: number;
  created_at: string;
}

export interface AdminReport {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  image_url?: string;
  description?: string;
  title?: string;
  crop_type?: string;
  status: string;
  created_at: string;
}

export interface AdminWeatherAlert {
  id: string;
  user_id: string | null;
  user_name: string;
  crop_id: string | null;
  crop_name: string;
  region_id: string | null;
  region_name: string;
  location: string;
  type: string;
  security: string;
  description: string;
  valid_until: string | null;
  created_at: string;
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type TimelinePoint = {
  label: string;
  crops: number;
  reports: number;
  total: number;
};

const unwrap = <T,>(payload: ApiEnvelope<T>) => payload.data;

export const fetchAdminStats = async () => {
  const response = await api.get<ApiEnvelope<AdminStats>>('/admin/stats');
  return unwrap(response.data);
};

export const fetchAdminUsers = async (limit = 100) => {
  const response = await api.get<ApiEnvelope<AdminUser[]>>(`/admin/users?limit=${limit}`);
  return unwrap(response.data);
};

export const fetchAdminCrops = async (limit = 100) => {
  const response = await api.get<ApiEnvelope<AdminCrop[]>>(`/admin/crops?limit=${limit}`);
  return unwrap(response.data);
};

export const fetchAdminReports = async (limit = 100) => {
  const response = await api.get<ApiEnvelope<AdminReport[]>>(`/admin/reports?limit=${limit}`);
  return unwrap(response.data);
};

export const fetchAdminWeatherAlerts = async (limit = 200) => {
  const response = await api.get<ApiEnvelope<AdminWeatherAlert[]>>(`/admin/weather?limit=${limit}`);
  return unwrap(response.data);
};

export const fetchAdminAnalytics = async () => {
  const [statsResult, usersResult, cropsResult, reportsResult] = await Promise.allSettled([
    fetchAdminStats(),
    fetchAdminUsers(),
    fetchAdminCrops(),
    fetchAdminReports(),
  ]);

  const users = usersResult.status === 'fulfilled' ? usersResult.value : [];
  const crops = cropsResult.status === 'fulfilled' ? cropsResult.value : [];
  const reports = reportsResult.status === 'fulfilled' ? reportsResult.value : [];
  const stats =
    statsResult.status === 'fulfilled'
      ? statsResult.value
      : {
          total_users: users.length,
          admin_count: users.filter((user) => user.role === 'admin').length,
          total_crops: crops.length,
          total_reports: reports.length,
          total_alerts: 0,
          unread_notifications: 0,
          avg_harvest_days: 0,
        };

  return { stats, users, crops, reports };
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const toMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const toDayKey = (date: Date) => `${toMonthKey(date)}-${String(date.getDate()).padStart(2, '0')}`;

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1);

const safeDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const buildActivityTimeline = (
  crops: AdminCrop[],
  reports: AdminReport[],
  period: '7D' | '30D' | '6M' | '1Y' = '6M'
): TimelinePoint[] => {
  const cropDates = crops.map((crop) => safeDate(crop.created_at)).filter((date): date is Date => Boolean(date));
  const reportDates = reports.map((report) => safeDate(report.created_at)).filter((date): date is Date => Boolean(date));
  const now = new Date();

  if (period === '7D') {
    const today = startOfDay(now);
    const buckets = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(today, index - 6);
      return {
        key: toDayKey(date),
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        crops: 0,
        reports: 0,
      };
    });

    const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
    cropDates.forEach((date) => {
      const bucket = byKey.get(toDayKey(startOfDay(date)));
      if (bucket) bucket.crops += 1;
    });
    reportDates.forEach((date) => {
      const bucket = byKey.get(toDayKey(startOfDay(date)));
      if (bucket) bucket.reports += 1;
    });

    return buckets.map((bucket) => ({ label: bucket.label, crops: bucket.crops, reports: bucket.reports, total: bucket.crops + bucket.reports }));
  }

  if (period === '30D') {
    const start = startOfDay(addDays(now, -27));
    const buckets = Array.from({ length: 4 }, (_, index) => {
      const bucketStart = addDays(start, index * 7);
      const bucketEnd = addDays(bucketStart, 6);
      return {
        label: bucketStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        start: bucketStart,
        end: bucketEnd,
        crops: 0,
        reports: 0,
      };
    });

    cropDates.forEach((date) => {
      const bucket = buckets.find((item) => date >= item.start && date <= item.end);
      if (bucket) bucket.crops += 1;
    });
    reportDates.forEach((date) => {
      const bucket = buckets.find((item) => date >= item.start && date <= item.end);
      if (bucket) bucket.reports += 1;
    });

    return buckets.map((bucket) => ({
      label: bucket.label,
      crops: bucket.crops,
      reports: bucket.reports,
      total: bucket.crops + bucket.reports,
    }));
  }

  const months = period === '1Y' ? 12 : 6;
  const buckets = Array.from({ length: months }, (_, index) => {
    const date = addMonths(new Date(now.getFullYear(), now.getMonth(), 1), index - (months - 1));
    return {
      key: toMonthKey(date),
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      crops: 0,
      reports: 0,
    };
  });

  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  cropDates.forEach((date) => {
    const bucket = byKey.get(toMonthKey(date));
    if (bucket) bucket.crops += 1;
  });
  reportDates.forEach((date) => {
    const bucket = byKey.get(toMonthKey(date));
    if (bucket) bucket.reports += 1;
  });

  return buckets.map((bucket) => ({
    label: bucket.label,
    crops: bucket.crops,
    reports: bucket.reports,
    total: bucket.crops + bucket.reports,
  }));
};

export const buildRoleDistribution = (users: AdminUser[]) =>
  Object.entries(
    users.reduce<Record<string, number>>((accumulator, user) => {
      const role = user.role || 'unknown';
      accumulator[role] = (accumulator[role] || 0) + 1;
      return accumulator;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);

export const buildCropTypeDistribution = (crops: AdminCrop[], limit = 5) =>
  Object.entries(
    crops.reduce<Record<string, number>>((accumulator, crop) => {
      const cropName = crop.crop_type || crop.name || 'Unknown';
      accumulator[cropName] = (accumulator[cropName] || 0) + 1;
      return accumulator;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, limit);

export const buildStatusDistribution = (items: Array<{ status?: string }>) =>
  Object.entries(
    items.reduce<Record<string, number>>((accumulator, item) => {
      const status = item.status || 'unknown';
      accumulator[status] = (accumulator[status] || 0) + 1;
      return accumulator;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);

export const buildRegionalActivity = (users: AdminUser[], crops: AdminCrop[], reports: AdminReport[]) =>
  Object.entries(
    users.reduce<Record<string, { users: number }>>((accumulator, user) => {
      const location = user.location || 'Unknown';
      if (!accumulator[location]) {
        accumulator[location] = { users: 0 };
      }
      accumulator[location].users += 1;
      return accumulator;
    }, {})
  )
    .map(([location, value]) => {
      const cropCount = crops.filter((crop) => (crop.location || 'Unknown') === location).length;
      const reportCount = reports.filter((report) => {
        const author = users.find((user) => user.id === report.user_id);
        return (author?.location || 'Unknown') === location;
      }).length;

      const score = value.users + cropCount + reportCount;
      return {
        location,
        users: value.users,
        crops: cropCount,
        reports: reportCount,
        intensity: score >= 10 ? 'High' : score >= 5 ? 'Medium' : 'Low',
      };
    })
    .sort((left, right) => (right.users + right.crops + right.reports) - (left.users + left.crops + left.reports))
    .slice(0, 6);

export const formatLastUpdated = (value: Date | null) => {
  if (!value) return 'Not synced yet';

  return `Updated ${value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

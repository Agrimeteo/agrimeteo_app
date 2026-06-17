import { supabaseAdmin } from '../config/supabase.js';
import type { AdminStats, AdminUser, AdminCrop, AdminReport, AdminWeatherAlert } from '../types/admin.js';

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  location: string | null;
};

type CropRow = {
  id: string;
  user_id: string;
  name: string | null;
  crop_type?: string | null;
  planting_date: string | null;
  expected_harvest: string | null;
  status: string | null;
  location: string | null;
  area?: number | null;
  created_at: string | null;
};

type ReportRow = {
  id: string;
  user_id: string;
  image_url?: string | null;
  description?: string | null;
  title?: string | null;
  crop_type?: string | null;
  status?: string | null;
  created_at: string | null;
};

type AuthUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
};

const isRecoverableAdminReadError = (error: { message?: string } | null | undefined) => {
  const message = error?.message?.toLowerCase() ?? '';

  return (
    message.includes('relation') ||
    message.includes('does not exist') ||
    message.includes('schema cache') ||
    message.includes('column') ||
    message.includes('permission denied')
  );
};

const normalizeRole = (role: string | null | undefined): 'admin' | 'farmer' | 'beginner' => {
  if (role === 'admin' || role === 'farmer' || role === 'beginner') {
    return role;
  }

  return 'beginner';
};

const safeExactCount = async (
  queryFactory: () => any
) => {
  const result = await queryFactory();

  if (result.error) {
    if (isRecoverableAdminReadError(result.error)) {
      return 0;
    }

    throw result.error;
  }

  return result.count ?? 0;
};

const safeSelect = async <T,>(
  queryFactory: () => any
) => {
  const result = await queryFactory();

  if (result.error) {
    if (isRecoverableAdminReadError(result.error)) {
      return [] as T[];
    }

    throw result.error;
  }

  return (result.data ?? []) as T[];
};

const getAuthUsers = async (): Promise<AuthUserRow[]> => {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    if (isRecoverableAdminReadError(error)) {
      return [];
    }

    throw error;
  }

  return (data?.users ?? []).map((user: any) => {
    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

    return {
      id: user.id,
      email: typeof user.email === 'string' ? user.email : null,
      full_name:
        typeof metadata.full_name === 'string'
          ? metadata.full_name
          : typeof metadata.name === 'string'
            ? metadata.name
            : null,
      role: typeof metadata.role === 'string' ? metadata.role : null,
    };
  });
};

const fetchProfilesOnly = async (): Promise<ProfileRow[]> => {
  const query = supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, role, location');

  const { data, error } = await query.order('created_at', { ascending: false });

  if (!error) {
    return (data ?? []) as ProfileRow[];
  }

  if (!isRecoverableAdminReadError(error)) {
    throw error;
  }

  const fallback = await query;

  if (fallback.error) {
    if (isRecoverableAdminReadError(fallback.error)) {
      return [];
    }

    throw fallback.error;
  }

  return (fallback.data ?? []) as ProfileRow[];
};

const getProfiles = async (): Promise<ProfileRow[]> => {
  const [profiles, authUsers] = await Promise.all([fetchProfilesOnly(), getAuthUsers()]);
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));

  const missingProfiles = authUsers
    .filter((authUser) => !profileMap.has(authUser.id))
    .map((authUser) => ({
      id: authUser.id,
      full_name: authUser.full_name,
      email: authUser.email,
      role: normalizeRole(authUser.role),
    }));

  if (missingProfiles.length) {
    const { error } = await supabaseAdmin.from('profiles').upsert(missingProfiles, { onConflict: 'id' });

    if (!error) {
      missingProfiles.forEach((profile) => {
        profileMap.set(profile.id, {
          id: profile.id,
          full_name: profile.full_name ?? null,
          email: profile.email ?? null,
          role: profile.role ?? null,
          location: null,
        });
      });
    }
  }

  authUsers.forEach((authUser) => {
    if (!profileMap.has(authUser.id)) {
      profileMap.set(authUser.id, {
        id: authUser.id,
        full_name: authUser.full_name,
        email: authUser.email,
        role: normalizeRole(authUser.role),
        location: null,
      });
    }
  });

  return Array.from(profileMap.values()).sort((left, right) => {
    const leftLabel = (left.full_name || left.email || left.id).toLowerCase();
    const rightLabel = (right.full_name || right.email || right.id).toLowerCase();
    return leftLabel.localeCompare(rightLabel);
  });
};

export const getProfileById = async (userId: string): Promise<ProfileRow | null> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, role, location')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const [profiles, totalCrops, totalReports, totalAlerts, unreadNotifications, activeCrops] = await Promise.all([
    getProfiles(),
    safeExactCount(() => supabaseAdmin.from('crops').select('*', { count: 'exact', head: true })),
    safeExactCount(() => supabaseAdmin.from('reports').select('*', { count: 'exact', head: true })),
    safeExactCount(() => supabaseAdmin.from('weather_alerts').select('*', { count: 'exact', head: true })),
    safeExactCount(() => supabaseAdmin.from('notifications').select('*', { count: 'exact', head: true }).eq('read', false)),
    safeSelect<{ expected_harvest?: string | null; status?: string | null }>(() =>
      supabaseAdmin
        .from('crops')
        .select('expected_harvest, status')
        .neq('status', 'harvested')
    ),
  ]);

  const adminCount = profiles.filter((profile: ProfileRow) => profile.role === 'admin').length;
  const validHarvestDiffs =
    activeCrops
      .map((crop: { expected_harvest?: string | null }) => {
        if (!crop.expected_harvest) return null;
        const harvestDate = new Date(crop.expected_harvest);
        if (Number.isNaN(harvestDate.getTime())) return null;
        return Math.ceil((harvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      })
      .filter((value: number | null): value is number => value !== null);

  const avgHarvestDays = validHarvestDiffs.length
    ? Math.round(validHarvestDiffs.reduce((sum: number, value: number) => sum + value, 0) / validHarvestDiffs.length)
    : 0;

  return {
    total_users: profiles.length,
    admin_count: adminCount,
    total_crops: totalCrops,
    total_reports: totalReports,
    total_alerts: totalAlerts,
    unread_notifications: unreadNotifications,
    avg_harvest_days: avgHarvestDays,
  };
};

export const getAllUsers = async (page: number = 1, limit: number = 20): Promise<AdminUser[]> => {
  const [profiles, crops, reports] = await Promise.all([
    getProfiles(),
    supabaseAdmin.from('crops').select('user_id'),
    supabaseAdmin.from('reports').select('user_id'),
  ]);

  if (crops.error && !isRecoverableAdminReadError(crops.error)) throw crops.error;
  if (reports.error && !isRecoverableAdminReadError(reports.error)) throw reports.error;

  const cropCountByUser = (crops.data ?? []).reduce<Record<string, number>>((accumulator, crop) => {
    accumulator[crop.user_id] = (accumulator[crop.user_id] || 0) + 1;
    return accumulator;
  }, {});

  const reportCountByUser = (reports.data ?? []).reduce<Record<string, number>>((accumulator, report) => {
    accumulator[report.user_id] = (accumulator[report.user_id] || 0) + 1;
    return accumulator;
  }, {});

  return profiles
    .map((profile) => ({
      id: profile.id,
      full_name: profile.full_name || 'Unknown',
      email: profile.email || '',
      role: normalizeRole(profile.role),
      location: profile.location || '',
      crop_count: cropCountByUser[profile.id] || 0,
      report_count: reportCountByUser[profile.id] || 0,
    }))
    .slice((page - 1) * limit, page * limit);
};

export const getAllCrops = async (page: number = 1, limit: number = 20): Promise<AdminCrop[]> => {
  const [{ data: crops, error: cropsError }, profiles] = await Promise.all([
    supabaseAdmin
      .from('crops')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1),
    getProfiles(),
  ]);

  if (cropsError) {
    if (isRecoverableAdminReadError(cropsError)) {
      return [];
    }

    throw cropsError;
  }

  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));

  return ((crops ?? []) as CropRow[]).map((crop) => {
    const profile = profileMap.get(crop.user_id);
    return {
      id: crop.id,
      user_id: crop.user_id,
      user_name: profile?.full_name || 'Unknown',
      user_role: profile?.role || 'user',
      name: crop.name || crop.crop_type || 'Unknown',
      planting_date: crop.planting_date || '',
      expected_harvest: crop.expected_harvest || '',
      status: crop.status || 'unknown',
      created_at: crop.created_at || '',
      location: crop.location || '',
      area: crop.area ?? null,
    } as AdminCrop;
  });
};

export const getAllReports = async (page: number = 1, limit: number = 20): Promise<AdminReport[]> => {
  const [{ data: reports, error: reportsError }, profiles] = await Promise.all([
    supabaseAdmin
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1),
    getProfiles(),
  ]);

  if (reportsError) {
    if (isRecoverableAdminReadError(reportsError)) {
      return [];
    }

    throw reportsError;
  }

  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));

  return ((reports ?? []) as ReportRow[]).map((report) => {
    const profile = profileMap.get(report.user_id);
    return {
      id: report.id,
      user_id: report.user_id,
      user_name: profile?.full_name || 'Unknown',
      user_role: profile?.role || 'user',
      image_url: report.image_url || '',
      description: report.description || '',
      title: report.title || report.crop_type || 'Untitled report',
      crop_type: report.crop_type || 'General',
      status: report.status || 'pending',
      created_at: report.created_at || '',
    } as AdminReport;
  });
};

export const getAllWeatherAlerts = async (page: number = 1, limit: number = 50): Promise<AdminWeatherAlert[]> => {
  const start = (page - 1) * limit;
  const end = page * limit - 1;

  const { data: alerts, error } = await supabaseAdmin
    .from('weather_alerts')
    .select('id, user_id, crop_id, region_id, location, type, security, description, valid_until, created_at')
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    if (isRecoverableAdminReadError(error)) {
      return [];
    }

    throw error;
  }

  const userIds = [...new Set((alerts ?? []).map((alert) => alert.user_id).filter(Boolean))] as string[];
  const cropIds = [...new Set((alerts ?? []).map((alert) => alert.crop_id).filter(Boolean))] as string[];
  const regionIds = [...new Set((alerts ?? []).map((alert) => alert.region_id).filter(Boolean))] as string[];

  const [{ data: profiles }, { data: crops }, { data: regions }] = await Promise.all([
    userIds.length
      ? supabaseAdmin.from('profiles').select('id, full_name').in('id', userIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null }> }),
    cropIds.length
      ? supabaseAdmin.from('crops').select('id, name, crop_type').in('id', cropIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string | null; crop_type: string | null }> }),
    regionIds.length
      ? supabaseAdmin.from('regions').select('id, name').in('id', regionIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
  ]);

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name || 'Unknown user']));
  const cropMap = new Map(
    (crops ?? []).map((crop) => [crop.id, crop.name || crop.crop_type || 'Unknown crop'])
  );
  const regionMap = new Map((regions ?? []).map((region) => [region.id, region.name]));

  return (alerts ?? []).map((alert) => ({
    id: alert.id,
    user_id: alert.user_id,
    user_name: alert.user_id ? profileMap.get(alert.user_id) || 'Unknown user' : 'System',
    crop_id: alert.crop_id,
    crop_name: alert.crop_id ? cropMap.get(alert.crop_id) || 'Unknown crop' : 'General advisory',
    region_id: alert.region_id,
    region_name: alert.region_id ? regionMap.get(alert.region_id) || alert.location || 'Unknown region' : alert.location || 'Unknown region',
    location: alert.location || (alert.region_id ? regionMap.get(alert.region_id) || 'Unknown region' : 'Unknown region'),
    type: alert.type,
    security: alert.security,
    description: alert.description,
    valid_until: alert.valid_until,
    created_at: alert.created_at,
  }));
};

export const updateUserRole = async (userId: string, role: string) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteUser = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId);
  
  if (error) throw error;
  // Note: auth.users deletion requires Supabase dashboard or trigger
  return data;
};


import { supabaseServiceClient } from '../config/supabase.js';

type ProfileSyncData = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: 'user' | 'beginner' | 'farmer' | 'admin' | null;
};

type ProfileUpdateData = {
  full_name?: unknown;
  email?: unknown;
  phone?: unknown;
  location?: unknown;
  bio?: unknown;
};

type RegionCoordinates = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

const getDistanceScore = (latitudeA: number, longitudeA: number, latitudeB: number, longitudeB: number) => {
  return Math.sqrt((latitudeA - latitudeB) ** 2 + (longitudeA - longitudeB) ** 2);
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabaseServiceClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const syncProfile = async (profileData: ProfileSyncData) => {
  const payload: Record<string, unknown> = {
    id: profileData.id,
    email: profileData.email ?? null,
    full_name: profileData.full_name ?? null,
  };

  if (profileData.role) {
    payload.role = profileData.role;
  }

  const { data, error } = await supabaseServiceClient
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateProfile = async (userId: string, profileData: any) => {
  const allowedFields: (keyof ProfileUpdateData)[] = ['full_name', 'email', 'phone', 'location', 'bio'];
  const payload = allowedFields.reduce<Record<string, unknown>>((acc, field) => {
    if (field in (profileData ?? {})) {
      const rawValue = profileData[field];
      acc[field] = typeof rawValue === 'string' ? rawValue.trim() : null;
    }

    return acc;
  }, {});

  if (Object.keys(payload).length === 0) {
    const currentProfile = await getProfile(userId);
    return { success: true, data: currentProfile };
  }

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabaseServiceClient
    .from('profiles')
    .upsert(
      {
        id: userId,
        ...payload,
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const updateAvatar = async (userId: string, avatarUrl: string) => {
  const { data, error } = await supabaseServiceClient
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const updateProfileLocationFromCoordinates = async (
  userId: string,
  latitude: number,
  longitude: number
) => {
  const { data: regions, error: regionsError } = await supabaseServiceClient
    .from('regions')
    .select('id, name, latitude, longitude');

  if (regionsError) throw new Error(regionsError.message);
  if (!regions || regions.length === 0) throw new Error('No region coordinates available');

  const nearestRegion = (regions as RegionCoordinates[]).reduce((closest, region) => {
    if (!closest) {
      return region;
    }

    const currentDistance = getDistanceScore(latitude, longitude, region.latitude, region.longitude);
    const closestDistance = getDistanceScore(latitude, longitude, closest.latitude, closest.longitude);

    return currentDistance < closestDistance ? region : closest;
  }, null as RegionCoordinates | null);

  if (!nearestRegion) {
    throw new Error('Unable to resolve a region from the provided coordinates');
  }

  const { data, error } = await supabaseServiceClient
    .from('profiles')
    .update({ location: nearestRegion.name })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    success: true,
    data,
    resolvedRegion: nearestRegion.name,
  };
};

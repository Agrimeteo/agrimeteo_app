import { supabaseServiceClient } from '../config/supabase.js';

export const getProfile = async (userId: string) => {
  const { data, error } = await supabaseServiceClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateProfile = async (userId: string, profileData: any) => {
  const { data, error } = await supabaseServiceClient
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
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

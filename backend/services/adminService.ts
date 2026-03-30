import { supabaseAdmin } from '../config/supabase.js';
import type { AdminStats, AdminUser, AdminCrop, AdminReport } from '../types/admin.js';


export const getAdminStats = async (): Promise<AdminStats> => {
  const { data, error } = await supabaseAdmin
    .from('admin_stats')
    .select('*')
    .single();
  
  if (error) throw error;
  return data as AdminStats;
};

export const getAllUsers = async (page: number = 1, limit: number = 20): Promise<AdminUser[]> => {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .range((page - 1) * limit, page * limit - 1);
  
  if (error) throw error;
  return data as AdminUser[];
};

export const getAllCrops = async (page: number = 1, limit: number = 20): Promise<AdminCrop[]> => {
  const { data, error } = await supabaseAdmin
    .from('admin_crops')
    .select('*')
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as AdminCrop[];
};

export const getAllReports = async (page: number = 1, limit: number = 20): Promise<AdminReport[]> => {
  const { data, error } = await supabaseAdmin
    .from('admin_reports')
    .select('*')
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as AdminReport[];
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


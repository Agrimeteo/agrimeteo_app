
import { supabaseAdmin } from '../config/supabase.js';
import type { Notification, CreateNotification } from '../types/notification.js';

export const createNotification = async (notification: CreateNotification) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert(notification)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const createAdminNotification = async (title: string, message: string, type = 'info') => {
  const { data, error } = await supabaseAdmin
    .from('admin_notifications')
    .insert({ title, message, type })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserNotifications = async (userId: string, limit = 20, read = false) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', read)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
};

export const createPlanNotification = async (userId: string, planId: string, taskName: string, dueDate: string) => {
  const notification = {
    user_id: userId,
    title: 'Crop Plan Reminder',
    message: `Task "${taskName}" is due on ${new Date(dueDate).toLocaleDateString()}`,
    type: 'info' as const,
    read: false,
    metadata: { planId, taskName, dueDate }
  };

  return await createNotification(notification);
};

export const getPlanNotifications = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'plan_reminder')
    .eq('read', false)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getAdminNotifications = async (limit = 50) => {
  const { data, error } = await supabaseAdmin
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
};

export const getNotificationCount = async (userId: string) => {
  const { count, error } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  
  if (error) throw error;
  return count || 0;
};


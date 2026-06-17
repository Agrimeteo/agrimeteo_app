
import { supabaseAdmin } from '../config/supabase.js';
import type { Notification, CreateNotification } from '../types/notification.js';

const isMissingNotificationsStorage = (message: string) =>
  message.includes('relation') ||
  message.includes('does not exist') ||
  message.includes('permission denied') ||
  message.includes('column') ||
  message.includes('schema cache');

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

export const getUserNotifications = async (userId: string, limit = 20, read?: boolean) => {
  let query = supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (typeof read === 'boolean') {
    query = query.eq('read', read);
  }

  const { data, error } = await query;
  
  if (error) {
    if (isMissingNotificationsStorage(error.message)) {
      return [];
    }
    throw error;
  }
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
  
  if (error) {
    if (isMissingNotificationsStorage(error.message)) {
      return 0;
    }
    throw error;
  }
  return count || 0;
};

export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (isMissingNotificationsStorage(error.message)) {
      return null;
    }
    throw error;
  }
  return data;
};

export const deleteNotification = async (userId: string, notificationId: string) => {
  const { error } = await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    if (isMissingNotificationsStorage(error.message)) {
      return;
    }
    throw error;
  }
};

export const clearUserNotifications = async (userId: string) => {
  const { error } = await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('user_id', userId);

  if (error) {
    if (isMissingNotificationsStorage(error.message)) {
      return;
    }
    throw error;
  }
};


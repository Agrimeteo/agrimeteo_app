
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
  location: string;
  crop_count: number;
  report_count: number;
}

export interface AdminCrop {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  name: string;
  planting_date: string;
  expected_harvest: string;
  status: string;
  created_at: string;
}

export interface AdminReport {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  image_url: string;
  description: string;
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


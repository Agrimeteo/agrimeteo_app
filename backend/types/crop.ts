export interface CropType {
  id: string;
  name: string;
  tasks: Array<{
    name: string;
    days_after_planting: number;
  }>;
  avg_duration_days: number;
}

export interface Crop {
  id: string;
  user_id: string;
  name: string;
  planting_date: string;
  expected_harvest: string | null;
  status: 'planted' | 'growing' | 'ready' | 'harvested' | 'failed';
  crop_types?: CropType | null;
}

export interface CropPlanTask {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
}

export interface CropPlan {
  id: string;
  crop_id: string;
  crop: Crop;
  tasks: CropPlanTask[];
  created_at: string;
  updated_at: string;
}


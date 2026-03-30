import { supabaseServiceClient } from '../config/supabase.js';
import * as notificationService from './notificationService.js';
import { Crop } from '../types/crop.js';

type Task = {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
};

type CropPlan = {
  id: string;
  crop_id: string;
  crop: Crop;
  tasks: Task[];
  created_at: string;
  updated_at: string;
};

export const generateCropPlan = async (cropId: string): Promise<CropPlan> => {
  const { data: crop, error } = await supabaseServiceClient
    .from('crops')
    .select('*, crop_types(*)')
    .eq('id', cropId)
    .single();

  if (error) throw new Error(`Crop not found: ${error.message}`);
  if (!crop.crop_types) throw new Error('Crop type not configured');

  const plantingDate = new Date(crop.planting_date);
  let tasks: Task[] = crop.crop_types.tasks.map((task: any, index: number) => ({
    id: crypto.randomUUID(),
    name: task.name,
    date: new Date(plantingDate.getTime() + task.days_after_planting * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    notes: ''
  }));

  // Customize based on area and region
  if (crop.area > 10) { // Large area
    tasks.push({
      id: crypto.randomUUID(),
      name: 'Large-scale monitoring check',
      date: new Date(plantingDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      notes: 'Additional monitoring for large area'
    });
  }

  // Add seasonal alerts based on Cameroon climate
  const currentMonth = new Date().getMonth() + 1;
  if (currentMonth >= 5 && currentMonth <= 10) { // Rainy season
    tasks.push({
      id: crypto.randomUUID(),
      name: 'Monitor for heavy rainfall',
      date: new Date(plantingDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      notes: 'Cameroon rainy season: May-October. Watch for flooding and fungal diseases.'
    });
  } else if (currentMonth >= 11 || currentMonth <= 4) { // Dry season
    tasks.push({
      id: crypto.randomUUID(),
      name: 'Implement drought management',
      date: new Date(plantingDate.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      notes: 'Cameroon dry season: November-April. Ensure irrigation and water conservation.'
    });
  }

  if ((currentMonth >= 12 || currentMonth <= 2) && (crop.region === 'Far North' || crop.region === 'North')) { // Harmattan season
    tasks.push({
      id: crypto.randomUUID(),
      name: 'Harmattan protection measures',
      date: new Date(plantingDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      notes: 'Harmattan winds: Protect plants from dust and low humidity.'
    });
  }

  const { data: plan, error: insertError } = await supabaseServiceClient
    .from('crop_plans')
    .insert({
      crop_id: cropId,
      tasks
    })
    .select()
    .single();

  if (insertError) throw new Error(`Plan creation failed: ${insertError.message}`);
  
  // Create notifications for upcoming tasks
  const today = new Date();
  for (const task of tasks) {
    const taskDate = new Date(task.date);
    const daysUntilDue = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue >= 0 && daysUntilDue <= 7) { // Notify for tasks due within a week
      try {
        await notificationService.createPlanNotification(crop.user_id, plan.id, task.name, task.date);
      } catch (notifError) {
        console.warn('Failed to create notification:', notifError);
      }
    }
  }
  
  return plan;
};

export const getCropPlan = async (planId: string): Promise<CropPlan> => {
  const { data, error } = await supabaseServiceClient
    .from('crop_plans')
    .select(`
      *,
      crops (
        *,
        crop_types(*)
      )
    `)
    .eq('id', planId)
    .single();

  if (error) throw new Error(`Plan not found: ${error.message}`);
  return data;
};

export const getCropPlans = async (userId: string): Promise<CropPlan[]> => {
  const { data, error } = await supabaseServiceClient
    .from('crop_plans')
    .select(`
      *,
      crops (
        *,
        crop_types(*)
      ),
      user_id
    `)
    .eq('crops.user_id', userId);

  if (error) throw new Error(error.message);
  return data;
};

export const updateCropPlanTask = async (planId: string, taskId: string, updates: Partial<Task>): Promise<Task> => {
  const { data, error } = await supabaseServiceClient
    .from('crop_plans')
    .update({
      tasks: {
        [taskId]: updates
      }
    })
    .eq('id', planId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  const updatedTask = data.tasks.find((task: Task) => task.id === taskId);
  if (!updatedTask) throw new Error('Task not found');
  
  return updatedTask;
};


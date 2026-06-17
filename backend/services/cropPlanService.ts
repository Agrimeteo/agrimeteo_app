import { randomUUID } from 'node:crypto';
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

type CropTypeTemplate = {
  id?: string;
  name: string;
  tasks: Array<{ name: string; days_after_planting: number }>;
};

const isRecoverableCropPlanSchemaError = (message: string) => {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes('crop_plans') &&
    (normalizedMessage.includes('does not exist') ||
      normalizedMessage.includes('schema cache') ||
      normalizedMessage.includes('could not find') ||
      normalizedMessage.includes('column'))
  );
};

const explainCropPlanError = (message: string) => {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes('crop_plans') &&
    (normalizedMessage.includes('does not exist') ||
      normalizedMessage.includes('schema cache') ||
      normalizedMessage.includes('could not find'))
  ) {
    return 'Crop plan storage is not ready in Supabase. Run the crop plan schema migration that creates public.crop_plans and public.crop_types.';
  }

  if (normalizedMessage.includes('permission denied')) {
    return 'Supabase denied access while creating the crop plan. Check the grants and RLS policies for crop_plans.';
  }

  return message;
};

const createFallbackTasks = (cropName: string, plantingDate: Date, expectedHarvest?: string | null): Task[] => {
  const safeCropName = cropName || 'Crop';
  const harvestDate = expectedHarvest ? new Date(expectedHarvest) : null;
  const totalDays =
    harvestDate && !Number.isNaN(harvestDate.getTime())
      ? Math.max(
          30,
          Math.ceil((harvestDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)),
        )
      : 90;

  const checkpoints = [
    { name: `Plant ${safeCropName}`, days: 0 },
    { name: 'First field inspection', days: Math.max(7, Math.round(totalDays * 0.15)) },
    { name: 'Nutrient and irrigation review', days: Math.max(14, Math.round(totalDays * 0.35)) },
    { name: 'Pest and disease monitoring', days: Math.max(21, Math.round(totalDays * 0.55)) },
    { name: `Prepare ${safeCropName} harvest`, days: Math.max(28, totalDays - 7) },
  ];

  return checkpoints.map((task, index) => ({
    id: randomUUID(),
    name: task.name,
    date: new Date(plantingDate.getTime() + task.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    notes:
      index === 0
        ? `Initial follow-up plan created automatically for ${safeCropName}.`
        : '',
  }));
};

const resolveCropTypeTemplate = async (crop: any): Promise<CropTypeTemplate | null> => {
  if (crop.crop_type_id) {
    const { data: cropTypeById } = await supabaseServiceClient
      .from('crop_types')
      .select('id, name, tasks')
      .eq('id', crop.crop_type_id)
      .maybeSingle();

    if (cropTypeById) {
      return cropTypeById;
    }
  }

  if (!crop.name) {
    return null;
  }

  const { data: cropTypesByName } = await supabaseServiceClient
    .from('crop_types')
    .select('id, name, tasks')
    .ilike('name', crop.name)
    .limit(1);

  return cropTypesByName?.[0] ?? null;
};

export const generateCropPlan = async (cropId: string): Promise<CropPlan> => {
  const { data: crop, error } = await supabaseServiceClient
    .from('crops')
    .select('*')
    .eq('id', cropId)
    .single();

  if (error) throw new Error(`Crop not found: ${error.message}`);
  
  const plantingDate = new Date(crop.planting_date);
  const cropType = await resolveCropTypeTemplate(crop);
  let tasks: Task[] = Array.isArray(cropType?.tasks)
    ? (cropType?.tasks ?? []).map((task: any) => ({
        id: randomUUID(),
        name: task.name,
        date: new Date(
          plantingDate.getTime() + task.days_after_planting * 24 * 60 * 60 * 1000,
        ).toISOString().split('T')[0],
        status: 'pending',
        notes: ''
      }))
    : [];

  if (tasks.length === 0) {
    tasks = createFallbackTasks(crop.name || 'Crop', plantingDate, crop.expected_harvest);
  }

  // Customize based on area and region
  if (crop.area > 10) { // Large area
    tasks.push({
      id: randomUUID(),
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
      id: randomUUID(),
      name: 'Monitor for heavy rainfall',
      date: new Date(plantingDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      notes: 'Cameroon rainy season: May-October. Watch for flooding and fungal diseases.'
    });
  } else if (currentMonth >= 11 || currentMonth <= 4) { // Dry season
    tasks.push({
      id: randomUUID(),
      name: 'Implement drought management',
      date: new Date(plantingDate.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      notes: 'Cameroon dry season: November-April. Ensure irrigation and water conservation.'
    });
  }

  if ((currentMonth >= 12 || currentMonth <= 2) && (crop.location === 'Far North' || crop.location === 'North')) { // Harmattan season
    tasks.push({
      id: randomUUID(),
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

  if (insertError) {
    throw new Error(explainCropPlanError(insertError.message));
  }
  
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
    .select('*')
    .eq('id', planId)
    .single();

  if (error) throw new Error(`Plan not found: ${error.message}`);

  const { data: crop } = await supabaseServiceClient
    .from('crops')
    .select('*')
    .eq('id', data.crop_id)
    .maybeSingle();

  return { ...data, crop: crop as Crop };
};

export const getCropPlans = async (userId: string): Promise<CropPlan[]> => {
  try {
    const { data: crops, error: cropsError } = await supabaseServiceClient
      .from('crops')
      .select('*')
      .eq('user_id', userId);

    if (cropsError) throw new Error(cropsError.message);
    if (!crops || crops.length === 0) return [];

    const cropIds = crops.map((crop) => crop.id);
    const { data: plans, error: plansError } = await supabaseServiceClient
      .from('crop_plans')
      .select('*')
      .in('crop_id', cropIds);

    if (plansError) {
      if (isRecoverableCropPlanSchemaError(plansError.message)) {
        console.warn(`Crop plans unavailable, falling back to an empty list: ${plansError.message}`);
        return [];
      }

      throw new Error(plansError.message);
    }

    return (plans ?? []).map((plan) => ({
      ...plan,
      crop: crops.find((crop) => crop.id === plan.crop_id) ?? null,
    }));
  } catch (error) {
    console.warn(
      `Crop plans could not be loaded for user ${userId}. Returning an empty list instead.`,
      error,
    );
    return [];
  }
};

export const updateCropPlanTask = async (planId: string, taskId: string, updates: Partial<Task>): Promise<Task> => {
  const { data: existingPlan, error: planError } = await supabaseServiceClient
    .from('crop_plans')
    .select('tasks')
    .eq('id', planId)
    .single();

  if (planError) throw new Error(planError.message);

  const currentTasks = Array.isArray(existingPlan.tasks) ? (existingPlan.tasks as Task[]) : [];
  const updatedTasks = currentTasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          ...updates,
        }
      : task,
  );

  const updatedTask = updatedTasks.find((task) => task.id === taskId);
  if (!updatedTask) throw new Error('Task not found');

  const { error } = await supabaseServiceClient
    .from('crop_plans')
    .update({
      tasks: updatedTasks,
    })
    .eq('id', planId);

  if (error) throw new Error(error.message);

  return updatedTask;
};


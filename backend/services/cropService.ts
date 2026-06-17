import { supabaseServiceClient } from '../config/supabase.js';

type CropTypeRecord = {
  id?: string;
  name: string;
  tasks?: unknown[];
  avg_duration_days?: number | null;
};

const normalizeCropName = (value: string) => value.trim();

// Mock AI recommendations for now - in production, integrate with Gemini
export const generateAIRecommendations = async (cropName: string, regionName: string, area: number, climateData: any) => {
  // This would call Gemini API in production
  const recommendations = [];

  if (regionName === 'Far North' || regionName === 'North') {
    recommendations.push(`For ${cropName} in ${regionName}, consider drought-resistant varieties and drip irrigation systems.`);
  }

  if (area > 50) {
    recommendations.push(`Large ${area} ha plantation of ${cropName} requires mechanized farming equipment and pest monitoring drones.`);
  }

  if (climateData?.season === 'rainy') {
    recommendations.push(`During rainy season in ${regionName}, implement raised bed planting to prevent waterlogging for ${cropName}.`);
  }

  return recommendations;
};

export const createCrop = async (userId: string, cropData: any) => {
  const { data, error } = await supabaseServiceClient
    .from('crops')
    .insert({
      ...cropData,
      user_id: userId,
      status: 'planted',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getCropTypes = async (): Promise<CropTypeRecord[]> => {
  const { data, error } = await supabaseServiceClient
    .from('crop_types')
    .select('id, name, tasks, avg_duration_days')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
};

export const getCropTypeById = async (cropTypeId: string): Promise<CropTypeRecord> => {
  const { data, error } = await supabaseServiceClient
    .from('crop_types')
    .select('id, name, tasks, avg_duration_days')
    .eq('id', cropTypeId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const findCropTypeByName = async (cropName: string): Promise<CropTypeRecord | null> => {
  const normalizedName = normalizeCropName(cropName);

  if (!normalizedName) {
    return null;
  }

  const { data, error } = await supabaseServiceClient
    .from('crop_types')
    .select('id, name, tasks, avg_duration_days')
    .ilike('name', normalizedName)
    .limit(1);

  if (error) {
    if (error.message.includes('permission denied')) {
      return null;
    }

    throw new Error(error.message);
  }

  return data?.[0] ?? null;
};

export const getOrCreateCropType = async (
  cropName: string,
  avgDurationDays?: number | null,
): Promise<CropTypeRecord> => {
  const normalizedName = normalizeCropName(cropName);

  if (!normalizedName) {
    throw new Error('Crop name is required');
  }

  const existingCropType = await findCropTypeByName(normalizedName);
  if (existingCropType) {
    return existingCropType;
  }

  const { data: createdCropType, error: createError } = await supabaseServiceClient
    .from('crop_types')
    .insert({
      name: normalizedName,
      tasks: [],
      avg_duration_days: avgDurationDays ?? null,
    })
    .select('id, name, tasks, avg_duration_days')
    .single();

  if (createError) {
    if (createError.message.includes('permission denied')) {
      return {
        name: normalizedName,
        tasks: [],
        avg_duration_days: avgDurationDays ?? null,
      };
    }

    throw new Error(createError.message);
  }

  return createdCropType;
};

export const getCrops = async (userId: string) => {
  const { data, error } = await supabaseServiceClient
    .from('crops')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data;
};

export const getCrop = async (cropId: string) => {
  const { data, error } = await supabaseServiceClient
    .from('crops')
    .select('*')
    .eq('id', cropId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateCrop = async (cropId: string, cropData: any) => {
  const { data, error } = await supabaseServiceClient
    .from('crops')
    .update(cropData)
    .eq('id', cropId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const validateCropSuitability = async (cropName: string, regionName: string, area: number) => {
  // Get region data
  const { data: region, error: regionError } = await supabaseServiceClient
    .from('regions')
    .select('*')
    .eq('name', regionName)
    .single();

  if (regionError || !region) {
    const details = regionError?.message ? ` (${regionError.message})` : '';
    throw new Error(`Region ${regionName} not found${details}`);
  }

  // Get suitability data
  const { data: suitability, error: suitError } = await supabaseServiceClient
    .from('crop_region_suitability')
    .select('*')
    .eq('crop_type', cropName)
    .eq('region_id', region.id)
    .single();

  if (suitError || !suitability) {
    return {
      isSuitable: false,
      score: 0,
      reasons: [`No data available for ${cropName} in ${regionName}`],
      maxArea: 0,
      areaWarning: false,
      climateRecommendations: [],
      seasonalRisks: []
    };
  }

  // Get current season climate data
  const currentMonth = new Date().getMonth() + 1; // 1-12
  let currentSeason = 'dry';
  if (currentMonth >= 5 && currentMonth <= 10) currentSeason = 'rainy'; // May-Oct rainy season in Cameroon
  else if (currentMonth >= 12 || currentMonth <= 2) currentSeason = 'harmattan'; // Dec-Feb harmattan in North

  const { data: climateData } = await supabaseServiceClient
    .from('climate_data')
    .select('*')
    .eq('region_id', region.id)
    .eq('season', currentSeason);

  const areaWarning = area > suitability.max_recommended_area_ha;
  const isSuitable = suitability.suitability_score >= 5;

  // Generate AI recommendations
  const aiRecommendations = await generateAIRecommendations(cropName, regionName, area, climateData?.[0]);

  return {
    isSuitable,
    score: suitability.suitability_score,
    reasons: suitability.reasons,
    maxArea: suitability.max_recommended_area_ha,
    areaWarning,
    climateRecommendations: climateData?.[0]?.recommendations || [],
    seasonalRisks: climateData?.[0]?.risk_factors || [],
    aiRecommendations
  };
};

export const deleteCrop = async (cropId: string) => {
  const { error } = await supabaseServiceClient
    .from('crops')
    .delete()
    .eq('id', cropId);

  if (error) throw new Error(error.message);
};

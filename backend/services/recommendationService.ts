import { randomUUID } from 'node:crypto';
import { supabaseServiceClient } from '../config/supabase.js';
import { getWeatherAlerts, getWeatherOverview } from './weatherService.js';

type RecommendationCategory = 'irrigation' | 'fertilization' | 'phytosanitary';
type RecommendationPriority = 'low' | 'medium' | 'high';

type StoredRecommendation = {
  id: string;
  generation_id: string;
  crop_plan_id: string;
  crop_id: string;
  category: RecommendationCategory;
  title: string;
  summary: string;
  actions: string[];
  priority: RecommendationPriority;
  growth_stage: string;
  weather_summary: string | null;
  recent_interventions: string[] | null;
  source_snapshot: Record<string, unknown> | null;
  is_current: boolean;
  generated_at: string;
};

type CropPlanTask = {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
};

type CropPlanRow = {
  id: string;
  crop_id: string;
  tasks: CropPlanTask[];
};

type CropRow = {
  id: string;
  user_id: string;
  name: string | null;
  location: string | null;
  notes: string | null;
  planting_date: string;
  expected_harvest: string | null;
  status: 'planted' | 'growing' | 'ready' | 'harvested' | 'failed';
  area: number | null;
};

type WeatherOverview = Awaited<ReturnType<typeof getWeatherOverview>>;
type WeatherAlert = Awaited<ReturnType<typeof getWeatherAlerts>>[number];

export type RecommendationDto = {
  id: string;
  generationId: string;
  category: RecommendationCategory;
  title: string;
  summary: string;
  actions: string[];
  priority: RecommendationPriority;
  growthStage: string;
  weatherSummary: string | null;
  recentInterventions: string[];
  generatedAt: string;
};

const CACHE_WINDOW_MINUTES = 30;
const CATEGORY_ORDER: RecommendationCategory[] = ['irrigation', 'fertilization', 'phytosanitary'];

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const buildWeatherSummary = (weather: WeatherOverview) =>
  `${weather.condition} in ${weather.location} - ${Math.round(weather.temperature)} C, humidity ${weather.humidity}%, rainfall probability ${weather.rainfallProbability}%.`;

const buildRecentInterventions = (crop: CropRow, tasks: CropPlanTask[]) => {
  const noteInterventions = (crop.notes ?? '')
    .split(/[.;,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const completedTasks = tasks
    .filter((task) => task.status === 'completed')
    .slice(-3)
    .map((task) => task.name.trim())
    .filter(Boolean);

  return [...new Set([...noteInterventions, ...completedTasks])].slice(0, 5);
};

const deriveGrowthStage = (crop: CropRow) => {
  if (crop.status === 'harvested') return 'harvested';
  if (crop.status === 'failed') return 'failed';
  if (crop.status === 'ready') return 'maturation';

  const plantingDate = new Date(crop.planting_date);
  const expectedHarvest = crop.expected_harvest ? new Date(crop.expected_harvest) : null;
  const now = new Date();

  if (Number.isNaN(plantingDate.getTime())) {
    return crop.status === 'growing' ? 'vegetative' : 'establishment';
  }

  const elapsedDays = Math.max(
    0,
    Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const totalDays =
    expectedHarvest && !Number.isNaN(expectedHarvest.getTime())
      ? Math.max(
          30,
          Math.ceil((expectedHarvest.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)),
        )
      : 90;

  const progress = elapsedDays / totalDays;

  if (progress <= 0.2) return 'establishment';
  if (progress <= 0.55) return 'vegetative';
  if (progress <= 0.8) return 'flowering';
  return 'maturation';
};

const hasInterventionKeyword = (interventions: string[], keywords: string[]) => {
  const normalizedInterventions = interventions.map(normalizeText);
  return keywords.some((keyword) =>
    normalizedInterventions.some((intervention) => intervention.includes(normalizeText(keyword))),
  );
};

const buildIrrigationRecommendation = (
  crop: CropRow,
  growthStage: string,
  interventions: string[],
  weather: WeatherOverview,
): Omit<RecommendationDto, 'id' | 'generationId' | 'generatedAt'> => {
  const cropName = crop.name || 'this crop';
  const actions: string[] = [];
  let priority: RecommendationPriority = 'medium';
  let title = 'Maintain a balanced irrigation rhythm';
  let summary = `Use the current weather and the ${growthStage} stage of ${cropName} to avoid both stress and waterlogging.`;

  if (weather.rainfallProbability >= 65) {
    priority = 'high';
    title = 'Reduce irrigation before the next rains';
    summary = `${cropName} is likely to receive enough water from upcoming rainfall. Focus on drainage and postpone routine watering for 24 to 48 hours.`;
    actions.push('Pause scheduled irrigation unless leaves show visible stress.');
    actions.push('Open drainage channels and clear blockages around the plot.');
    actions.push('Reassess soil moisture after the rain event before watering again.');
  } else if (weather.humidity <= 55 || /dry/i.test(weather.condition)) {
    priority = 'high';
    title = 'Increase deep watering during the dry window';
    summary = `${cropName} is exposed to dry conditions. Prioritize deep irrigation so moisture reaches the root zone.`;
    actions.push('Water early in the morning to limit evaporation losses.');
    actions.push('Favor fewer but deeper irrigation cycles instead of frequent light watering.');
    actions.push('Add mulch around the base to retain moisture if available.');
  } else {
    actions.push('Keep checking soil moisture before each watering round.');
    actions.push('Adjust the volume according to plot size and actual field humidity.');
  }

  if (growthStage === 'establishment') {
    actions.push('During establishment, keep the topsoil evenly moist without saturating it.');
  } else if (growthStage === 'flowering') {
    actions.push('During flowering, avoid long water deficits because they quickly reduce yield.');
  } else if (growthStage === 'maturation') {
    actions.push('As the crop approaches harvest, reduce excess watering to protect quality and reduce disease pressure.');
  }

  if (hasInterventionKeyword(interventions, ['irrigation', 'watering', 'arrosage'])) {
    actions.push('Because irrigation was recently mentioned in your interventions, verify field moisture before adding another pass.');
  }

  return {
    category: 'irrigation',
    title,
    summary,
    actions,
    priority,
    growthStage: growthStage,
    weatherSummary: buildWeatherSummary(weather),
    recentInterventions: interventions,
  };
};

const buildFertilizationRecommendation = (
  crop: CropRow,
  growthStage: string,
  interventions: string[],
  weather: WeatherOverview,
): Omit<RecommendationDto, 'id' | 'generationId' | 'generatedAt'> => {
  const cropName = crop.name || 'this crop';
  const actions: string[] = [];
  let title = 'Review the fertilization program';
  let summary = `Adapt fertilizer choice and timing to the ${growthStage} stage of ${cropName}.`;
  let priority: RecommendationPriority = 'medium';

  if (growthStage === 'establishment') {
    summary = `At establishment, ${cropName} should receive a light starter nutrition strategy instead of aggressive fertilization.`;
    actions.push('Use a light starter input or well-decomposed organic matter close to the root zone.');
    actions.push('Avoid heavy nitrogen doses before the root system is fully anchored.');
  } else if (growthStage === 'vegetative') {
    title = 'Support vegetative growth with balanced nutrition';
    actions.push('Prioritize balanced nutrition with enough nitrogen to support leaf and stem growth.');
    actions.push('Observe leaf color and vigor before increasing the dose.');
  } else if (growthStage === 'flowering') {
    title = 'Protect flowering with balanced NPK management';
    priority = 'high';
    actions.push('Favor balanced NPK inputs and reinforce potassium if locally recommended.');
    actions.push('Avoid over-stimulating vegetative growth while the crop is flowering.');
  } else if (growthStage === 'maturation') {
    title = 'Avoid heavy fertilization near harvest';
    summary = `${cropName} is approaching harvest, so the focus should shift to crop finishing rather than strong nutrient pushes.`;
    actions.push('Avoid heavy nitrogen applications late in the cycle.');
    actions.push('Use only corrective inputs if a clear deficiency is visible.');
  }

  if (weather.rainfallProbability >= 65) {
    actions.push('If you must fertilize, avoid applying just before heavy rain to reduce nutrient losses.');
  } else {
    actions.push('Apply fertilizer when soil moisture is adequate so nutrients can dissolve and move to the roots.');
  }

  if (hasInterventionKeyword(interventions, ['fertilizer', 'fertiliser', 'npk', 'compost', 'manure'])) {
    priority = 'medium';
    actions.push('Recent interventions mention fertilization, so double-check the last application before repeating it.');
  }

  return {
    category: 'fertilization',
    title,
    summary,
    actions,
    priority,
    growthStage: growthStage,
    weatherSummary: buildWeatherSummary(weather),
    recentInterventions: interventions,
  };
};

const buildPhytosanitaryRecommendation = (
  crop: CropRow,
  growthStage: string,
  interventions: string[],
  weather: WeatherOverview,
  alerts: WeatherAlert[],
): Omit<RecommendationDto, 'id' | 'generationId' | 'generatedAt'> => {
  const cropName = crop.name || 'this crop';
  const cropAlerts = alerts.filter((alert) => !alert.cropName || normalizeText(alert.cropName) === normalizeText(cropName));
  const actions: string[] = [];
  let title = 'Maintain preventive field scouting';
  let summary = `Keep observing ${cropName} regularly so pest and disease pressure is detected early.`;
  let priority: RecommendationPriority = 'medium';

  const diseaseAlert = cropAlerts.find((alert) => alert.type === 'disease_pressure');
  const windAlert = cropAlerts.find((alert) => alert.type === 'strong_wind');

  if (diseaseAlert || (weather.humidity >= 75 && weather.rainfallProbability >= 55)) {
    title = 'Increase disease surveillance after humid weather';
    priority = 'high';
    summary = `${cropName} is in a favorable context for fungal pressure and fast disease spread.`;
    actions.push('Inspect leaves, stems, and lower canopy every 48 hours for fresh symptoms.');
    actions.push('Remove heavily infected plant material if you detect active lesions.');
    actions.push('Plan a preventive or corrective phytosanitary treatment only if symptoms or local advisory thresholds justify it.');
  } else if (windAlert || /dusty/i.test(weather.condition)) {
    title = 'Protect the crop against stress and secondary attacks';
    priority = 'medium';
    summary = `${cropName} may be stressed by dry wind or dust, which can favor secondary pest pressure.`;
    actions.push('Inspect for leaf tearing, scorch, mites, and weakened tissue after windy periods.');
    actions.push('Reinforce general hygiene around the plot to reduce pest shelters.');
  } else {
    actions.push('Keep a weekly scouting routine and note any unusual symptom pattern.');
    actions.push('Check the underside of leaves and young shoots where pests often appear first.');
  }

  if (growthStage === 'flowering') {
    actions.push('During flowering, choose interventions that protect blossoms and pollination activity.');
  }

  if (hasInterventionKeyword(interventions, ['spray', 'treatment', 'fungicide', 'pesticide', 'herbicide'])) {
    actions.push('A phytosanitary intervention was recently mentioned, so respect the previous treatment interval before repeating it.');
  }

  return {
    category: 'phytosanitary',
    title,
    summary,
    actions,
    priority,
    growthStage: growthStage,
    weatherSummary: buildWeatherSummary(weather),
    recentInterventions: interventions,
  };
};

const mapRecommendation = (row: StoredRecommendation): RecommendationDto => ({
  id: row.id,
  generationId: row.generation_id,
  category: row.category,
  title: row.title,
  summary: row.summary,
  actions: Array.isArray(row.actions) ? row.actions : [],
  priority: row.priority,
  growthStage: row.growth_stage,
  weatherSummary: row.weather_summary,
  recentInterventions: Array.isArray(row.recent_interventions) ? row.recent_interventions : [],
  generatedAt: row.generated_at,
});

const getLatestRecommendationBatch = async (cropPlanId: string) => {
  const { data: latestRow, error: latestError } = await supabaseServiceClient
    .from('crop_recommendations')
    .select('generation_id, generated_at')
    .eq('crop_plan_id', cropPlanId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    throw new Error(`Unable to inspect latest recommendations: ${latestError.message}`);
  }

  if (!latestRow?.generation_id) {
    return null;
  }

  const { data: rows, error: rowsError } = await supabaseServiceClient
    .from('crop_recommendations')
    .select('*')
    .eq('generation_id', latestRow.generation_id)
    .order('generated_at', { ascending: false });

  if (rowsError) {
    throw new Error(`Unable to load recommendation history: ${rowsError.message}`);
  }

  return {
    generatedAt: latestRow.generated_at,
    recommendations: ((rows ?? []) as StoredRecommendation[])
      .sort(
        (left, right) =>
          CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category),
      )
      .map(mapRecommendation),
  };
};

const loadPlanContext = async (planId: string, userId: string) => {
  const { data: plan, error: planError } = await supabaseServiceClient
    .from('crop_plans')
    .select('id, crop_id, tasks')
    .eq('id', planId)
    .maybeSingle();

  if (planError || !plan) {
    throw new Error(`Crop plan not found: ${planError?.message ?? 'missing plan'}`);
  }

  const { data: crop, error: cropError } = await supabaseServiceClient
    .from('crops')
    .select('id, user_id, name, location, notes, planting_date, expected_harvest, status, area')
    .eq('id', plan.crop_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (cropError || !crop) {
    throw new Error(`Crop not found for recommendations: ${cropError?.message ?? 'missing crop'}`);
  }

  return {
    plan: plan as CropPlanRow,
    crop: crop as CropRow,
  };
};

const insertRecommendationBatch = async (
  plan: CropPlanRow,
  crop: CropRow,
  recommendations: Omit<RecommendationDto, 'id' | 'generationId' | 'generatedAt'>[],
  snapshot: Record<string, unknown>,
) => {
  const generationId = randomUUID();
  const generatedAt = new Date().toISOString();

  await supabaseServiceClient
    .from('crop_recommendations')
    .update({ is_current: false })
    .eq('crop_plan_id', plan.id)
    .eq('is_current', true);

  const rows = recommendations.map((recommendation) => ({
    generation_id: generationId,
    user_id: crop.user_id,
    crop_id: crop.id,
    crop_plan_id: plan.id,
    category: recommendation.category,
    title: recommendation.title,
    summary: recommendation.summary,
    actions: recommendation.actions,
    priority: recommendation.priority,
    growth_stage: recommendation.growthStage,
    weather_summary: recommendation.weatherSummary,
    recent_interventions: recommendation.recentInterventions,
    source_snapshot: snapshot,
    is_current: true,
    generated_at: generatedAt,
  }));

  const { data, error } = await supabaseServiceClient
    .from('crop_recommendations')
    .insert(rows)
    .select('*');

  if (error) {
    throw new Error(`Unable to store crop recommendations: ${error.message}`);
  }

  return (data as StoredRecommendation[])
    .sort((left, right) => CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category))
    .map(mapRecommendation);
};

export const getCropRecommendations = async (
  planId: string,
  userId: string,
  options?: { forceRefresh?: boolean },
) => {
  const latestBatch = await getLatestRecommendationBatch(planId);
  const freshEnough =
    latestBatch &&
    Date.now() - new Date(latestBatch.generatedAt).getTime() < CACHE_WINDOW_MINUTES * 60 * 1000;

  if (freshEnough && !options?.forceRefresh) {
    return {
      recommendations: latestBatch.recommendations,
      source: 'cache' as const,
      generatedAt: latestBatch.generatedAt,
    };
  }

  const { plan, crop } = await loadPlanContext(planId, userId);
  const [weather, alerts] = await Promise.all([getWeatherOverview(userId), getWeatherAlerts(userId)]);
  const growthStage = deriveGrowthStage(crop);
  const recentInterventions = buildRecentInterventions(crop, Array.isArray(plan.tasks) ? plan.tasks : []);

  const generatedRecommendations = [
    buildIrrigationRecommendation(crop, growthStage, recentInterventions, weather),
    buildFertilizationRecommendation(crop, growthStage, recentInterventions, weather),
    buildPhytosanitaryRecommendation(crop, growthStage, recentInterventions, weather, alerts),
  ];

  const recommendations = await insertRecommendationBatch(plan, crop, generatedRecommendations, {
    crop: {
      name: crop.name,
      location: crop.location,
      status: crop.status,
      area: crop.area,
      planting_date: crop.planting_date,
      expected_harvest: crop.expected_harvest,
    },
    growth_stage: growthStage,
    recent_interventions: recentInterventions,
    weather,
    alerts,
  });

  return {
    recommendations,
    source: 'fresh' as const,
    generatedAt: recommendations[0]?.generatedAt ?? new Date().toISOString(),
  };
};

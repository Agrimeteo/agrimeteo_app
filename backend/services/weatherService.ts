import axios from 'axios';
import { supabaseServiceClient } from '../config/supabase.js';

type RegionRow = {
  id: string;
  name: string;
  climate: string;
  soil_type: string;
  avg_precipitation_mm: number;
  avg_temperature_c: number;
  latitude: number;
  longitude: number;
};

type CropRow = {
  id: string;
  name?: string | null;
  crop_type?: string | null;
  location?: string | null;
};

type ClimateDataRow = {
  season: string;
  avg_temp_min: number | null;
  avg_temp_max: number | null;
  avg_rainfall_mm: number | null;
  humidity_percent: number | null;
  recommendations: string[] | null;
  risk_factors: string[] | null;
};

type WeatherAlertRow = {
  id: string;
  user_id: string;
  crop_id: string | null;
  region_id: string | null;
  location: string | null;
  type: string;
  security: 'low' | 'medium' | 'high';
  description: string;
  valid_until: string | null;
  created_at: string;
};

type WeatherOverview = {
  temperature: number;
  humidity: number;
  condition: string;
  location: string;
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
  }>;
  rainfallProbability: number;
  uvIndex: string;
};

type WeatherAlert = {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  date: string;
  cropName?: string | null;
  regionName?: string | null;
  location?: string | null;
};

type RegionWeatherContext = {
  region: RegionRow | null;
  climate: ClimateDataRow | null;
  location: string;
  season: string;
};

type OpenWeatherDaily = {
  dt: number;
  pop?: number;
  humidity?: number;
  temp?: {
    day?: number;
    min?: number;
    max?: number;
  };
  weather?: Array<{
    main?: string;
    description?: string;
  }>;
  uvi?: number;
};

type OpenWeatherOneCallResponse = {
  current?: {
    temp?: number;
    humidity?: number;
    uvi?: number;
    weather?: Array<{
      main?: string;
      description?: string;
    }>;
  };
  daily?: OpenWeatherDaily[];
  alerts?: Array<{
    event?: string;
    description?: string;
    start?: number;
    end?: number;
  }>;
};

const isRecoverableWeatherAlertSchemaError = (message: string) => {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes('weather_alerts') &&
    (normalizedMessage.includes('does not exist') ||
      normalizedMessage.includes('schema cache') ||
      normalizedMessage.includes('could not find') ||
      normalizedMessage.includes('column'))
  );
};

const getCurrentSeason = (month: number) => {
  if (month === 12 || month === 1 || month === 2) {
    return 'harmattan';
  }

  if (month >= 5 && month <= 10) {
    return 'rainy';
  }

  return 'dry';
};

const mapRiskToAlert = (risk: string) => {
  const value = risk.toLowerCase();

  if (value.includes('flood')) {
    return {
      type: 'flood_risk',
      severity: 'high' as const,
      title: 'Flood risk near your field',
    };
  }

  if (value.includes('drought') || value.includes('dry')) {
    return {
      type: 'drought_risk',
      severity: 'high' as const,
      title: 'Dry spell risk for your crop',
    };
  }

  if (value.includes('wind') || value.includes('harmattan')) {
    return {
      type: 'strong_wind',
      severity: 'medium' as const,
      title: 'Strong wind advisory',
    };
  }

  if (value.includes('fungal') || value.includes('disease')) {
    return {
      type: 'disease_pressure',
      severity: 'medium' as const,
      title: 'High disease pressure expected',
    };
  }

  if (value.includes('heat') || value.includes('temperature')) {
    return {
      type: 'extreme_heat',
      severity: 'high' as const,
      title: 'Heat stress warning',
    };
  }

  return {
    type: 'seasonal_watch',
    severity: 'low' as const,
    title: 'Seasonal farm advisory',
  };
};

const buildDescription = (crop: CropRow, region: RegionRow, risk: string, recommendation: string | null) => {
  const cropName = crop.name || crop.crop_type || 'your crop';
  const recommendationText = recommendation ? ` Recommended action: ${recommendation}.` : '';

  return `${cropName} in ${region.name} may face ${risk.toLowerCase()} during the current season.${recommendationText}`;
};

const locationAliases: Record<string, string> = {
  douala: 'Littoral',
  yaounde: 'Centre',
  yaoundé: 'Centre',
  bafoussam: 'West',
  bamenda: 'North-West',
  buea: 'South-West',
  garoua: 'North',
  maroua: 'Far North',
  bertoua: 'East',
  ebolowa: 'South',
  ngaoundere: 'Adamawa',
  ngaoundéré: 'Adamawa',
};

const normalizeLocationName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const resolveRegionName = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const normalized = normalizeLocationName(value);
  return locationAliases[normalized] ?? value;
};

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const formatOpenWeatherCondition = (
  weather?: Array<{ main?: string; description?: string }>,
  fallback = 'Mostly dry',
) => {
  const description = weather?.[0]?.description?.trim();
  const main = weather?.[0]?.main?.trim();

  if (description) {
    return toTitleCase(description);
  }

  if (main) {
    return toTitleCase(main);
  }

  return fallback;
};

const mapUvIndexLabel = (uvIndex?: number) => {
  if (uvIndex == null) {
    return 'Moderate';
  }

  if (uvIndex >= 11) return 'Extreme';
  if (uvIndex >= 8) return 'Very High';
  if (uvIndex >= 6) return 'High';
  if (uvIndex >= 3) return 'Moderate';
  return 'Low';
};

const getDayLabel = (offset: number) => {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  if (offset === 2) return 'Day after';

  return new Date(Date.now() + offset * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
  });
};

const isOpenWeatherConfigured = () => Boolean(process.env.OPENWEATHER_API_KEY);

const getOpenWeatherUrl = (lat: number, lon: number) =>
  `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&exclude=minutely,hourly`;

const mapExternalAlertSeverity = (eventText: string) => {
  const normalized = eventText.toLowerCase();

  if (
    normalized.includes('storm') ||
    normalized.includes('thunder') ||
    normalized.includes('flood') ||
    normalized.includes('extreme') ||
    normalized.includes('hurricane') ||
    normalized.includes('tornado')
  ) {
    return 'high' as const;
  }

  if (
    normalized.includes('wind') ||
    normalized.includes('rain') ||
    normalized.includes('heat') ||
    normalized.includes('fog')
  ) {
    return 'medium' as const;
  }

  return 'low' as const;
};

const buildLocalWeatherOverview = (context: RegionWeatherContext): WeatherOverview => {
  const { region, climate, location, season } = context;
  const averageTemperature =
    climate?.avg_temp_min != null && climate?.avg_temp_max != null
      ? Math.round((climate.avg_temp_min + climate.avg_temp_max) / 2)
      : Math.round(region?.avg_temperature_c ?? 26);

  const condition =
    season === 'rainy' ? 'Rain likely' : season === 'harmattan' ? 'Dusty winds possible' : 'Mostly dry';

  return {
    temperature: averageTemperature,
    humidity: Math.round(climate?.humidity_percent ?? 65),
    condition,
    location,
    forecast: [
      { day: 'Today', temp: averageTemperature, condition },
      { day: 'Tomorrow', temp: averageTemperature + (season === 'dry' ? 1 : 0), condition },
      {
        day: 'Day after',
        temp: averageTemperature - (season === 'rainy' ? 1 : 0),
        condition: season === 'rainy' ? 'Showers possible' : condition,
      },
    ],
    rainfallProbability: season === 'rainy' ? 70 : season === 'harmattan' ? 10 : 25,
    uvIndex: season === 'dry' ? 'High' : 'Moderate',
  };
};

const getRegionWeatherContext = async (userId: string): Promise<RegionWeatherContext> => {
  const { data: profile, error: profileError } = await supabaseServiceClient
    .from('profiles')
    .select('location')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to load user location for weather: ${profileError.message}`);
  }

  const { data: crops, error: cropsError } = await supabaseServiceClient
    .from('crops')
    .select('location')
    .eq('user_id', userId)
    .not('location', 'is', null)
    .limit(1);

  if (cropsError) {
    throw new Error(`Unable to load crop location for weather: ${cropsError.message}`);
  }

  const regionName = resolveRegionName(profile?.location) ?? resolveRegionName(crops?.[0]?.location) ?? 'Centre';
  const { data: region, error: regionError } = await supabaseServiceClient
    .from('regions')
    .select('id, name, climate, soil_type, avg_precipitation_mm, avg_temperature_c, latitude, longitude')
    .eq('name', regionName)
    .maybeSingle();

  if (regionError) {
    throw new Error(`Unable to load region weather context: ${regionError.message}`);
  }

  const season = getCurrentSeason(new Date().getMonth() + 1);

  const { data: climate, error: climateError } = await supabaseServiceClient
    .from('climate_data')
    .select('season, avg_temp_min, avg_temp_max, avg_rainfall_mm, humidity_percent, recommendations, risk_factors')
    .eq('region_id', region?.id ?? '')
    .eq('season', season)
    .maybeSingle();

  if (climateError) {
    throw new Error(`Unable to load climate profile: ${climateError.message}`);
  }

  return {
    region: (region as RegionRow | null) ?? null,
    climate: (climate as ClimateDataRow | null) ?? null,
    location: region ? `${region.name}, Cameroon` : 'Cameroon',
    season,
  };
};

const fetchOpenWeatherOverview = async (context: RegionWeatherContext): Promise<WeatherOverview | null> => {
  if (!isOpenWeatherConfigured() || context.region?.latitude == null || context.region?.longitude == null) {
    return null;
  }

  try {
    const fallback = buildLocalWeatherOverview(context);
    const { data } = await axios.get<OpenWeatherOneCallResponse>(
      getOpenWeatherUrl(context.region.latitude, context.region.longitude),
      { timeout: 8000 },
    );

    const daily = data.daily ?? [];
    const current = data.current;
    const forecast = daily.slice(0, 3).map((day, index) => ({
      day: getDayLabel(index),
      temp: Math.round(day.temp?.day ?? day.temp?.max ?? current?.temp ?? fallback.temperature),
      condition: formatOpenWeatherCondition(day.weather, fallback.forecast[index]?.condition ?? fallback.condition),
    }));

    const today = daily[0];

    return {
      temperature: Math.round(current?.temp ?? today?.temp?.day ?? fallback.temperature),
      humidity: Math.round(current?.humidity ?? today?.humidity ?? fallback.humidity),
      condition: formatOpenWeatherCondition(current?.weather, fallback.condition),
      location: context.location,
      forecast: forecast.length > 0 ? forecast : fallback.forecast,
      rainfallProbability: Math.round((today?.pop ?? fallback.rainfallProbability / 100) * 100),
      uvIndex: mapUvIndexLabel(current?.uvi ?? today?.uvi),
    };
  } catch (error) {
    console.warn('OpenWeatherMap overview fetch failed, falling back to local climate data.', error);
    return null;
  }
};

const fetchOpenWeatherAlerts = async (context: RegionWeatherContext): Promise<WeatherAlert[]> => {
  if (!isOpenWeatherConfigured() || context.region?.latitude == null || context.region?.longitude == null) {
    return [];
  }

  try {
    const { data } = await axios.get<OpenWeatherOneCallResponse>(
      getOpenWeatherUrl(context.region.latitude, context.region.longitude),
      { timeout: 8000 },
    );

    return (data.alerts ?? []).map((alert, index) => ({
      id: `owm-${context.region?.id ?? 'region'}-${index}-${alert.start ?? Date.now()}`,
      type: 'external_weather_alert',
      severity: mapExternalAlertSeverity(alert.event ?? alert.description ?? 'weather alert'),
      title: alert.event?.trim() || 'Weather advisory',
      description: alert.description?.trim() || 'Weather conditions may affect your farm operations.',
      date: new Date((alert.end ?? alert.start ?? Math.floor(Date.now() / 1000)) * 1000).toISOString(),
      cropName: null,
      regionName: context.region?.name ?? null,
      location: context.location,
    }));
  } catch (error) {
    console.warn('OpenWeatherMap alert fetch failed, keeping local alerts only.', error);
    return [];
  }
};

const ensureAlertsForUser = async (userId: string) => {
  const { data: crops, error: cropsError } = await supabaseServiceClient
    .from('crops')
    .select('id, name, crop_type, location')
    .eq('user_id', userId)
    .not('location', 'is', null);

  if (cropsError) {
    throw new Error(`Unable to load crops for weather alerts: ${cropsError.message}`);
  }

  const cropRows = (crops ?? []) as CropRow[];
  if (cropRows.length === 0) {
    return [];
  }

  const uniqueRegionNames = [
    ...new Set(cropRows.map((crop) => resolveRegionName(crop.location)).filter(Boolean)),
  ] as string[];

  const { data: regions, error: regionsError } = await supabaseServiceClient
    .from('regions')
    .select('id, name, climate, soil_type, avg_precipitation_mm, avg_temperature_c, latitude, longitude')
    .in('name', uniqueRegionNames);

  if (regionsError) {
    throw new Error(`Unable to load regions for weather alerts: ${regionsError.message}`);
  }

  const regionMap = new Map((regions ?? []).map((region) => [region.name, region as RegionRow]));
  const currentSeason = getCurrentSeason(new Date().getMonth() + 1);

  const regionIds = (regions ?? []).map((region) => region.id);
  const { data: climateData, error: climateError } = await supabaseServiceClient
    .from('climate_data')
    .select('region_id, season, avg_temp_min, avg_temp_max, avg_rainfall_mm, humidity_percent, recommendations, risk_factors')
    .in('region_id', regionIds)
    .eq('season', currentSeason);

  if (climateError) {
    throw new Error(`Unable to load climate data: ${climateError.message}`);
  }

  const climateMap = new Map<string, ClimateDataRow>();
  (climateData ?? []).forEach((row) => {
    climateMap.set((row as ClimateDataRow & { region_id: string }).region_id, row as ClimateDataRow);
  });

  const since = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const { data: recentAlerts, error: recentAlertsError } = await supabaseServiceClient
    .from('weather_alerts')
    .select('crop_id, region_id, type, created_at')
    .eq('user_id', userId)
    .gte('created_at', since);

  if (recentAlertsError) {
    throw new Error(`Unable to inspect recent weather alerts: ${recentAlertsError.message}`);
  }

  const recentKeys = new Set(
    (recentAlerts ?? []).map((alert) => `${alert.crop_id ?? 'none'}:${alert.region_id ?? 'none'}:${alert.type}`),
  );

  const alertsToInsert = cropRows
    .map((crop) => {
      const resolvedRegionName = resolveRegionName(crop.location);
      const region = resolvedRegionName ? regionMap.get(resolvedRegionName) : undefined;
      if (!region) {
        return null;
      }

      const climate = climateMap.get(region.id);
      const firstRisk = climate?.risk_factors?.[0];
      if (!firstRisk) {
        return null;
      }

      const meta = mapRiskToAlert(firstRisk);
      const dedupeKey = `${crop.id}:${region.id}:${meta.type}`;
      if (recentKeys.has(dedupeKey)) {
        return null;
      }

      return {
        user_id: userId,
        crop_id: crop.id,
        region_id: region.id,
        location: region.name,
        type: meta.type,
        security: meta.severity,
        description: buildDescription(crop, region, firstRisk, climate?.recommendations?.[0] ?? null),
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    })
    .filter(Boolean);

  if (alertsToInsert.length > 0) {
    const { error: insertError } = await supabaseServiceClient.from('weather_alerts').insert(alertsToInsert);

    if (insertError) {
      throw new Error(`Unable to create weather alerts: ${insertError.message}`);
    }
  }

  return alertsToInsert;
};

export const getWeatherOverview = async (userId: string) => {
  const context = await getRegionWeatherContext(userId);
  const externalOverview = await fetchOpenWeatherOverview(context);

  if (externalOverview) {
    return externalOverview;
  }

  return buildLocalWeatherOverview(context);
};

export const getWeatherAlerts = async (userId: string) => {
  try {
    const context = await getRegionWeatherContext(userId);

    try {
      await ensureAlertsForUser(userId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown weather alert generation error';

      if (!isRecoverableWeatherAlertSchemaError(message)) {
        throw error;
      }

      console.warn(`Weather alert generation skipped because schema is incomplete: ${message}`);
    }

    const externalAlerts = await fetchOpenWeatherAlerts(context);

    const { data, error } = await supabaseServiceClient
      .from('weather_alerts')
      .select('id, user_id, crop_id, region_id, location, type, security, description, valid_until, created_at')
      .eq('user_id', userId)
      .order('valid_until', { ascending: false })
      .limit(20);

    if (error) {
      if (isRecoverableWeatherAlertSchemaError(error.message)) {
        console.warn(`Weather alerts unavailable, returning local external alerts only: ${error.message}`);
        return externalAlerts;
      }

      throw new Error(`Unable to load weather alerts: ${error.message}`);
    }

    const alerts = (data ?? []) as Array<WeatherAlertRow>;
    const cropIds = [...new Set(alerts.map((alert) => alert.crop_id).filter(Boolean))] as string[];
    const regionIds = [...new Set(alerts.map((alert) => alert.region_id).filter(Boolean))] as string[];

    const [{ data: crops }, { data: regions }] = await Promise.all([
      cropIds.length
        ? supabaseServiceClient.from('crops').select('id, name, crop_type').in('id', cropIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name?: string | null; crop_type?: string | null }> }),
      regionIds.length
        ? supabaseServiceClient.from('regions').select('id, name').in('id', regionIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
    ]);

    const cropMap = new Map((crops ?? []).map((crop) => [crop.id, crop.name || crop.crop_type || null]));
    const regionMap = new Map((regions ?? []).map((region) => [region.id, region.name]));

    const localAlerts: WeatherAlert[] = alerts.map((alert) => ({
      id: alert.id,
      type: alert.type,
      severity: alert.security,
      title: metaTitleFromType(alert.type),
      description: alert.description,
      date: alert.valid_until ?? alert.created_at,
      location: alert.location ?? (alert.region_id ? regionMap.get(alert.region_id) ?? null : null),
      cropName: alert.crop_id ? cropMap.get(alert.crop_id) ?? null : null,
      regionName: alert.region_id ? regionMap.get(alert.region_id) ?? null : null,
    }));

    return [...externalAlerts, ...localAlerts]
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
      .slice(0, 20);
  } catch (error) {
    console.warn(
      `Weather alerts could not be loaded for user ${userId}. Returning an empty list instead.`,
      error,
    );
    return [];
  }
};

const metaTitleFromType = (type: string) => {
  switch (type) {
    case 'flood_risk':
      return 'Flood risk near your field';
    case 'drought_risk':
      return 'Dry spell risk for your crop';
    case 'strong_wind':
      return 'Strong wind advisory';
    case 'disease_pressure':
      return 'High disease pressure expected';
    case 'extreme_heat':
      return 'Heat stress warning';
    default:
      return 'Seasonal farm advisory';
  }
};

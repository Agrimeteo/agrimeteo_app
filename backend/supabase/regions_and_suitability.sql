-- Regions and Crop Suitability Schema for Cameroon
-- This file extends the existing schema with Cameroon-specific data

-- Extend crops table with new fields
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS area REAL;
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS suitability_score INTEGER CHECK (suitability_score >= 0 AND suitability_score <= 10);
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS suitability_reasons TEXT[];
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS area_warning BOOLEAN DEFAULT FALSE;

-- Regions table (10 regions of Cameroon)
CREATE TABLE IF NOT EXISTS public.regions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  climate TEXT NOT NULL, -- e.g., 'tropical_humid', 'semi_arid', 'tropical'
  soil_type TEXT NOT NULL, -- e.g., 'ferralitic', 'volcanic', 'alluvial'
  avg_precipitation_mm INTEGER NOT NULL,
  avg_temperature_c REAL NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Cameroon regions data
INSERT INTO public.regions (name, climate, soil_type, avg_precipitation_mm, avg_temperature_c, latitude, longitude) VALUES
('Adamawa', 'tropical', 'ferralitic', 1500, 25.5, 7.32, 13.59),
('Centre', 'tropical', 'ferralitic', 1600, 24.0, 4.05, 11.52),
('East', 'tropical_humid', 'ferralitic', 1800, 23.5, 4.07, 14.15),
('Far North', 'semi_arid', 'alluvial', 700, 28.0, 10.59, 14.32),
('Littoral', 'tropical_humid', 'volcanic', 3000, 26.0, 4.17, 9.24),
('North', 'semi_arid', 'ferralitic', 900, 27.5, 8.58, 13.91),
('North-West', 'tropical', 'volcanic', 2000, 22.0, 6.22, 10.38),
('South', 'tropical_humid', 'ferralitic', 2500, 24.5, 2.56, 10.42),
('South-West', 'tropical_humid', 'volcanic', 4000, 25.0, 5.47, 9.17),
('West', 'tropical', 'ferralitic', 1400, 24.5, 5.48, 10.41);

-- Crop-Region Suitability table
CREATE TABLE IF NOT EXISTS public.crop_region_suitability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_type TEXT NOT NULL,
  region_id UUID REFERENCES public.regions(id) ON DELETE CASCADE,
  suitability_score INTEGER CHECK (suitability_score >= 1 AND suitability_score <= 10),
  reasons TEXT[], -- Array of reasons (e.g., ['Good rainfall', 'Poor soil match'])
  max_recommended_area_ha INTEGER, -- Maximum recommended area in hectares
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(crop_type, region_id)
);

-- Insert suitability data for common crops
-- Maize (Maïs) - adaptable but varies by region
INSERT INTO public.crop_region_suitability (crop_type, region_id, suitability_score, reasons, max_recommended_area_ha) VALUES
('Maïs', (SELECT id FROM public.regions WHERE name = 'Centre'), 9, ARRAY['Good rainfall', 'Suitable soil', 'Optimal temperature'], 50),
('Maïs', (SELECT id FROM public.regions WHERE name = 'West'), 8, ARRAY['Adequate rainfall', 'Good soil fertility'], 40),
('Maïs', (SELECT id FROM public.regions WHERE name = 'North'), 6, ARRAY['Borderline rainfall', 'Need irrigation support'], 20),
('Maïs', (SELECT id FROM public.regions WHERE name = 'Far North'), 4, ARRAY['Low rainfall', 'High temperature stress', 'Requires irrigation'], 10),

-- Cocoa (Cacao) - prefers humid regions
('Cacao', (SELECT id FROM public.regions WHERE name = 'South-West'), 10, ARRAY['Excellent humidity', 'Volcanic soil ideal', 'Traditional growing area'], 100),
('Cacao', (SELECT id FROM public.regions WHERE name = 'Littoral'), 9, ARRAY['High rainfall', 'Good soil', 'Coastal humidity'], 80),
('Cacao', (SELECT id FROM public.regions WHERE name = 'Centre'), 6, ARRAY['Moderate rainfall', 'Soil acceptable but not optimal'], 30),
('Cacao', (SELECT id FROM public.regions WHERE name = 'North'), 2, ARRAY['Too dry', 'Unsuitable climate', 'High risk of failure'], 5),

-- Coffee (Café) - highland preference
('Café', (SELECT id FROM public.regions WHERE name = 'North-West'), 9, ARRAY['High altitude', 'Volcanic soil', 'Good rainfall'], 60),
('Café', (SELECT id FROM public.regions WHERE name = 'West'), 8, ARRAY['Suitable altitude', 'Good soil'], 50),
('Café', (SELECT id FROM public.regions WHERE name = 'Centre'), 7, ARRAY['Moderate conditions'], 40),
('Café', (SELECT id FROM public.regions WHERE name = 'Far North'), 1, ARRAY['Too hot and dry', 'Unsuitable altitude'], 2),

-- Wheat (Blé) - limited suitability in Cameroon
('Blé', (SELECT id FROM public.regions WHERE name = 'North-West'), 7, ARRAY['Cooler climate', 'Suitable for highlands'], 30),
('Blé', (SELECT id FROM public.regions WHERE name = 'West'), 6, ARRAY['Moderate conditions'], 25),
('Blé', (SELECT id FROM public.regions WHERE name = 'Centre'), 5, ARRAY['Borderline temperature'], 15),
('Blé', (SELECT id FROM public.regions WHERE name = 'Far North'), 3, ARRAY['Too hot', 'Low rainfall'], 5);

-- Enable RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_region_suitability ENABLE ROW LEVEL SECURITY;

-- Policies (regions are public, suitability is public)
CREATE POLICY "Regions are publicly readable" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Suitability is publicly readable" ON public.crop_region_suitability FOR SELECT USING (true);

-- Climate data table for Cameroon-specific recommendations
CREATE TABLE IF NOT EXISTS public.climate_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID REFERENCES public.regions(id) ON DELETE CASCADE,
  season TEXT NOT NULL, -- 'dry', 'rainy', 'harmattan'
  avg_temp_min REAL,
  avg_temp_max REAL,
  avg_rainfall_mm REAL,
  humidity_percent REAL,
  recommendations TEXT[], -- Array of climate-based recommendations
  risk_factors TEXT[], -- Array of risks (e.g., flooding, drought)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert climate data for Cameroon regions
-- Dry season: Nov-Feb, Rainy: May-Oct, Harmattan: Dec-Feb (North)
INSERT INTO public.climate_data (region_id, season, avg_temp_min, avg_temp_max, avg_rainfall_mm, humidity_percent, recommendations, risk_factors) VALUES
-- Adamawa - Tropical
((SELECT id FROM public.regions WHERE name = 'Adamawa'), 'dry', 18, 32, 10, 40, ARRAY['Plant drought-resistant varieties', 'Implement irrigation systems'], ARRAY['Drought stress', 'High temperatures']),
((SELECT id FROM public.regions WHERE name = 'Adamawa'), 'rainy', 22, 28, 200, 75, ARRAY['Monitor for fungal diseases', 'Ensure proper drainage'], ARRAY['Flooding', 'Fungal infections']),
((SELECT id FROM public.regions WHERE name = 'Adamawa'), 'harmattan', 15, 30, 5, 30, ARRAY['Protect young plants from wind', 'Increase watering'], ARRAY['Wind damage', 'Low humidity']),

-- Centre - Tropical
((SELECT id FROM public.regions WHERE name = 'Centre'), 'dry', 16, 30, 15, 45, ARRAY['Use mulch to retain moisture', 'Plant windbreaks'], ARRAY['Soil erosion', 'Water stress']),
((SELECT id FROM public.regions WHERE name = 'Centre'), 'rainy', 20, 26, 180, 80, ARRAY['Apply fungicides preventively', 'Improve soil drainage'], ARRAY['Heavy rainfall', 'Disease pressure']),
((SELECT id FROM public.regions WHERE name = 'Centre'), 'harmattan', 14, 28, 8, 35, ARRAY['Protect against dust', 'Monitor plant health'], ARRAY['Dust accumulation', 'Dehydration']),

-- Littoral - Humid tropical
((SELECT id FROM public.regions WHERE name = 'Littoral'), 'dry', 20, 28, 50, 70, ARRAY['Maintain humidity', 'Watch for salt spray'], ARRAY['Coastal winds', 'Salt damage']),
((SELECT id FROM public.regions WHERE name = 'Littoral'), 'rainy', 23, 27, 350, 85, ARRAY['Elevate planting areas', 'Use resistant varieties'], ARRAY['Flooding', 'High humidity diseases']),
((SELECT id FROM public.regions WHERE name = 'Littoral'), 'harmattan', 18, 26, 20, 60, ARRAY['Protect coastal plants', 'Monitor soil salinity'], ARRAY['Wind erosion', 'Salt stress']),

-- Far North - Semi-arid
((SELECT id FROM public.regions WHERE name = 'Far North'), 'dry', 14, 35, 5, 25, ARRAY['Essential irrigation', 'Use drought-tolerant crops'], ARRAY['Severe drought', 'Heat stress']),
((SELECT id FROM public.regions WHERE name = 'Far North'), 'rainy', 20, 30, 80, 60, ARRAY['Store water', 'Quick maturing varieties'], ARRAY['Irregular rainfall', 'Flood risks']),
((SELECT id FROM public.regions WHERE name = 'Far North'), 'harmattan', 12, 32, 2, 20, ARRAY['Wind protection mandatory', 'Extra watering'], ARRAY['Dust storms', 'Extreme dryness']),

-- North - Semi-arid
((SELECT id FROM public.regions WHERE name = 'North'), 'dry', 16, 34, 8, 30, ARRAY['Irrigation planning', 'Heat-resistant varieties'], ARRAY['Drought', 'High evaporation']),
((SELECT id FROM public.regions WHERE name = 'North'), 'rainy', 22, 29, 100, 65, ARRAY['Soil conservation', 'Pest monitoring'], ARRAY['Erosion', 'Variable rainfall']),
((SELECT id FROM public.regions WHERE name = 'North'), 'harmattan', 13, 31, 3, 25, ARRAY['Protect from harmattan winds', 'Humidity control'], ARRAY['Wind damage', 'Low moisture']);

-- Enable RLS
ALTER TABLE public.climate_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Climate data is publicly readable" ON public.climate_data FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS climate_data_region_id_idx ON public.climate_data(region_id);
CREATE INDEX IF NOT EXISTS climate_data_season_idx ON public.climate_data(season);
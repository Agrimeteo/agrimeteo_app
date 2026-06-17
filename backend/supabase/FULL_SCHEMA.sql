-- ADD TO EXISTING FULL_SCHEMA.sql

-- Crop Plans table
CREATE TABLE IF NOT EXISTS public.crop_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE NOT NULL,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.crop_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User owns crop plans through crops" ON public.crop_plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.crops 
    WHERE id = crop_plans.crop_id 
    AND crops.user_id = auth.uid()
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS crop_plans_crop_id_idx ON public.crop_plans(crop_id);
CREATE INDEX IF NOT EXISTS crop_plans_updated_at_idx ON public.crop_plans(updated_at);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crop_plans_updated_at BEFORE UPDATE
  ON public.crop_plans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Crop Types (for plan generation templates)
CREATE TABLE IF NOT EXISTS public.crop_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  tasks JSONB NOT NULL,
  avg_duration_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example crop types
INSERT INTO public.crop_types (name, tasks, avg_duration_days) VALUES
('Maïs', '[{"name":"Semis", "days_after_planting":0},{"name":"Fertilisation 1", "days_after_planting":21},{"name":"Fertilisation 2", "days_after_planting":45},{"name":"Désherbage", "days_after_planting":30},{"name":"Récolte", "days_after_planting":120}]'::jsonb, 120),
('Blé', '[{"name":"Semis", "days_after_planting":0},{"name":"Fertilisation azote", "days_after_planting":30},{"name":"Protection fongique", "days_after_planting":60},{"name":"Récolte", "days_after_planting":150}]'::jsonb, 150),
('Soja', '[{"name":"Semis", "days_after_planting":0},{"name":"Fertilisation", "days_after_planting":25},{"name":"Contrôle adventices", "days_after_planting":35},{"name":"Récolte", "days_after_planting":110}]'::jsonb, 110)
ON CONFLICT (name) DO NOTHING;

SELECT '✅ Crop Planning Schema Added - Run this to enable plans!';


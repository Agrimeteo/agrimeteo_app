-- Personalized crop recommendations history
-- Run this in Supabase before using the recommendation widget.

create table if not exists public.crop_recommendations (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  crop_id uuid references public.crops(id) on delete cascade not null,
  crop_plan_id uuid references public.crop_plans(id) on delete cascade not null,
  category text not null check (category in ('irrigation', 'fertilization', 'phytosanitary')),
  title text not null,
  summary text not null,
  actions jsonb not null default '[]'::jsonb,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  growth_stage text not null,
  weather_summary text,
  recent_interventions text[] default '{}',
  source_snapshot jsonb not null default '{}'::jsonb,
  is_current boolean not null default true,
  generated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists crop_recommendations_plan_idx
  on public.crop_recommendations (crop_plan_id, generated_at desc);

create index if not exists crop_recommendations_user_idx
  on public.crop_recommendations (user_id, generated_at desc);

alter table public.crop_recommendations enable row level security;

drop policy if exists "Users can read their crop recommendations" on public.crop_recommendations;
create policy "Users can read their crop recommendations"
on public.crop_recommendations
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their crop recommendations" on public.crop_recommendations;
create policy "Users can insert their crop recommendations"
on public.crop_recommendations
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their crop recommendations" on public.crop_recommendations;
create policy "Users can update their crop recommendations"
on public.crop_recommendations
for update
using (auth.uid() = user_id);

grant usage on schema public to service_role, authenticated;
grant select, insert, update, delete on table public.crop_recommendations to service_role;
grant select, insert, update on table public.crop_recommendations to authenticated;

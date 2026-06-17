-- Run this on an existing public.weather_alerts table.
-- Expected existing columns:
-- id, location, type, security, description, valid_until, created_at

alter table public.weather_alerts
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists crop_id uuid references public.crops(id) on delete cascade,
  add column if not exists region_id uuid references public.regions(id) on delete cascade;

alter table public.weather_alerts
  alter column location drop not null;

alter table public.weather_alerts enable row level security;

drop policy if exists "Users can view own weather alerts" on public.weather_alerts;
create policy "Users can view own weather alerts"
on public.weather_alerts for select
using (auth.uid() = user_id);

drop policy if exists "Users can update own weather alerts" on public.weather_alerts;
create policy "Users can update own weather alerts"
on public.weather_alerts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on public.weather_alerts to authenticated, service_role;

create index if not exists idx_weather_alerts_user_id on public.weather_alerts(user_id);
create index if not exists idx_weather_alerts_crop_id on public.weather_alerts(crop_id);
create index if not exists idx_weather_alerts_region_id on public.weather_alerts(region_id);
create index if not exists idx_weather_alerts_valid_until on public.weather_alerts(valid_until desc);

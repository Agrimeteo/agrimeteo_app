-- Run this only if public.crop_plans / public.crop_types already exist
-- and AgroSmart still reports:
-- "permission denied for table crop_plans"

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on table public.crop_plans to authenticated, service_role;
grant select on table public.crop_types to authenticated;
grant select, insert, update, delete on table public.crop_types to service_role;

alter table public.crop_plans enable row level security;
alter table public.crop_types enable row level security;

drop policy if exists "User owns crop plans through crops" on public.crop_plans;
create policy "User owns crop plans through crops"
on public.crop_plans
for all
using (
  exists (
    select 1
    from public.crops
    where crops.id = crop_plans.crop_id
      and crops.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.crops
    where crops.id = crop_plans.crop_id
      and crops.user_id = auth.uid()
  )
);

drop policy if exists "Crop types are readable" on public.crop_types;
create policy "Crop types are readable"
on public.crop_types
for select
using (true);

create index if not exists crop_plans_crop_id_idx on public.crop_plans(crop_id);
create index if not exists crop_plans_updated_at_idx on public.crop_plans(updated_at);
create index if not exists crop_types_name_idx on public.crop_types(name);


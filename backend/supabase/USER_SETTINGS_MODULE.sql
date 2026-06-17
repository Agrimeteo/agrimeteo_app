-- User settings module for AgroSmart
-- Run once in Supabase SQL editor.

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  language text not null default 'en-US' check (language in ('en-US', 'fr-FR')),
  theme text not null default 'light' check (theme in ('light', 'dark')),
  units_system text not null default 'metric' check (units_system in ('metric', 'imperial')),
  profile_visibility text not null default 'community' check (profile_visibility in ('private', 'community')),
  share_location boolean not null default true,
  allow_analytics boolean not null default true,
  push_notifications boolean not null default true,
  email_alerts boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_settings_theme_idx on public.user_settings(theme);
create index if not exists user_settings_language_idx on public.user_settings(language);

alter table public.user_settings enable row level security;

drop policy if exists "Users can view own settings" on public.user_settings;
create policy "Users can view own settings"
on public.user_settings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
on public.user_settings
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
on public.user_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant usage on schema public to authenticated, service_role;
grant select, insert, update on public.user_settings to authenticated, service_role;

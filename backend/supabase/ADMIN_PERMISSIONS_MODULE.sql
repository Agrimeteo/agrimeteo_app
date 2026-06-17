-- Admin permissions module for AgroSmart
-- Run once in Supabase SQL editor.

create table if not exists public.permissions_catalog (
  code text primary key,
  resource text not null,
  action text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role text not null check (role in ('admin', 'farmer', 'beginner')),
  permission_code text not null references public.permissions_catalog(code) on delete cascade,
  allowed boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (role, permission_code)
);

insert into public.permissions_catalog (code, resource, action, description)
values
  ('crops.create', 'crops', 'create', 'Create crops'),
  ('crops.read', 'crops', 'read', 'Read crops'),
  ('crops.update', 'crops', 'update', 'Update crops'),
  ('crops.delete', 'crops', 'delete', 'Delete crops'),
  ('users.create', 'users', 'create', 'Create users'),
  ('users.read', 'users', 'read', 'Read users'),
  ('users.update', 'users', 'update', 'Update users'),
  ('users.delete', 'users', 'delete', 'Delete users'),
  ('reports.create', 'reports', 'create', 'Create reports'),
  ('reports.read', 'reports', 'read', 'Read reports'),
  ('reports.update', 'reports', 'update', 'Update reports'),
  ('reports.delete', 'reports', 'delete', 'Delete reports'),
  ('settings.create', 'settings', 'create', 'Create settings'),
  ('settings.read', 'settings', 'read', 'Read settings'),
  ('settings.update', 'settings', 'update', 'Update settings'),
  ('settings.delete', 'settings', 'delete', 'Delete settings'),
  ('permissions.read', 'permissions', 'read', 'Read role permissions'),
  ('permissions.update', 'permissions', 'update', 'Update role permissions')
on conflict (code) do update
set resource = excluded.resource,
    action = excluded.action,
    description = excluded.description;

insert into public.role_permissions (role, permission_code, allowed)
values
  ('admin', 'crops.create', true),
  ('admin', 'crops.read', true),
  ('admin', 'crops.update', true),
  ('admin', 'crops.delete', true),
  ('admin', 'users.create', true),
  ('admin', 'users.read', true),
  ('admin', 'users.update', true),
  ('admin', 'users.delete', true),
  ('admin', 'reports.create', true),
  ('admin', 'reports.read', true),
  ('admin', 'reports.update', true),
  ('admin', 'reports.delete', true),
  ('admin', 'settings.create', true),
  ('admin', 'settings.read', true),
  ('admin', 'settings.update', true),
  ('admin', 'settings.delete', true),
  ('admin', 'permissions.read', true),
  ('admin', 'permissions.update', true),
  ('farmer', 'crops.create', true),
  ('farmer', 'crops.read', true),
  ('farmer', 'crops.update', true),
  ('farmer', 'crops.delete', true),
  ('farmer', 'reports.create', true),
  ('farmer', 'reports.read', true),
  ('farmer', 'settings.read', true),
  ('farmer', 'settings.update', true),
  ('beginner', 'crops.create', true),
  ('beginner', 'crops.read', true),
  ('beginner', 'reports.create', true),
  ('beginner', 'reports.read', true),
  ('beginner', 'settings.read', true),
  ('beginner', 'settings.update', true)
on conflict (role, permission_code) do update
set allowed = excluded.allowed,
    updated_at = now();

alter table public.permissions_catalog enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists "Admins can read permissions catalog" on public.permissions_catalog;
create policy "Admins can read permissions catalog"
on public.permissions_catalog
for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can read role permissions" on public.role_permissions;
create policy "Admins can read role permissions"
on public.role_permissions
for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can update role permissions" on public.role_permissions;
create policy "Admins can update role permissions"
on public.role_permissions
for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

grant usage on schema public to service_role;
grant select, insert, update on public.permissions_catalog to service_role;
grant select, insert, update, delete on public.role_permissions to service_role;

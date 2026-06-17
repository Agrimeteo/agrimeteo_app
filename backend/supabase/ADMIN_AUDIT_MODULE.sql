-- Admin audit module for AgroSmart
-- Run once in Supabase SQL editor.

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text,
  actor_name text,
  actor_role text,
  entity_type text not null check (entity_type in ('crop', 'user', 'report')),
  entity_id uuid,
  entity_label text,
  action text not null check (action in ('create', 'update', 'delete')),
  description text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs (created_at desc);
create index if not exists admin_audit_logs_entity_type_idx on public.admin_audit_logs (entity_type);
create index if not exists admin_audit_logs_action_idx on public.admin_audit_logs (action);
create index if not exists admin_audit_logs_actor_user_id_idx on public.admin_audit_logs (actor_user_id);
create index if not exists admin_audit_logs_entity_id_idx on public.admin_audit_logs (entity_id);

alter table public.admin_audit_logs enable row level security;

drop policy if exists "Admins can read audit logs" on public.admin_audit_logs;
create policy "Admins can read audit logs"
on public.admin_audit_logs
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

grant usage on schema public to service_role;
grant select, insert on public.admin_audit_logs to service_role;

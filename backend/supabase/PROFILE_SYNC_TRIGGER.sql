-- Keep public.profiles aligned with auth.users.
-- Run this once in Supabase SQL Editor.

create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb;
  inferred_role text;
begin
  metadata := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  inferred_role := lower(coalesce(metadata->>'role', ''));

  if inferred_role not in ('admin', 'farmer', 'beginner') then
    inferred_role := null;
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    role
  )
  values (
    new.id,
    nullif(metadata->>'full_name', ''),
    new.email,
    inferred_role
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email),
    role = coalesce(excluded.role, public.profiles.role),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_sync_profile on auth.users;

create trigger on_auth_user_created_sync_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user_profile();

-- Optional backfill for users who already exist in auth.users without a profile row.
insert into public.profiles (id, full_name, email, role)
select
  u.id,
  nullif(coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'), ''),
  u.email,
  case
    when lower(coalesce(u.raw_user_meta_data->>'role', '')) in ('admin', 'farmer', 'beginner')
      then lower(u.raw_user_meta_data->>'role')
    else null
  end
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

notify pgrst, 'reload schema';

-- Community module for AgroSmart
-- Safe to run once in Supabase SQL editor.

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  related_crop_id uuid references public.crops(id) on delete set null,
  type text not null check (type in ('question', 'tip', 'experience')),
  title text not null,
  content text not null,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_comment_id uuid references public.community_comments(id) on delete cascade,
  content text not null,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint community_likes_post_user_unique unique (post_id, user_id)
);

create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);
create index if not exists community_posts_type_idx on public.community_posts (type);
create index if not exists community_posts_status_idx on public.community_posts (status);
create index if not exists community_posts_related_crop_idx on public.community_posts (related_crop_id);
create index if not exists community_comments_post_id_idx on public.community_comments (post_id, created_at asc);
create index if not exists community_comments_parent_idx on public.community_comments (parent_comment_id);
create index if not exists community_likes_post_id_idx on public.community_likes (post_id);
create index if not exists community_likes_user_id_idx on public.community_likes (user_id);

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;

drop policy if exists "Community posts are readable" on public.community_posts;
create policy "Community posts are readable"
on public.community_posts
for select
using (status = 'published' or auth.uid() = user_id);

drop policy if exists "Users can create own community posts" on public.community_posts;
create policy "Users can create own community posts"
on public.community_posts
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own community posts" on public.community_posts;
create policy "Users can update own community posts"
on public.community_posts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own community posts" on public.community_posts;
create policy "Users can delete own community posts"
on public.community_posts
for delete
using (auth.uid() = user_id);

drop policy if exists "Community comments are readable" on public.community_comments;
create policy "Community comments are readable"
on public.community_comments
for select
using (
  status = 'published'
  or auth.uid() = user_id
);

drop policy if exists "Users can create own community comments" on public.community_comments;
create policy "Users can create own community comments"
on public.community_comments
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own community comments" on public.community_comments;
create policy "Users can update own community comments"
on public.community_comments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own community comments" on public.community_comments;
create policy "Users can delete own community comments"
on public.community_comments
for delete
using (auth.uid() = user_id);

drop policy if exists "Community likes are readable" on public.community_likes;
create policy "Community likes are readable"
on public.community_likes
for select
using (true);

drop policy if exists "Users can like community posts" on public.community_likes;
create policy "Users can like community posts"
on public.community_likes
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can unlike own community likes" on public.community_likes;
create policy "Users can unlike own community likes"
on public.community_likes
for delete
using (auth.uid() = user_id);

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on public.community_posts to authenticated, service_role;
grant select, insert, update, delete on public.community_comments to authenticated, service_role;
grant select, insert, delete on public.community_likes to authenticated, service_role;

alter publication supabase_realtime add table public.community_posts;
alter publication supabase_realtime add table public.community_comments;
alter publication supabase_realtime add table public.community_likes;


-- Chat history for AgroBot
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  message text not null,
  sender text check (sender in ('user', 'ai')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chat_messages enable row level security;

drop policy if exists "Users can view their own chat history" on public.chat_messages;
create policy "Users can view their own chat history"
on public.chat_messages for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on public.chat_messages to authenticated, service_role;

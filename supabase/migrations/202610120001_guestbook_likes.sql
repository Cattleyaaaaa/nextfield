create table if not exists public.guestbook_message_likes (
  message_id uuid not null references public.guestbook_messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

create index if not exists guestbook_message_likes_message_id_idx
  on public.guestbook_message_likes (message_id);

alter table public.guestbook_message_likes enable row level security;

revoke all on public.guestbook_message_likes from anon, authenticated;
grant insert, delete on public.guestbook_message_likes to authenticated;

drop policy if exists "Users can like as themselves" on public.guestbook_message_likes;
create policy "Users can like as themselves"
  on public.guestbook_message_likes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their own likes" on public.guestbook_message_likes;
create policy "Users can remove their own likes"
  on public.guestbook_message_likes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

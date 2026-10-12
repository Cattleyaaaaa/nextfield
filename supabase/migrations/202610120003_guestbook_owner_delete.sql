-- Visitor deletes use their own JWT and must pass RLS. The server still checks
-- ownership before sending the request; this policy is the database boundary.
grant delete on public.guestbook_messages to authenticated;
grant delete on public.guestbook_replies to authenticated;

drop policy if exists "Users can delete their own guestbook messages" on public.guestbook_messages;
create policy "Users can delete their own guestbook messages"
  on public.guestbook_messages for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own guestbook replies" on public.guestbook_replies;
create policy "Users can delete their own guestbook replies"
  on public.guestbook_replies for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ON CONFLICT (message_id, user_id) needs SELECT on those columns.
-- RLS keeps the authenticated view limited to each visitor's own reactions.
grant select (message_id, user_id) on public.guestbook_message_likes to authenticated;

drop policy if exists "Users can read their own likes" on public.guestbook_message_likes;
create policy "Users can read their own likes"
  on public.guestbook_message_likes for select
  to authenticated
  using ((select auth.uid()) = user_id);

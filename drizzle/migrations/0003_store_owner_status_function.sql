-- Public-safe check: has any owner (admin) account been created yet?
create or replace function public.store_has_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where role = 'admin'
  );
$$;

grant execute on function public.store_has_owner() to anon, authenticated;
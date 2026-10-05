create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  preferences jsonb not null default '{}'::jsonb,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null check (plan in ('free', 'basic', 'pro')),
  status text not null,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.profiles (id, full_name)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name')
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.user_subscriptions enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "Users can read their own subscription"
  on public.user_subscriptions for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke all on public.profiles from anon, authenticated;
revoke all on public.user_subscriptions from anon, authenticated;
grant select (id, full_name, preferences, created_at, updated_at) on public.profiles to authenticated;
grant select (user_id, plan, status, current_period_end, created_at, updated_at) on public.user_subscriptions to authenticated;
grant update (full_name, preferences) on public.profiles to authenticated;

create function public.handle_new_user() returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.touch_profile_updated_at() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_profile_updated_at();

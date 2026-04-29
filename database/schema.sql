create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  position text not null,
  status text not null check (status in ('Applied', 'In Progress', 'Interview', 'Offer', 'Rejected')),
  applied_date date,
  next_step_title text,
  next_step_date timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_next_step_date_idx on public.applications(next_step_date);

alter table public.profiles enable row level security;
alter table public.applications enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Profiles are updateable by owner" on public.profiles;
create policy "Profiles are updateable by owner"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Applications are viewable by owner" on public.applications;
create policy "Applications are viewable by owner"
on public.applications for select
using (auth.uid() = user_id);

drop policy if exists "Applications are insertable by owner" on public.applications;
create policy "Applications are insertable by owner"
on public.applications for insert
with check (auth.uid() = user_id);

drop policy if exists "Applications are updateable by owner" on public.applications;
create policy "Applications are updateable by owner"
on public.applications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Applications are deleteable by owner" on public.applications;
create policy "Applications are deleteable by owner"
on public.applications for delete
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

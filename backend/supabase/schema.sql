-- =========================================================
-- CORE SCHEMA
-- Run this in the Supabase SQL editor before rls_policies.sql
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- profiles: one row per authenticated user
-- ---------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Automatically create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- projects
-- ---------------------------------------------------------
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text default 'active' check (status in ('active', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_projects_user_id on projects(user_id);

-- ---------------------------------------------------------
-- processing_requests
-- ---------------------------------------------------------
create table if not exists processing_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  request_type text not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  input_data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_processing_requests_user_id on processing_requests(user_id);
create index if not exists idx_processing_requests_project_id on processing_requests(project_id);

-- ---------------------------------------------------------
-- results
-- ---------------------------------------------------------
create table if not exists results (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references processing_requests(id) on delete cascade,
  result_data jsonb not null default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_results_request_id on results(request_id);

-- ---------------------------------------------------------
-- activity_logs (optional, lightweight)
-- ---------------------------------------------------------
create table if not exists activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- DOMAIN TABLES
-- Add problem-specific relational tables here after the
-- hackathon problem statement is known, e.g.:
--
-- create table if not exists domain_specific_table_1 (
--   id uuid primary key default uuid_generate_v4(),
--   user_id uuid references auth.users(id) on delete cascade,
--   ... domain columns ...
--   created_at timestamptz default now()
-- );
-- ---------------------------------------------------------

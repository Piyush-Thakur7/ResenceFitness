-- Resence Fitness Database Schema
-- Run this in the Supabase SQL Editor to set up all tables and security policies.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. profiles Table (Holds user metadata linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  dob date,
  height numeric, -- in cm
  weight numeric, -- in kg
  diet_preference text check (diet_preference in ('Veg', 'Non-Veg', 'Vegan', 'Eggetarian')),
  fitness_goal text check (fitness_goal in ('Lean', 'Bulky', 'Athletic', 'Healthy', 'General Fitness')),
  injuries text, -- optional free text limitation
  boxing_or_martial_arts boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile."
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile."
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. weight_history Table (Logs updates every 30 days)
create table public.weight_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  weight numeric not null,
  height numeric not null,
  logged_at date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.weight_history enable row level security;

create policy "Users can manage their own weight history."
  on public.weight_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. workout_plans Table (AI-generated plans)
create table public.workout_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_start_date date not null,
  plan_data jsonb not null, -- exercises, target muscle group, sets/reps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workout_plans enable row level security;

create policy "Users can manage their own workout plans."
  on public.workout_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. workout_logs Table (Checks off daily items)
create table public.workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  exercise_name text not null,
  completed boolean default false not null,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date, exercise_name)
);

alter table public.workout_logs enable row level security;

create policy "Users can manage their own workout logs."
  on public.workout_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. diet_plans Table (AI-generated nutrition goals)
create table public.diet_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_start_date date not null,
  plan_data jsonb not null, -- calories, protein, fat, carbs target
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.diet_plans enable row level security;

create policy "Users can manage their own diet plans."
  on public.diet_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. diet_logs Table (Food entries)
create table public.diet_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  meal_type text check (meal_type in ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  meal_name text not null,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  photo_url text, -- Supabase storage URL
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.diet_logs enable row level security;

create policy "Users can manage their own diet logs."
  on public.diet_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. sleep_logs Table (Track sleep durations)
create table public.sleep_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  recommended_hours numeric not null,
  actual_hours numeric not null,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, date)
);

alter table public.sleep_logs enable row level security;

create policy "Users can manage their own sleep logs."
  on public.sleep_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 8. body_assessments Table (Gemini Vision body assessments)
create table public.body_assessments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  photo_urls text[] not null,
  assessment_report text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.body_assessments enable row level security;

create policy "Users can manage their own body assessments."
  on public.body_assessments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 9. streaks Table (Current streaks & activity tracking)
create table public.streaks (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  current_streak integer default 0 not null,
  last_activity_date date,
  weekly_progress jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.streaks enable row level security;

create policy "Users can manage their own streaks."
  on public.streaks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================================================================
-- Supabase Storage Security Policies for 'body-photos' and 'meal-photos'
-- Note: Make sure to create buckets 'body-photos' and 'meal-photos'
-- inside the Supabase Storage dashboard first, setting them as private.
-- =========================================================================

-- Policies for body-photos bucket
create policy "Allow authenticated upload of body photos" on storage.objects
  for insert with check (
    bucket_id = 'body-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Allow authenticated view of body photos" on storage.objects
  for select using (
    bucket_id = 'body-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Allow authenticated delete of body photos" on storage.objects
  for delete using (
    bucket_id = 'body-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policies for meal-photos bucket
create policy "Allow authenticated upload of meal photos" on storage.objects
  for insert with check (
    bucket_id = 'meal-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Allow authenticated view of meal photos" on storage.objects
  for select using (
    bucket_id = 'meal-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Allow authenticated delete of meal photos" on storage.objects
  for delete using (
    bucket_id = 'meal-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

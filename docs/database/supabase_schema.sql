-- =============================================
-- PawCare Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- ── 1. PROFILES ──────────────────────────────
-- Mirrors auth.users. Created on signup.
create table if not exists public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    full_name   text not null,
    email       text not null,
    phone       text,
    role        text not null default 'customer' check (role in ('customer', 'admin')),
    created_at  timestamptz not null default now()
);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
    insert into public.profiles (id, full_name, email, phone, role)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        new.email,
        coalesce(new.raw_user_meta_data->>'phone', ''),
        'customer'
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ── 2. PETS ──────────────────────────────────
create table if not exists public.pets (
    id          uuid primary key default gen_random_uuid(),
    owner_id    uuid not null references public.profiles(id) on delete cascade,
    name        text not null,
    type        text not null,               -- e.g. Dog, Cat, Rabbit
    breed       text,
    notes       text,                        -- special notes / allergies
    created_at  timestamptz not null default now()
);

-- ── 3. APPOINTMENTS ──────────────────────────
create table if not exists public.appointments (
    id            uuid primary key default gen_random_uuid(),
    pet_id        uuid not null references public.pets(id) on delete cascade,
    owner_id      uuid not null references public.profiles(id) on delete cascade,
    service       text not null,             -- e.g. Full Grooming, Bath & Dry
    scheduled_at  timestamptz not null,
    status        text not null default 'pending'
                    check (status in ('pending','approved','rejected','completed','cancelled','archived')),
    admin_notes   text default '',
    created_at    timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────
alter table public.profiles    enable row level security;
alter table public.pets        enable row level security;
alter table public.appointments enable row level security;

-- profiles
create policy "Users can view own profile"
    on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
    on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
    on public.profiles for select using (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

-- pets
create policy "Owner can manage own pets"
    on public.pets for all using (auth.uid() = owner_id);
create policy "Admins can view all pets"
    on public.pets for select using (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

-- appointments
create policy "Owner can view own appointments"
    on public.appointments for select using (auth.uid() = owner_id);
create policy "Owner can insert appointments"
    on public.appointments for insert with check (auth.uid() = owner_id);
create policy "Owner can delete own appointments"
    on public.appointments for delete using (auth.uid() = owner_id);
create policy "Admins can manage all appointments"
    on public.appointments for all using (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

-- ── INDEXES ───────────────────────────────────
create index if not exists idx_pets_owner          on public.pets(owner_id);
create index if not exists idx_appts_owner         on public.appointments(owner_id);
create index if not exists idx_appts_pet           on public.appointments(pet_id);
create index if not exists idx_appts_scheduled     on public.appointments(scheduled_at);
create index if not exists idx_appts_status        on public.appointments(status);

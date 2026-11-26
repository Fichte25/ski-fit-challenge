create table if not exists public.completions (
  id uuid primary key,
  family text not null,
  person text not null,
  session_idx int not null,
  title text not null,
  completed_at timestamptz not null default now(),
  points int not null default 0,
  effort int not null default 3
);

create index if not exists completions_family_idx on public.completions (family, completed_at);

alter table public.completions enable row level security;

-- Familien-App ohne Login: anonymer Lese-/Schreibzugriff (nur Einheiten-Einträge, keine privaten Daten).
create policy "anon read" on public.completions for select to anon using (true);
create policy "anon insert" on public.completions for insert to anon with check (true);

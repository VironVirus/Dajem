create table if not exists public.dajem_state (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.dajem_state enable row level security;

revoke all on table public.dajem_state from anon;
revoke all on table public.dajem_state from authenticated;

create or replace function public.set_dajem_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists dajem_state_updated_at on public.dajem_state;

create trigger dajem_state_updated_at
before update on public.dajem_state
for each row
execute procedure public.set_dajem_state_updated_at();

insert into public.dajem_state (key, value)
values ('platform', '{}'::jsonb)
on conflict (key) do nothing;

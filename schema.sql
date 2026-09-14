-- Jardim Guanxin — schema da pesquisa
-- Rode no SQL Editor do Supabase.

create table if not exists responses (
  respondent_id       uuid primary key,
  created_at          timestamptz default now(),
  completed           boolean default false,
  last_step           text,
  session_duration_ms int,
  device_type         text,
  viewport            text,
  locale              text,
  referrer            text,
  answers             jsonb,   -- { [question_id]: valor }
  step_timings        jsonb,   -- { [question_id]: ms }
  choice_order        jsonb,   -- { [question_id]: [keys na ordem de toque] }
  rejected            jsonb    -- { [question_id]: [keys vistos e não escolhidos] }
);

alter table responses enable row level security;

-- O site só escreve. A leitura fica restrita ao painel do Supabase.
create policy "anon insert" on responses
  for insert to anon with check (true);

create policy "anon upsert" on responses
  for update to anon using (true);

-- Catálogo das imagens da pesquisa (opcional).
-- Storage: bucket público `research-images`, uma pasta por categoria.
create table if not exists research_images (
  image_id    text primary key,
  category    text not null,   -- spaces | experiences | sensations |
                               -- products | architecture
  title       text,
  description text,
  image_url   text not null,   -- /research-images/<category>/<image_id>.jpg
  tags        text[],
  "order"     int,
  active      boolean default true
);

alter table research_images enable row level security;

create policy "anon read images" on research_images
  for select to anon using (active);

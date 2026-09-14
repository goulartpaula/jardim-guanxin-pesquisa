// Jardim Guanxin — camada de persistência.
// Sem e-mail, sem dados pessoais. Um registro anônimo por respondente.
//
// Supabase (esquema sugerido):
//
//   create table responses (
//     respondent_id       uuid primary key,
//     created_at          timestamptz default now(),
//     completed           boolean default false,
//     last_step           text,
//     session_duration_ms int,
//     device_type         text,
//     viewport            text,
//     locale              text,
//     referrer            text,
//     answers             jsonb,   -- { [question_id]: valor }
//     step_timings        jsonb,   -- { [question_id]: ms }
//     choice_order        jsonb,   -- { [question_id]: [keys na ordem em que foram tocados] }
//     rejected            jsonb    -- { [question_id]: [keys vistos e não escolhidos] }
//   );
//   alter table responses enable row level security;
//   create policy "anon insert" on responses for insert to anon with check (true);
//   create policy "anon update own" on responses for update to anon using (true);
//
//   create table research_images (
//     image_id    text primary key,
//     category    text not null,      -- environment | experiences | sensations |
//                                     -- products | infrastructure | architecture
//     title       text,
//     description text,
//     image_url   text not null,      -- storage: /research-images/<category>/<image_id>.jpg
//     tags        text[],
//     "order"     int,
//     active      boolean default true
//   );
//
// Storage: bucket público `research-images`, uma pasta por categoria.
// Para ligar, defina antes de carregar a página:
//   window.GUANXIN_SUPABASE = { url: 'https://xxx.supabase.co', anonKey: '...' };

const LS_KEY = 'guanxin.response';

function cfg() {
  return typeof window !== 'undefined' ? window.GUANXIN_SUPABASE : null;
}

export function newRespondentId() {
  try { return crypto.randomUUID(); }
  catch { return 'r-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
}

export function deviceType() {
  const w = window.innerWidth;
  if (w < 700) return 'mobile';
  if (w < 1100) return 'tablet';
  return 'desktop';
}

export function saveLocal(record) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(record)); } catch {}
}

export function readLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; }
}

// Upsert no Supabase quando configurado; caso contrário só local.
export async function persist(record) {
  saveLocal(record);
  const c = cfg();
  if (!c || !c.url || !c.anonKey) return { ok: true, mode: 'local' };
  try {
    const res = await fetch(`${c.url}/rest/v1/responses?on_conflict=respondent_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: c.anonKey,
        Authorization: `Bearer ${c.anonKey}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify([record]),
    });
    return { ok: res.ok, mode: 'supabase', status: res.status };
  } catch (e) {
    return { ok: false, mode: 'supabase', error: String(e) };
  }
}

# Jardim Guanxin — Pesquisa

Pesquisa visual de cocriação. Site estático de página única, sem build.
Sete telas, ~2 minutos, anônima, mobile-first.

## Publicar

Suba esta pasta em qualquer hospedagem estática. Não há passo de build.

- **GitHub Pages** — Settings › Pages › Deploy from branch › `main` / root
- **Netlify / Vercel** — arraste a pasta, ou aponte para o repositório sem build command

## Ligar ao Supabase

Enquanto as chaves ficarem em branco, as respostas são gravadas só no navegador.

1. No SQL Editor do Supabase, rode o schema em `schema.sql`.
2. Em `index.html`, no topo, preencha:

```js
window.GUANXIN_SUPABASE = { url: 'https://xxx.supabase.co', anonKey: '...' };
```

A chave `anon public` pode ficar exposta — a proteção vem das policies
(insert e update liberados, select fechado, ninguém lê as respostas pelo site).

## Como os dados chegam

Uma linha por respondente, com upsert a cada tela avançada — então também
se captura quem abandonou no meio (`completed = false`, `last_step`).

| Campo | Conteúdo |
| --- | --- |
| `answers` | escolhas por pergunta, em JSON |
| `choice_order` | ordem em que cada opção foi tocada |
| `rejected` | opções vistas e não escolhidas |
| `step_timings` | milissegundos por tela |
| `session_duration_ms` | duração total |
| `device_type`, `viewport`, `locale` | contexto técnico |

Nenhum dado pessoal é coletado: sem nome, e-mail ou telefone.

### As sete telas

1. `open_wishes` — texto livre: o que gostaria de encontrar / sentir (opcional)
2. `spaces_preferences` — onde passaria mais tempo (até 4, com foto)
3. `experience_preferences` — o que gostaria de experimentar (até 5)
4. `emotion_preferences` — como gostaria de estar se sentindo (até 4)
5. `atmosphere_axes` — 5 eixos de atmosfera (−2 a +2)
6. `product_preferences` — o que levaria para casa (até 5)
7. `architecture_attributes` — atributos da construção (até 3)
8. `closing_phrase` — "um lugar onde eu pudesse…" (uma só)

Cada opção carrega tags semânticas (em `index.html`, na constante `STEPS`)
para permitir cruzamentos na análise posterior.

## Exemplo de análise

```sql
select opt, count(*) as votos
from responses, jsonb_array_elements_text(answers->'spaces_preferences') opt
where completed
group by opt
order by votos desc;
```

## Arquivos

| Arquivo | Papel |
| --- | --- |
| `index.html` | a pesquisa inteira — telas, lógica e textos |
| `guanxin-store.js` | persistência: localStorage + upsert no Supabase |
| `schema.sql` | tabelas e policies do Supabase |
| `support.js` | runtime de renderização |
| `image-slot.js` | placeholders de imagem |
| `_ds/` | design system Classical (tokens e componentes) |
| `uploads/` | vídeo de abertura |

## Pendências

- Vídeo de abertura definitivo: clipe de 10–20s, 1080p, sem áudio e sem
  marca d'água. O arquivo atual é provisório (144p, 5 min, marca de terceiros).
- Fotografias das 12 opções da tela 2.
- Chaves do Supabase.

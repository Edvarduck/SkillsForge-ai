# SkillForge AI

Įgūdžių mokymosi ir karjeros progreso sistema (Vite + Vanilla JS + Supabase + Chart.js + GitHub API).

## Lokaliai

```bash
npm install
cp .env.example .env   # arba sukurk .env ranka
npm run dev
```

`.env` kintamieji:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Deploy

Žiūrėk [DEPLOY.md](./DEPLOY.md) – Vercel + Supabase Auth nustatymai.

## Struktūra

- `src/views/` – 6 tabs (Dashboard, Įgūdžiai, Sesijos, Analitika, Karjeros kelias, Profilis)
- `src/services/` – Supabase, GitHub API
- `src/state/` – aplikacijos state + actions
- `supabase/migrations/` – DB schema

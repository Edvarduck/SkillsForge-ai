# SkillForge AI

Asmeninė karjeros ir įgūdžių mokymosi sistema. Vartotojas nustato karjeros tikslą, registruoja įgūdžius ir mokymosi sesijas, stebi progresą grafikuose, sinchronizuoja GitHub aktyvumą ir gauna personalizuotas mokymosi rekomendacijas.

**Live:** [skillsforge-ai.vercel.app](https://skillsforge-ai.vercel.app)

---

## Technologijos

| Sluoksnis | Stack |
|-----------|--------|
| Build | [Vite](https://vite.dev/) 8 |
| Frontend | Vanilla JavaScript, HTML, CSS |
| Routing | Hash-based SPA |
| Grafikai | [Chart.js](https://www.chartjs.org/) 4 |
| Backend | [Supabase](https://supabase.com/) (PostgreSQL + Auth) |
| Išorinis API | GitHub REST API (vieši endpoint'ai, be token) |
| Deploy | [Vercel](https://vercel.com/) |

> Be React, Vue ir Angular.

---

## Dabartinės funkcijos

### Autentifikacija
- Registracija ir prisijungimas (Supabase Auth)
- Duomenys saugomi debesies DB (ne localStorage prisijungus)

### 6 puslapiai (tabs)
| Tab | Funkcija |
|-----|----------|
| **Dashboard** | Santrauka: valandos, streak, sesijos, rekomendacijos, GitHub |
| **Įgūdžiai** | Pridėti, redaguoti, ištrinti, filtruoti pagal kategoriją / statusą |
| **Sesijos** | Mokymosi sesijų registravimas ir istorija |
| **Analitika** | 3 Chart.js grafikai (laikas, proporcijos, progresas) |
| **Karjeros kelias** | Karjeros Kelio Variklis – rekomendacijos ir savaitės planas |
| **Profilis** | Nustatymai, GitHub sinchronizacija, ženkleliai |

### Integracijos
- **Supabase** – 9 susijusios lentelės su RLS
- **GitHub API** – viešų repozitorijų sinchronizacija į `github_snapshots`
- **Karūnos Brangakmenis** – `path-engine.js` (gap analysis, momentum, GitHub alignment, priority ranking, weekly plan)

### Dar nebaigta
- Badges automatinis skyrimas
- Pilnas UX polish (skeleton loaders, empty states)
- Milestone'ų redagavimas UI

---

## Paleidimas lokaliai

### 1. Priklausomybės

```bash
npm install
```

### 2. Aplinkos kintamieji

Sukurk `.env` failą projekto šaknyje (žr. `.env.example`):

```env
VITE_SUPABASE_URL=https://tavo-projektas.supabase.co
VITE_SUPABASE_ANON_KEY=tavo_anon_key
```

Raktus rasi: Supabase Dashboard → **Project Settings → API** (naudok **anon public**, ne `service_role`).

### 3. Supabase schema (vienkartinis setup)

Paleisk SQL failus Supabase **SQL Editor**:

1. [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
2. [`supabase/migrations/002_grant_permissions.sql`](supabase/migrations/002_grant_permissions.sql)

Detaliau: [`supabase/README.md`](supabase/README.md)

### 4. Dev serveris

```bash
npm run dev
```

Atidaryk naršyklėje rodomą adresą (paprastai `http://localhost:5173`).

### Kitos komandos

```bash
npm run build    # Production build → dist/
npm run preview  # Peržiūrėti build lokaliai
```

---

## Deploy

Instrukcijos: [`DEPLOY.md`](DEPLOY.md)

Production reikalauja Supabase **Authentication → URL Configuration** su `https://skillsforge-ai.vercel.app`.

---

## Dokumentacija

| Failas | Turinys |
|--------|---------|
| [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) | Pilnas kontekstas naujam Cursor pokalbiui |
| [`ARCHITECTURE_PLAN.md`](ARCHITECTURE_PLAN.md) | Architektūros planas (atsiskaitymui) |
| [`DEPLOY.md`](DEPLOY.md) | Vercel deploy žingsniai |

---

## Struktūra (trumpai)

```
src/
├── views/          # 6 tabs + auth
├── state/          # store, actions, selectors
├── services/       # Supabase, GitHub, auth
├── features/       # path-engine.js (Karūnos Brangakmenis)
├── components/     # navbar, toast, charts
└── styles/         # CSS design system

supabase/migrations/   # DB schema + RLS
```

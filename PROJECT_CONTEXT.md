# SkillForge AI – Projekto kontekstas

> Sukurta: 2026-06-08. Skirta naujam Cursor pokalbiui – perskaityti prieš tęsiant darbus.

---

## 1. Kas yra šis projektas

**SkillForge AI** – galutinis WEB aplikacijos atsiskaitymo projektas. Asmeninė karjeros ir įgūdžių mokymosi sistema: vartotojas nustato karjeros tikslą, registruoja įgūdžius ir mokymosi sesijas, stebi progresą grafikuose, sinchronizuoja GitHub aktyvumą ir gauna personalizuotas rekomendacijas.

**Projekto folderis / npm pavadinimas:** `skillforge-ai`  
**GitHub repo:** https://github.com/Edvarduck/SkillsForge-ai  
**Production URL:** https://skillsforge-ai.vercel.app

---

## 2. Technologijos

| Sluoksnis | Technologija |
|-----------|--------------|
| Build | Vite 8 |
| Frontend | **Vanilla JavaScript** (HTML, CSS) – **be React/Vue/Angular** |
| Routing | Hash-based SPA (`#/dashboard`, `#/skills`, …) |
| Grafikai | Chart.js 4 |
| Backend / DB | Supabase (PostgreSQL + Auth) |
| GitHub | Viešas REST API **be token** |
| Deploy | Vercel |

**Env kintamieji** (`.env`, ne commit'inami):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Sąmoningai nenaudojame frontend'e:** `service_role` key, GitHub token.

---

## 3. Dabartinė projekto būsena

### Atlikta (veikia production ir lokaliai)

- [x] Mock UI – 6 tabs, navigacija, CSS design system
- [x] Supabase schema (9 lentelės + RLS + GRANT)
- [x] Auth (registracija / prisijungimas)
- [x] CRUD: įgūdžiai, sesijos, profilis, karjeros tikslas → debesies DB
- [x] 3 Chart.js grafikai (Analitika puslapyje, duomenys iš state/DB)
- [x] GitHub API sinchronizacija + `github_snapshots`
- [x] **Karūnos Brangakmenis** – `path-engine.js` (5 žingsnių algoritmas + savaitės planas)
- [x] Vercel deploy
- [x] Badges automatinis skyrimas (`user_badges`)
- [x] UX polish (skeleton loaders, empty states, retry klaidoms)

### Dar nebaigta
- [ ] Milestone'ų redagavimas UI (tik rodomi, ne redaguojami)
- [ ] `weeklyPlan` / `pathAnalysis` persist į DB (dabar tik aplikacijos state)
- [ ] Naujausios versijos auto-deploy per GitHub → Vercel (reikia patikrinti ar sujungta)

**Pastaba:** [`ARCHITECTURE_PLAN.md`](ARCHITECTURE_PLAN.md) progreso checklist dalinai pasenęs – šis failas tikslesnis.

---

## 4. Failų struktūra ir paskirtis

```
skillforge-ai/
├── index.html                 # Entry HTML
├── package.json               # skillforge-ai, Vite scripts
├── vercel.json                # Vercel build + SPA rewrite
├── .env                       # Supabase credentials (gitignore)
├── .env.example               # Env šablonas
├── README.md                  # Trumpas startas
├── DEPLOY.md                  # Vercel + Supabase Auth URL instrukcijos
├── ARCHITECTURE_PLAN.md       # Pilnas architektūros planas (atsiskaitymui)
├── PROJECT_CONTEXT.md         # Šis failas
│
├── public/                    # Statiniai asset'ai (favicon)
├── supabase/
│   ├── README.md              # Supabase setup SQL instrukcijos
│   └── migrations/
│       ├── 001_initial_schema.sql   # Lentelės, RLS, triggers, seed badges
│       └── 002_grant_permissions.sql # GRANT anon/authenticated (būtina API)
│
└── src/
    ├── main.js                # Bootstrap: initAuth → initApp
    ├── app.js                 # Router, shell, view binding
    │
    ├── router/router.js       # Hash SPA router
    │
    ├── data/mock-data.js      # Pradiniai seed duomenys (initial-state)
    │
    ├── state/
    │   ├── store.js           # State + localStorage (guest režimas)
    │   ├── initial-state.js   # Pradinė state forma
    │   ├── actions.js         # CRUD veiksmai (cloud + local)
    │   ├── auth-state.js      # Auth sesija, loadUserData
    │   └── selectors.js       # Grafikų / dashboard skaičiavimai
    │
    ├── services/
    │   ├── supabase.js        # Supabase client (anon key)
    │   ├── auth.js            # signIn, signUp, signOut
    │   ├── data.js            # Supabase CRUD + fetchUserData
    │   └── github.js          # GitHub viešas API
    │
    ├── features/
    │   ├── path-engine.js     # Karūnos Brangakmenis – pilna logika
    │   └── recommendation-engine.js  # Thin wrapper (suderinamumui)
    │
    ├── views/                 # 6 tabs + auth
    │   ├── auth.js
    │   ├── dashboard.js       # Santrauka (be grafikų)
    │   ├── skills.js
    │   ├── sessions.js
    │   ├── analytics.js       # 3 Chart.js grafikai
    │   ├── career-path.js     # Path engine UI
    │   └── profile.js
    │
    ├── components/
    │   ├── navbar.js
    │   ├── toast.js
    │   └── charts/            # line, doughnut, progress-bar
    │
    ├── utils/                 # formatters, date-helpers, github-helpers, id
    └── styles/                # variables, base, layout, components
```

---

## 5. Kas jau veikia

### Navigacija (6 tabs)
`#/dashboard` · `#/skills` · `#/sessions` · `#/analytics` · `#/career-path` · `#/profile`

### Auth
- Registracija / prisijungimas (`#/auth`)
- Be prisijungimo (kai Supabase sukonfigūruotas) – nukreipia į auth
- Atsijungimas navbar'e
- Profilis auto-kuriamas per Supabase trigger (`handle_new_user`)

### CRUD (prisijungus → Supabase; kitaip → localStorage)
- **Įgūdžiai:** pridėti, redaguoti, ištrinti, filtruoti (kategorija, statusas)
- **Sesijos:** pridėti, ištrinti, istorija
- **Profilis:** vardas, savaitės tikslas, GitHub username
- **Karjeros tikslas:** pavadinimas, data

### Analitika
- Line chart – valandos per savaites
- Doughnut – laikas pagal kategoriją
- Bar chart – įgūdžių lygiai + sesijų skaičius
- Duomenys iš `state` (sesijos + įgūdžiai)

### GitHub API
- Profilis → Sinchronizuoti (vieši endpoint'ai)
- Išsaugo į `github_snapshots`
- Rodo Dashboard + Karjeros kelyje
- Cache: max 1 sync / val. (nebent `force`)

### Karjeros Kelio Variklis (`path-engine.js`)
- Mygtukas „Sugeneruoti kelią“ Karjeros kelias puslapyje
- 5 analizės žingsniai UI
- Rekomendacijos → `recommendations` lentelė
- Savaitės planas (7 dienos) – state'e

### Deploy
- https://skillsforge-ai.vercel.app
- Vercel env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 6. Kas neveikia / mock / ribota

| Funkcija | Būsena |
|----------|--------|
| Badges auto-award | Tik rodomi seed / `user_badges` iš DB, automatinio skyrimo nėra |
| Milestone'ų redagavimas | Tik rodomi sąraše, checkbox / CRUD nėra |
| `weeklyPlan`, `pathAnalysis` | Generuojami, bet **neišsaugomi DB** – dingsta po perkrovimo |
| GitHub privatūs repo | Nematomi (viešas API be token) |
| Pilni skeleton loaders | Tik toast + mygtukų loading |
| Guest režimas su Supabase | Jei `.env` sukonfigūruotas – **reikalauja auth**, localStorage nenaudojamas |
| `mock-data.js` | Naudojamas tik `initial-state.js` pradiniam seed; ne pagrindinis runtime šaltinis prisijungus |

---

## 7. Svarbūs architektūriniai sprendimai

1. **Vanilla JS** – jokio React/Vue/Angular (atsiskaitymo reikalavimas).
2. **Hash router** – ne history API; deploy friendly.
3. **Dashboard be grafikų** – visi 3 grafikai tik **Analitika** puslapyje.
4. **State sluoksnis:** `views → actions.js → services/data.js → Supabase`; `store.js` – UI state.
5. **Dual mode:** cloud (auth + Supabase) vs local (localStorage) – cloud aktyvuojamas kai yra `.env`.
6. **GitHub be token** – tik vieši endpoint'ai; UI aiškiai paaiškina private repo limitą.
7. **Path engine** atskiras modulis (`path-engine.js`) – gryna logika, view tik renderina.
8. **Supabase RLS** – vartotojas mato tik savo duomenis; `badges` – viešas SELECT.
9. **002_grant_permissions.sql** – būtinas paleisti po `001`, kitaip API grąžina `permission denied`.
10. **Projekto pavadinimas** – `skillforge-ai` (ne SkillsForge).

---

## 8. Cursor taisyklės / kodo stilius

Projekte nėra `.cursor/rules/` failų – galioja vartotojo Cursor taisyklės:

- **Atsakymai lietuviškai**, mokymosi tikslu, paprasta kalba.
- **Minimalus diff** – nekeisti nesusijusio kodo.
- **Be over-engineering** – paprasčiausias teisingas sprendimas.
- **Atitikti esamą stilių** – ES modules, `escapeHtml` vartotojo įvedimui, toast pranešimai.
- **Git commit** – tik kai vartotojas aiškiai prašo.
- **Nenaudoti** React/Vue/Angular, service_role, GitHub token frontend'e.
- **Failų citatos** – formatas: `startLine:endLine:filepath`.

---

## 9. Artimiausi žingsniai (pagal planą)

1. **Redeploy** į Vercel su naujausiais pakeitimais (badges + UX polish)
2. **GitHub → Vercel auto-deploy** – patikrinti / sutvarkyti
4. **Git:** commit'inti nepush'intus deploy / path engine failus (jei reikia – reikia patikrinti `git status`)
5. **Supabase production Auth URL** – įsitikinti kad `https://skillsforge-ai.vercel.app` nustatytas Site URL

---

## 10. Ką naujas Cursor chat turi žinoti prieš tęsiant

1. **Perskaityti šį failą** + [`ARCHITECTURE_PLAN.md`](ARCHITECTURE_PLAN.md) detalesnei schemai.
2. **Paleisti lokaliai:** `npm install` → sukurti `.env` → `npm run dev`.
3. **Supabase:** SQL jau paleistas (`001` + `002`); Auth email confirm nustatymas – reikia patikrinti Dashboard'e.
4. **Testuoti su prisijungimu** – be auth CRUD neįrašo į DB (kai `.env` yra).
5. **Path engine** – pagrindinė sudėtinga funkcija jau `src/features/path-engine.js`; neperrašyti į paprastą mock.
6. **Nedubliuoti** `recommendation-engine.js` logikos – ji deleguoja į `path-engine.js`.
7. **`actions.js`** – vieta CRUD plėtimui; `data.js` – Supabase queries.
8. **Production deploy:** `npx vercel deploy --prod --scope edvard-s-projects2` arba per Vercel dashboard.
9. **Vercel ↔ GitHub auto-deploy** – setup metu buvo klaida dėl GitHub connection; rankinis CLI deploy veikė.
10. Jei keiči `.env` arba Supabase – perkrauk `npm run dev`.

---

## Greitos komandos

```bash
npm run dev          # Lokaliai (localhost:5173)
npm run build        # Production build
npm run preview      # Peržiūrėti dist

# Deploy (jei Vercel CLI prisijungęs)
npx vercel deploy --prod --scope edvard-s-projects2
```

## DB lentelės (Supabase)

`profiles` · `career_goals` · `milestones` · `skills` · `learning_sessions` · `badges` · `user_badges` · `github_snapshots` · `recommendations`

---

*Paskutinis žinomas commit:* `d0c88cb` – Kelio generavimas

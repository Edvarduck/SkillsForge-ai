# Supabase setup – SkillForge AI

## 1. Sukurk Supabase projektą

1. Eik į [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → pasirink pavadinimą, slaptažodį, regioną
3. Palauk, kol projektas pasiruoš (~1–2 min.)

## 2. Paleisk SQL schemą

1. Supabase Dashboard → **SQL Editor**
2. Spausk **New query**
3. Nukopijuok visą `migrations/001_initial_schema.sql` turinį
4. Spausk **Run** (arba Ctrl/Cmd + Enter)
5. Turėtum matyti „Success. No rows returned“

> Jei `001` jau paleistas anksčiau be GRANT dalių, paleisk ir `002_grant_permissions.sql`.

## 3. Patikrink lenteles

1. Dashboard → **Table Editor**
2. Turėtum matyti lenteles: `profiles`, `career_goals`, `milestones`, `skills`, `learning_sessions`, `badges`, `user_badges`, `github_snapshots`, `recommendations`
3. `badges` lentelėje turėtų būti 4 pradiniai ženkleliai

## 4. Gauk API raktus

1. Dashboard → **Project Settings** → **API**
2. Nukopijuok:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
3. **Nenaudok** `service_role` key frontend'e

## 5. Sukurk .env failą projekte

```bash
cp .env.example .env
```

Užpildyk tikrus URL ir anon key reikšmes `.env` faile.

## 6. Perkrauk dev serverį

```bash
npm run dev
```

> Kol kas aplikacija vis dar naudoja localStorage. Supabase client paruoštas `src/services/supabase.js` – bus prijungtas kitame etape.

## Troubleshooting

- **RLS klaidos:** įsitikink, kad vartotojas prisijungęs (`auth.uid()` ne null)
- **Trigger klaida:** paleisk visą SQL failą iš naujo tik tuščiam projektui
- **CORS / Auth redirect:** vėliau Auth etape pridėk `http://localhost:5173` į **Authentication → URL Configuration → Site URL / Redirect URLs**

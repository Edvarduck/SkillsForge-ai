# SkillForge AI – Deploy į Vercel

## 1. GitHub (jau paruošta)

Repo: `https://github.com/Edvarduck/SkillsForge-ai`

Jei dar nepushinta:
```bash
git push origin main
```

## 2. Vercel projektas

1. Eik į [vercel.com](https://vercel.com) → prisijunk (GitHub account)
2. **Add New → Project**
3. Importuok `Edvarduck/SkillsForge-ai`
4. Framework: **Vite** (turėtų aptikti automatiškai)
5. Build Command: `npm run build`
6. Output Directory: `dist`

## 2b. Auto-deploy (GitHub → Vercel)

Projekte yra workflow: `.github/workflows/vercel-deploy.yml`  
Kiekvienas `push` į `main` automatiškai deploy'ina į production.

### A variantas – GitHub Actions (rekomenduojama, jei Vercel Git neprisijungia)

1. Sukurk Vercel token: [vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create**
2. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Reikšmė |
|--------|---------|
| `VERCEL_TOKEN` | Vercel token iš 1 žingsnio |
| `VERCEL_ORG_ID` | `team_T4jYmwn6clkEOxgS8giL2XH9` |
| `VERCEL_PROJECT_ID` | `prj_NjvC56RrBnSTzPD0L5Bv2JjDgtL4` |
| `VITE_SUPABASE_URL` | Tas pats kaip Vercel env |
| `VITE_SUPABASE_ANON_KEY` | Tas pats kaip Vercel env |

3. Push į `main` – GitHub Actions paleis deploy automatiškai
4. Stebėk: GitHub → **Actions** → workflow „Deploy to Vercel“

Greita komanda (interaktyviai įvedi tik `VERCEL_TOKEN` ir Supabase reikšmes):

```bash
gh secret set VERCEL_ORG_ID --body "team_T4jYmwn6clkEOxgS8giL2XH9"
gh secret set VERCEL_PROJECT_ID --body "prj_NjvC56RrBnSTzPD0L5Bv2JjDgtL4"
gh secret set VERCEL_TOKEN
gh secret set VITE_SUPABASE_URL
gh secret set VITE_SUPABASE_ANON_KEY
git push origin main
```

### B variantas – Vercel Git integracija (native)

Jei nori deploy be GitHub Actions:

1. Vercel → **Account Settings → Authentication** → prijunk **GitHub**
2. Projekte `skillsforge-ai` → **Settings → Git** → Connect `Edvarduck/SkillsForge-ai`
3. Arba CLI (po GitHub prijungimo):

```bash
npx vercel git connect https://github.com/Edvarduck/SkillsForge-ai.git --scope edvard-s-projects2
```

> Jei gauni klaidą „add a Login Connection to your GitHub account“ – pirmiausia atlik 1 žingsnį B variante.

## 3. Environment Variables (Vercel)

Project → **Settings → Environment Variables** – pridėk:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | tavo Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | tavo Supabase **anon public** key |

> Naudok **anon** key, ne `service_role`.

Po pridėjimo: **Redeploy** projektą.

## 4. Supabase Auth (būtina production)

Supabase Dashboard → **Authentication → URL Configuration**:

| Laukas | Reikšmė |
|--------|---------|
| **Site URL** | `https://skillsforge-ai.vercel.app` |
| **Redirect URLs** | `https://skillsforge-ai.vercel.app/**` |

Išsaugok. Be to prisijungimas production'e gali neveikti.

## Production URL

**https://skillsforge-ai.vercel.app**

## 5. Patikrinimas

1. Atidaryk [skillsforge-ai.vercel.app](https://skillsforge-ai.vercel.app)
2. Registruokis / prisijunk
3. Pridėk įgūdį ir sesiją
4. Sinchronizuok GitHub Profilyje
5. Supabase Table Editor – patikrink naujus įrašus

## Troubleshooting

| Problema | Sprendimas |
|----------|------------|
| Balta puslapis | Patikrink Vercel build logs; ar env kintamieji nustatyti |
| Auth neveikia | Atnaujink Supabase Site URL ir Redirect URLs |
| Duomenų nėra | Prisijunk – cloud režimas reikalauja auth |
| GitHub sync klaida | Viešas API limitas – normalu be token |

## Alternatyva: Netlify

1. [netlify.com](https://netlify.com) → Import from Git
2. Build: `npm run build`, Publish: `dist`
3. Env kintamieji – tie patys `VITE_*`
4. Supabase Auth URL – tas pats Vercel principas

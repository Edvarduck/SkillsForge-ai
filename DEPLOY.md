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

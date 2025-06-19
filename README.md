# AutoVad - Marketplace de Mașini

AutoVad este un marketplace modern pentru cumpărarea și vânzarea mașinilor în România, construit cu Next.js 15, TypeScript și Tailwind CSS.

## 🚀 Caracteristici

### Landing Page
- **Colectare Email-uri**: Formulare pentru notificări la lansare
- **Design Modern**: UI/UX cu glassmorphism și animații
- **Responsive**: Optimizat pentru toate dispozitivele
- **SEO Optimizat**: Meta tags și structură semantică

### Marketplace (Site Actual)
- **Feed de Mașini**: Layout 9:16 cu CarPost componente
- **Galerie Foto HD**: Viewer cu zoom, navigare și thumbnails
- **Căutare Avansată**: Filtrare după marcă, model, preț
- **Profil Utilizator**: Dashboard cu statistici
- **API REST**: Endpoint-uri pentru CRUD operații

### Funcționalități Noi (Planificate)
- **AI Chat**: Comunicare directă cu vânzătorul
- **Verificare Istoric**: Transparență completă
- **Plăți Securizate**: Sistem escrow
- **Asigurări Integrate**: Oferte personalizate

## 🛠️ Tehnologii

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 📁 Structura Proiectului

```
web/
├── src/
│   ├── app/                 # App Router (Next.js 15)
│   │   ├── page.tsx         # Landing Page
│   │   ├── test/            # Marketplace (Site Actual)
│   │   └── api/             # API Routes
│   ├── components/          # React Components
│   │   ├── ui/              # shadcn/ui Components
│   │   ├── CarPost.tsx      # Componenta principală mașină
│   │   ├── ImageViewer.tsx  # Galerie foto cu zoom
│   │   └── Navigation.tsx   # Navigare
│   ├── services/            # API Services
│   ├── types/               # TypeScript Types
│   └── lib/                 # Utilities
├── public/                  # Static Assets
└── supabase/                # Database Migrations
```

## 🚀 Deployment

### Branch-uri
- `main` - Production (deploy automat pe Vercel)
- `web-dev` - Development (preview deployments)
- `web-prod` - Staging (testare înainte de production)

### GitHub Actions
- **Push pe `web-dev`**: Deploy preview pe Vercel
- **Push pe `web-prod`**: Deploy staging
- **Merge în `main`**: Deploy production automat

### Variabile de Mediu
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_api_url
```

## 🏃‍♂️ Dezvoltare Locală

```bash
# Instalare dependențe
npm install

# Dezvoltare locală
npm run dev

# Build production
npm run build

# Linting
npm run lint
```

## 📊 Statistici

- **10,000+** Mașini disponibile
- **50,000+** Utilizatori activi  
- **98%** Satisfacție clienți
- **< 2s** Timp de încărcare

## 🔗 Link-uri

- **Production**: https://autovad-2uj0y9vz2-mihails-projects-18afe1f5.vercel.app
- **Landing Page**: `/` - Colectare email-uri
- **Marketplace**: `/test` - Site-ul actual (link ascuns)

## 👥 Echipa

- **Mihail Marincea** - Full Stack Developer
- **AutoVad Team** - Product & Design

## 📄 Licență

© 2024 AutoVad. Toate drepturile rezervate.

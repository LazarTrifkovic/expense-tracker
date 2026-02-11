# Expense Tracker

Aplikacija za pracenje i deljenje troskova u grupama. Idealna za putovanja, cimere, projekte i druge situacije gde vise ljudi deli troskove.

## Funkcionalnosti

- **Autentifikacija** - Registracija i prijava korisnika sa JWT tokenima
- **Grupe** - Kreiranje grupa za putovanja, stanove, projekte
- **Troskovi** - Dodavanje troskova sa fleksibilnom podelom (jednako, nejednako, procentualno)
- **Automatski obracun** - Izracunavanje ko kome duguje
- **Poravnanja** - Evidencija uplata i izmirenja dugova
- **Specijalne uloge** - Podrska za BOSS (placa sve) i TATA (preuzima dugove)
- **Vizualizacija** - Graficki prikaz troskova po kategorijama

## Tehnologije

### Frontend
- **Next.js 14** - React framework sa App Router
- **TypeScript** - Tipiziran JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Pristupacne UI komponente
- **Recharts** - Biblioteka za grafikone
- **React Hook Form** - Upravljanje formama
- **Zod** - Validacija podataka

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma ORM** - Type-safe pristup bazi
- **PostgreSQL** - Relaciona baza podataka
- **NextAuth.js** - Autentifikacija
- **bcryptjs** - Hesiranje lozinki

### DevOps
- **Docker** - Kontejnerizacija
- **GitHub Actions** - CI/CD pipeline
- **Vercel** - Deployment platformma

## Instalacija

### Preduslovi
- Node.js 18+
- Docker i Docker Compose
- Git

### Koraci

1. **Kloniraj repozitorijum**
```bash
git clone https://github.com/elab-development/internet-tehnologije-2025-app_expense_tracker_2022_0365.git
cd expense-tracker
```

2. **Instaliraj dependencies**
```bash
npm install
```

3. **Pokreni bazu podataka**
```bash
docker-compose up -d db
```

4. **Podesi environment varijable**
```bash
cp .env.example .env
# Izmeni .env sa svojim vrednostima
```

5. **Pokreni migracije i seed**
```bash
npm run db:push
npm run db:seed
```

6. **Pokreni development server**
```bash
npm run dev
```

Aplikacija ce biti dostupna na http://localhost:3000

## Docker

Za pokretanje cele aplikacije u Docker-u:

```bash
docker-compose up
```

Ovo ce pokrenuti:
- PostgreSQL bazu na portu 5432
- Next.js aplikaciju na portu 3000

## API Dokumentacija

Swagger dokumentacija je dostupna na `/api-docs` kada je aplikacija pokrenuta.

### Glavne API rute

| Metoda | Ruta | Opis |
|--------|------|------|
| POST | /api/auth/register | Registracija korisnika |
| POST | /api/auth/signin | Prijava korisnika |
| GET | /api/groups | Lista grupa korisnika |
| POST | /api/groups | Kreiranje nove grupe |
| GET | /api/groups/:id | Detalji grupe |
| POST | /api/groups/:id/expenses | Dodavanje troska |
| GET | /api/groups/:id/balances | Stanje dugovanja |
| POST | /api/settlements | Kreiranje poravnanja |
| GET | /api/dashboard | Dashboard statistike |

## Struktura projekta

```
expense-tracker/
├── prisma/              # Baza podataka
│   ├── schema.prisma    # Sema baze
│   ├── migrations/      # Migracije
│   └── seed.ts          # Test podaci
├── src/
│   ├── app/             # Next.js stranice i API
│   │   ├── (auth)/      # Login/Register
│   │   ├── (dashboard)/ # Dashboard stranice
│   │   ├── api/         # API rute
│   │   └── api-docs/    # Swagger UI
│   ├── components/      # React komponente
│   │   ├── ui/          # UI komponente
│   │   ├── layout/      # Layout komponente
│   │   └── ...          # Feature komponente
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility funkcije
│   └── types/           # TypeScript tipovi
├── Dockerfile           # Docker konfiguracija
├── docker-compose.yml   # Docker Compose
└── package.json         # NPM konfiguracija
```

## Modeli baze podataka

- **User** - Korisnici (uloge: USER, BOSS, TATA, SYSTEM_ADMIN)
- **Group** - Grupe (tipovi: APARTMENT, TRIP, PROJECT, OTHER)
- **GroupMember** - Clanstvo u grupama
- **Expense** - Troskovi
- **ExpenseSplit** - Podela troskova
- **Settlement** - Poravnanja
- **Invitation** - Pozivnice

## Autori

- Lazar Trifkovic - 2022/0365

## Licenca

MIT License

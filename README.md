# Expense Tracker - Aplikacija za Podelu Troškova

Moderna web aplikacija za praćenje i podelu troškova unutar grupa, slična Splitwise aplikaciji. Razvijena korišćenjem Next.js 14, TypeScript, Prisma i PostgreSQL.

## Sadržaj

- [Funkcionalnosti](#funkcionalnosti)
- [Slike Ekrana](#slike-ekrana)
- [Tehnologije](#tehnologije)
- [Arhitektura](#arhitektura)
- [Instalacija](#instalacija)
- [Baza Podataka](#baza-podataka)
- [API Dokumentacija](#api-dokumentacija)
- [Struktura Projekta](#struktura-projekta)

---

## Funkcionalnosti

### Autentifikacija
- Registracija korisnika sa validacijom
- Prijava korišćenjem email/password
- JWT sesije sa NextAuth.js
- Zaštićene rute (middleware)

### Upravljanje Grupama
- Kreiranje grupa (Stan, Putovanje, Projekat, Ostalo)
- Pozivanje članova putem email-a
- Uloge: Admin i Član
- Podrška za različite valute

### Praćenje Troškova
- Dodavanje troškova sa kategorijama (Hrana, Transport, Režije, Zabava, Kupovina, Ostalo)
- Fleksibilna podela: Jednako, Nejednako, Procenat, Delovi
- Automatski proračun dugovanja

### Poravnanja
- Beleženje uplata između članova
- Potvrda prijema uplate
- Optimizovani predlozi za minimalan broj transakcija

### Dashboard
- Pregled ukupnog stanja (koliko duguješ / koliko ti duguju)
- Nedavni troškovi
- Brzi pristup grupama

---

## Slike Ekrana

### Početna Stranica
![Početna stranica](./docs/screenshots/landing.png)
*Početna stranica sa pregledom funkcionalnosti aplikacije*

### Prijava
![Prijava](./docs/screenshots/login.png)
*Forma za prijavu korisnika*

### Registracija
![Registracija](./docs/screenshots/register.png)
*Forma za registraciju novog korisnika*

### Dashboard
![Dashboard](./docs/screenshots/dashboard.png)
*Kontrolna tabla sa pregledom stanja i nedavnih aktivnosti*

### Lista Grupa
![Grupe](./docs/screenshots/groups.png)
*Pregled svih grupa korisnika*

### Detalji Grupe
![Detalji grupe](./docs/screenshots/group-details.png)
*Detaljan prikaz grupe sa troškovima, članovima i bilansima*

### Dodavanje Troška
![Novi trošak](./docs/screenshots/expense-dialog.png)
*Modal za dodavanje novog troška sa opcijama podele*

### Poravnanje Dugovanja
![Poravnanje](./docs/screenshots/settlement-dialog.png)
*Modal za beleženje uplate između članova*

---

## Tehnologije

### Frontend
| Tehnologija | Verzija | Opis |
|-------------|---------|------|
| Next.js | 14.2.21 | React framework sa App Router |
| React | 18.3.1 | UI biblioteka |
| TypeScript | 5.7.2 | Tipiziran JavaScript |
| Tailwind CSS | 3.4.17 | Utility-first CSS framework |
| Radix UI | latest | Pristupačne UI komponente |
| React Hook Form | 7.54.2 | Upravljanje formama |
| Zod | 3.24.1 | Validacija šema |

### Backend
| Tehnologija | Verzija | Opis |
|-------------|---------|------|
| Next.js API Routes | 14 | Serverless API |
| NextAuth.js | 4.24.11 | Autentifikacija |
| Prisma | 6.1.0 | ORM za bazu podataka |
| PostgreSQL | 15+ | Relaciona baza podataka |
| bcryptjs | 2.4.3 | Heširanje lozinki |

### Alati
| Alat | Opis |
|------|------|
| Docker | Kontejnerizacija PostgreSQL |
| ESLint | Linting koda |
| Prisma Studio | GUI za bazu podataka |

---

## Arhitektura

### Struktura Aplikacije (App Router)

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Javne stranice
│   │   ├── login/           # Prijava
│   │   └── register/        # Registracija
│   ├── (dashboard)/         # Zaštićene stranice
│   │   ├── dashboard/       # Kontrolna tabla
│   │   ├── groups/          # Upravljanje grupama
│   │   └── settings/        # Podešavanja
│   ├── api/                 # API rute
│   │   ├── auth/            # Autentifikacija
│   │   ├── groups/          # CRUD za grupe
│   │   ├── dashboard/       # Dashboard podaci
│   │   └── settlements/     # Poravnanja
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing stranica
├── components/              # React komponente
│   ├── ui/                  # Reusable UI (Button, Card, Dialog...)
│   ├── layout/              # Navbar, Sidebar
│   ├── expenses/            # Expense komponente
│   ├── groups/              # Group komponente
│   └── settlements/         # Settlement komponente
├── lib/                     # Utility funkcije
│   ├── auth.ts              # NextAuth konfiguracija
│   ├── prisma.ts            # Prisma klijent
│   ├── balance.ts           # Algoritam za balans
│   ├── validators.ts        # Zod šeme
│   └── utils.ts             # Helper funkcije
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript tipovi
└── middleware.ts            # Route protection
```

### Dijagram Baze Podataka

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Group    │       │  Invitation │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──┐   │ id          │◄──────│ groupId     │
│ email       │   │   │ name        │       │ email       │
│ password    │   │   │ description │       │ token       │
│ name        │   │   │ type        │       │ status      │
│ role        │   │   │ currency    │       │ expiresAt   │
│ isActive    │   │   │ createdById │───┐   └─────────────┘
│ lastLoginAt │   │   └─────────────┘   │
└─────────────┘   │          │          │
       │          │          │          │
       │          │          ▼          │
       │          │   ┌─────────────┐   │
       │          │   │ GroupMember │   │
       │          │   ├─────────────┤   │
       │          └───│ userId      │   │
       │              │ groupId     │◄──┘
       │              │ role        │
       │              └─────────────┘
       │
       │          ┌─────────────┐       ┌─────────────┐
       │          │   Expense   │       │ExpenseSplit │
       │          ├─────────────┤       ├─────────────┤
       └──────────│ paidById    │       │ expenseId   │───┐
                  │ groupId     │◄──────│ userId      │   │
                  │ title       │       │ amount      │   │
                  │ amount      │       │ percentage  │   │
                  │ category    │       └─────────────┘   │
                  │ splitType   │                         │
                  └─────────────┘◄────────────────────────┘

       ┌─────────────┐
       │ Settlement  │
       ├─────────────┤
       │ groupId     │
       │ payerId     │───► User
       │ receiverId  │───► User
       │ amount      │
       │ status      │
       │ notes       │
       └─────────────┘
```

---

## Instalacija

### Preduslovi

- Node.js 18+
- Docker (za PostgreSQL)
- npm ili yarn

### Koraci

1. **Kloniraj repozitorijum**
   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. **Instaliraj zavisnosti**
   ```bash
   npm install
   ```

3. **Pokreni PostgreSQL**
   ```bash
   docker-compose up -d
   ```

4. **Konfiguriši environment varijable**
   ```bash
   cp .env.example .env
   # Uredi .env fajl sa svojim podešavanjima
   ```

   Potrebne varijable:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/expense_tracker"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. **Pokreni migracije**
   ```bash
   npm run db:migrate
   ```

6. **Generiši Prisma klijent**
   ```bash
   npm run db:generate
   ```

7. **Pokreni development server**
   ```bash
   npm run dev
   ```

8. **Otvori aplikaciju**
   ```
   http://localhost:3000
   ```

### Korisne Komande

| Komanda | Opis |
|---------|------|
| `npm run dev` | Pokreni development server |
| `npm run build` | Production build |
| `npm run lint` | Proveri kod sa ESLint |
| `npm run db:generate` | Generiši Prisma klijent |
| `npm run db:push` | Push šeme u bazu (bez migracija) |
| `npm run db:migrate` | Kreiraj i pokreni migracije |
| `npm run db:studio` | Otvori Prisma Studio |

---

## Baza Podataka

### Modeli

| Model | Opis |
|-------|------|
| `User` | Korisnici aplikacije |
| `Group` | Grupe za podelu troškova |
| `GroupMember` | Članstvo u grupama sa ulogama |
| `Expense` | Troškovi |
| `ExpenseSplit` | Podela troška po članovima |
| `Settlement` | Poravnanja/uplate |
| `Invitation` | Pozivnice za grupe |

### Uloge Korisnika

| Uloga | Nivo | Opis |
|-------|------|------|
| `USER` | Sistem | Običan korisnik |
| `SYSTEM_ADMIN` | Sistem | Administrator sistema |
| `MEMBER` | Grupa | Član grupe |
| `ADMIN` | Grupa | Administrator grupe |

### Migracije

Projekat sadrži sledeće tipove migracija:

1. **Inicijalna migracija** (`20251223161820_npm_run_dev`)
   - `CREATE TABLE` - Kreiranje svih tabela
   - `CREATE ENUM` - Kreiranje enum tipova
   - `ADD FOREIGN KEY` - Dodavanje stranih ključeva

2. **Dodavanje kolona** (`20251224100000_add_columns`)
   - `ADD COLUMN` - Dodavanje novih kolona (isActive, lastLoginAt, currency, notes)

3. **Izmene i indeksi** (`20251224110000_alter_columns_add_indexes`)
   - `CREATE INDEX` - Kreiranje indeksa za performanse
   - `ALTER COLUMN` - Izmena default vrednosti
   - `ADD CONSTRAINT` - Dodavanje check constraint-a

---

## API Dokumentacija

### Autentifikacija

| Metoda | Ruta | Opis |
|--------|------|------|
| `POST` | `/api/auth/register` | Registracija korisnika |
| `POST` | `/api/auth/[...nextauth]` | NextAuth handler (login/logout) |

### Grupe

| Metoda | Ruta | Opis |
|--------|------|------|
| `GET` | `/api/groups` | Lista svih grupa korisnika |
| `POST` | `/api/groups` | Kreiranje nove grupe |
| `GET` | `/api/groups/[groupId]` | Detalji grupe |
| `PATCH` | `/api/groups/[groupId]` | Ažuriranje grupe |
| `DELETE` | `/api/groups/[groupId]` | Brisanje grupe |
| `POST` | `/api/groups/[groupId]/invite` | Pozivanje člana |

### Troškovi

| Metoda | Ruta | Opis |
|--------|------|------|
| `GET` | `/api/groups/[groupId]/expenses` | Lista troškova grupe |
| `POST` | `/api/groups/[groupId]/expenses` | Dodavanje troška |

### Poravnanja

| Metoda | Ruta | Opis |
|--------|------|------|
| `GET` | `/api/groups/[groupId]/settlements` | Lista poravnanja |
| `POST` | `/api/groups/[groupId]/settlements` | Kreiranje poravnanja |
| `PATCH` | `/api/settlements/[settlementId]/confirm` | Potvrda poravnanja |

### Bilans

| Metoda | Ruta | Opis |
|--------|------|------|
| `GET` | `/api/groups/[groupId]/balances` | Izračunati bilansi članova |

### Dashboard

| Metoda | Ruta | Opis |
|--------|------|------|
| `GET` | `/api/dashboard` | Sumarni podaci za dashboard |

### Format Odgovora

**Uspeh:**
```json
{
  "id": "...",
  "name": "...",
  ...
}
```

**Greška:**
```json
{
  "error": "Opis greške"
}
```

### HTTP Status Kodovi

| Kod | Opis |
|-----|------|
| `200` | OK |
| `201` | Kreirano |
| `400` | Loš zahtev |
| `401` | Neautorizovan |
| `403` | Zabranjeno |
| `404` | Nije pronađeno |
| `500` | Serverska greška |

---

## Struktura Projekta

```
expense-tracker/
├── prisma/
│   ├── schema.prisma        # Šema baze podataka
│   └── migrations/          # SQL migracije
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React komponente
│   ├── lib/                 # Utility funkcije
│   ├── hooks/               # Custom hooks
│   ├── types/               # TypeScript tipovi
│   └── middleware.ts        # Route zaštita
├── public/                  # Statički fajlovi
├── docs/
│   └── screenshots/         # Slike ekrana
├── .env                     # Environment varijable
├── docker-compose.yml       # Docker konfiguracija
├── package.json             # Zavisnosti
├── tailwind.config.ts       # Tailwind konfiguracija
└── tsconfig.json            # TypeScript konfiguracija
```

---

## Licenca

MIT License

---

## Autor

Razvijeno kao projekat za kurs web programiranja.

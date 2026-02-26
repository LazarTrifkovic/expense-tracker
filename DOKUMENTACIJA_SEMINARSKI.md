# Dopuna dokumentacije za seminarski rad

## Napomena
Ovo su nove sekcije koje se dodaju na kraj postojeće dokumentacije (posle sekcije 4.3). Takođe treba ažurirati sekcije 3.4, 3.5 i dodati redove u tabele u 4.3. Ažurirati Sadržaj na početku dokumenta.

---

## 3.4. Integracije (ZAMENI STARI TEKST)

**Exchange Rate API (exchangerate-api.com)**

Besplatni REST API za dobijanje kursne liste i konverziju valuta u realnom vremenu. Aplikacija koristi ovaj API za podršku više valuta (RSD, EUR, USD, GBP, CHF, BAM, HRK) i automatsku konverziju iznosa troškova. API se poziva sa backend strane putem Next.js API ruta, čime se onemogućava izlaganje API ključeva na klijentskoj strani.

**Google Maps Geocoding API**

Google Maps API se koristi za pretvaranje naziva grada u geografske koordinate (geocoding). Ovo omogućava prikaz lokacija putovanja za grupe tipa TRIP. Implementiran je fallback mehanizam sa 12 predefinisanih popularnih destinacija (Pariz, Amsterdam, Rim, London, Beč, Barcelona, Prag, Berlin, Budimpešta, Beograd, Novi Sad, Niš) koji omogućava rad aplikacije i bez API ključa.

**Recharts**

Biblioteka za vizualizaciju podataka bazirana na React-u i D3.js-u. Koristi se za prikaz grafičkih statistika na dashboard-u: Pie chart za distribuciju troškova po kategorijama i Bar chart za poređenje troškova po grupama.

**Docker**

Kontejnerizacija aplikacije za konzistentan development i production environment. Docker Compose omogućava pokretanje kompletne aplikacije (Next.js + PostgreSQL) jednom komandom.

**Swagger (OpenAPI 3.0)**

API dokumentacija implementirana korišćenjem next-swagger-doc i swagger-ui-react biblioteka. Swagger UI je dostupan na /api-docs ruti i prikazuje kompletnu specifikaciju svih API endpoint-a sa mogućnošću interaktivnog testiranja.

---

## 3.5. DevOps (ZAMENI STARI TEKST)

**Vercel**

Cloud platforma optimizovana za Next.js aplikacije. Nudi automatski deployment iz Git repository-ja, preview deployments za svaki pull request, Edge Network sa globalnom CDN distribucijom.

**Neon**

Serverless PostgreSQL baza podataka u cloud-u. Koristi se kao produkciona baza za deployment na Vercel-u. Podržava connection pooling i automatsko skaliranje.

**Git + GitHub**

Git verzionisanje koda sa remote repository-em na GitHub-u. Projekat koristi branching strategiju sa sledećim granama: main (stabilna verzija projekta), develop (integraciona grana za razvoj), feature/docker-swagger (grana za dockerizaciju i API dokumentaciju) i feature/external-apis (grana za integraciju eksternih API-ja).

**GitHub Actions (CI/CD)**

Automatizovan CI/CD pipeline koji se pokreće na svaki push i pull request. Pipeline uključuje lint proveru, pokretanje testova, build aplikacije i kreiranje Docker image-a.

**Environment Variables**

Senzitivni podaci (database URL, API keys, JWT secret) čuvaju se u .env fajlovima lokalno i u Vercel Environment Variables settings-ima za production.

---

## 4.3. Povezanost zahteva i implementacije (DODAJ REDOVE U TABELE)

### Dodati u prvu tabelu (Funkcionalni zahtevi):

| Zahtev | Modul | API ruta | UI ekran |
|--------|-------|----------|----------|
| Konverzija valuta | CurrencyController | GET/POST /api/currency | Dashboard |
| Lokacije destinacija | LocationsController | GET /api/locations | GroupPage |
| API dokumentacija | SwaggerConfig | GET /api/docs | ApiDocs (/api-docs) |

### Dodati u drugu tabelu (Nefunkcionalni zahtevi):

| Nefunkcionalni zahtev | Gde je implementiran |
|----------------------|----------------------|
| Dockerizacija | Dockerfile (multi-stage build), docker-compose.yml |
| CI/CD pipeline | GitHub Actions (.github/workflows/ci.yml) |
| API dokumentacija | Swagger UI (/api-docs), OpenAPI 3.0 specifikacija |
| Eksterni API-ji | Exchange Rate API, Google Maps Geocoding API |
| Automatizovani testovi | Jest + React Testing Library (3 test fajla, 22 testa) |
| Vizualizacija podataka | Recharts (PieChart, BarChart na dashboard-u) |
| Zaštita od SQL Injection | Prisma ORM (parametrizovani upiti) |
| Zaštita od XSS | React JSX automatski escaping + Zod validacija |
| Zaštita od CSRF | NextAuth.js CSRF tokeni + JWT HttpOnly cookies |

---

## Sadržaj (dodati na početku dokumenta)

- 5\. Dockerizacija aplikacije
  - 5.1. Dockerfile
  - 5.2. Docker Compose
- 6\. Swagger API dokumentacija
  - 6.1. Konfiguracija Swagger-a
  - 6.2. Swagger UI stranica
- 7\. Eksterni API-ji i vizualizacija podataka
  - 7.1. Exchange Rate API - Konverzija valuta
  - 7.2. Google Maps Geocoding API - Lokacije putovanja
  - 7.3. Vizualizacija podataka - Recharts
- 8\. CI/CD pipeline i automatizovani testovi
  - 8.1. GitHub Actions CI/CD
  - 8.2. Automatizovani testovi (Jest)
- 9\. Bezbednosne zaštite
  - 9.1. Zaštita od SQL Injection
  - 9.2. Zaštita od XSS napada
  - 9.3. Zaštita od CSRF napada
- 10\. Git branching strategija
- 11\. Cloud deployment

---

# 5. Dockerizacija aplikacije

Aplikacija je kontejnerizovana korišćenjem Docker-a, što omogućava pokretanje u izolovanom okruženju nezavisno od operativnog sistema i instaliranih alata na računaru korisnika.

## 5.1. Dockerfile

Dockerfile koristi multi-stage build pristup koji se odvija u tri faze, čime se optimizuje veličina finalnog image-a.

Prva faza (deps) preuzima Node.js 18 Alpine kao bazni image i instalira sve NPM zavisnosti iz package.json fajla. Alpine distribucija je izabrana jer je znatno manja od standardnog Node.js image-a.

Druga faza (builder) kopira izvorni kod projekta i zavisnosti iz prethodne faze, generiše Prisma klijent na osnovu schema fajla, a zatim pokreće Next.js build koji kreira optimizovanu produkcijsku verziju aplikacije.

Treća faza (runner) kreira minimalan produkcijski image. Važno je napomenuti da se koristi non-root korisnik (nextjs) za pokretanje aplikacije, što predstavlja jednu od bezbednosnih mera jer sprečava da eventualno kompromitovan kontejner ima root pristup sistemu. U ovoj fazi se kopiraju samo neophodni fajlovi iz builder faze (.next/standalone i .next/static), čime se drastično smanjuje veličina finalnog image-a.

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner (Production)
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

## 5.2. Docker Compose

Docker Compose fajl definiše dva servisa koji zajedno čine kompletno okruženje za pokretanje aplikacije.

Servis **db** koristi PostgreSQL 15 Alpine image kao relacionu bazu podataka. Konfigurisan je sa health check mehanizmom koji periodično proverava da li je baza podataka spremna za prihvatanje konekcija. Podaci baze se čuvaju u Docker volume-u (postgres_data), čime se obezbeđuje da podaci ne budu izgubljeni prilikom restartovanja kontejnera.

Servis **app** predstavlja Next.js aplikaciju koja se gradi iz Dockerfile-a. Ovaj servis zavisi od db servisa i koristi uslov `condition: service_healthy`, što znači da se aplikacija neće pokrenuti dok baza podataka ne bude potpuno spremna. Environment varijable za konekciju sa bazom i NextAuth konfiguraciju se prosleđuju kroz docker-compose.yml.

```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: expense_tracker_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: expense_tracker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: expense_tracker_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/expense_tracker?schema=public
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:-super-secret-key-change-in-production}
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:
```

Za pokretanje kompletne aplikacije dovoljno je izvršiti komandu:
```bash
docker-compose up --build
```

---

# 6. Swagger API dokumentacija

API dokumentacija je implementirana korišćenjem OpenAPI 3.0 specifikacije i prikazuje se putem Swagger UI interfejsa. Ovo omogućava developerima i korisnicima da interaktivno pregledaju i testiraju sve dostupne API endpoint-e direktno iz browsera.

## 6.1. Konfiguracija Swagger-a

Swagger konfiguracija se nalazi u fajlu `src/lib/swagger.ts` i definiše osnovne informacije o API-ju, dostupne tagove za grupisanje endpoint-a i sigurnosnu šemu. Konfiguracija koristi `next-swagger-doc` biblioteku koja automatski skenira API rute u `src/app/api` direktorijumu i generiše OpenAPI specifikaciju na osnovu JSDoc komentara u tim fajlovima.

Definisano je pet tagova za grupisanje endpoint-a: Auth (autentifikacija), Groups (grupe), Expenses (troškovi), Settlements (poravnanja) i Dashboard (statistike). Za autorizaciju se koristi Bearer JWT šema.

U okviru components sekcije definisani su šeme za glavne modele: User (sa ulogama USER, BOSS, TATA, SYSTEM_ADMIN), Group (sa tipovima APARTMENT, TRIP, PROJECT, OTHER), Expense (sa tipovima podele EQUAL, UNEQUAL, PERCENTAGE, SHARES), Settlement (sa statusima PENDING, CONFIRMED) i Error.

```typescript
// src/lib/swagger.ts

import { createSwaggerSpec } from 'next-swagger-doc'

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Expense Tracker API',
        version: '1.0.0',
        description: 'API dokumentacija za Expense Tracker aplikaciju',
      },
      tags: [
        { name: 'Auth', description: 'Autentifikacija korisnika' },
        { name: 'Groups', description: 'Upravljanje grupama' },
        { name: 'Expenses', description: 'Upravljanje troskovima' },
        { name: 'Settlements', description: 'Poravnanja dugova' },
        { name: 'Dashboard', description: 'Statistike i pregledi' },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          User: { ... },
          Group: { ... },
          Expense: { ... },
          Settlement: { ... },
          Error: { ... },
        },
      },
    },
  })
  return spec
}
```

## 6.2. Swagger UI stranica

Swagger UI je dostupan na ruti `/api-docs`. Implementiran je kao client-side React komponenta koja koristi `swagger-ui-react` biblioteku za renderovanje interaktivnog interfejsa. Komponenta dohvata OpenAPI specifikaciju sa `/api/docs` endpoint-a i prikazuje je u standardnom Swagger UI formatu koji omogućava pregled svih endpoint-a, njihovih parametara, tela zahteva i odgovora, kao i interaktivno testiranje.

```tsx
// src/app/api-docs/page.tsx

"use client"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Expense Tracker - API Dokumentacija
        </h1>
        <SwaggerUI url="/api/docs" />
      </div>
    </div>
  )
}
```

[SLIKA: Swagger UI stranica - screenshot /api-docs]

---

# 7. Eksterni API-ji i vizualizacija podataka

## 7.1. Exchange Rate API - Konverzija valuta

Aplikacija koristi Exchange Rate API (exchangerate-api.com) za dohvatanje kursne liste i konverziju valuta u realnom vremenu. Servis je implementiran u fajlu `src/lib/external-apis.ts`, a izložen je korisnicima putem dve API rute.

Funkcija `getExchangeRates` prima baznu valutu kao parametar (podrazumevano EUR) i šalje GET zahtev ka eksternom API-ju. Odgovor sadrži baznu valutu, datum i mapu kurseva prema svim podržanim valutama. Funkcija `convertCurrency` koristi `getExchangeRates` da dohvati kurseve, pronađe kurs za ciljnu valutu i izračuna konvertovani iznos zaokružen na dve decimale.

Definisano je sedam podržanih valuta: RSD (Srpski dinar), EUR (Euro), USD (Američki dolar), GBP (Britanska funta), CHF (Švajcarski franak), BAM (Bosanska marka) i HRK (Hrvatska kuna).

API ruta `GET /api/currency` dohvata kursnu listu za zadatu baznu valutu, dok `POST /api/currency` prima iznos, izvornu i ciljnu valutu i vraća rezultat konverzije. Obe rute imaju odgovarajuću error handling logiku.

```typescript
// src/lib/external-apis.ts

const EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest"

export async function getExchangeRates(
  baseCurrency: string = "EUR"
): Promise<ExchangeRates> {
  const response = await fetch(`${EXCHANGE_API_URL}/${baseCurrency}`)
  if (!response.ok) {
    throw new Error("Greska pri dohvatanju kursne liste")
  }
  const data = await response.json()
  return {
    base: data.base,
    date: data.date,
    rates: data.rates,
  }
}

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<ConversionResult> {
  const rates = await getExchangeRates(fromCurrency)
  const rate = rates.rates[toCurrency]
  if (!rate) {
    throw new Error(`Valuta ${toCurrency} nije podrzana`)
  }
  return {
    from: fromCurrency,
    to: toCurrency,
    amount,
    result: Math.round(amount * rate * 100) / 100,
    rate,
  }
}
```

```typescript
// src/app/api/currency/route.ts

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const baseCurrency = searchParams.get("base") || "EUR"
    const rates = await getExchangeRates(baseCurrency)
    return NextResponse.json({
      ...rates,
      supportedCurrencies: SUPPORTED_CURRENCIES,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Greska pri dohvatanju kursne liste" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, from, to } = body
    if (!amount || !from || !to) {
      return NextResponse.json(
        { error: "Nedostaju parametri: amount, from, to" },
        { status: 400 }
      )
    }
    const result = await convertCurrency(amount, from, to)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Greska pri konverziji" },
      { status: 500 }
    )
  }
}
```

## 7.2. Google Maps Geocoding API - Lokacije putovanja

Drugi eksterni API koji aplikacija koristi je Google Maps Geocoding API za pretvaranje naziva grada u geografske koordinate (latitude i longitude). Ovo je korisno za grupe tipa TRIP gde se mogu prikazati lokacije putovanja na mapi.

Funkcija `geocodeAddress` šalje zahtev ka Google Maps Geocoding API sa adresom i API ključem. Ukoliko API ključ nije konfigurisan, funkcija vraća null bez greške. Funkcija `getLocationCoordinates` prvo proverava da li je traženi grad dostupan u kešu popularnih destinacija, i samo ako nije, poziva geocoding API.

Implementiran je fallback mehanizam sa 12 predefinisanih popularnih destinacija koje sadrže koordinate za gradove: Pariz, Amsterdam, Rim, London, Beč, Barcelona, Prag, Berlin, Budimpešta, Beograd, Novi Sad i Niš. Ovaj mehanizam omogućava rad aplikacije i bez Google Maps API ključa.

API ruta `GET /api/locations` vraća listu svih popularnih destinacija, ili koordinate za specifičan grad ako je zadat query parametar `city`.

```typescript
// src/lib/external-apis.ts

export async function geocodeAddress(
  address: string
): Promise<Location | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY nije postavljen")
    return null
  }
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
  const response = await fetch(url)
  const data = await response.json()
  if (data.status !== "OK" || !data.results[0]) {
    return null
  }
  const result = data.results[0]
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    name: address,
    address: result.formatted_address,
  }
}

export const POPULAR_DESTINATIONS: Record<string, Location> = {
  "Pariz": { lat: 48.8566, lng: 2.3522, name: "Pariz, Francuska" },
  "Amsterdam": { lat: 52.3676, lng: 4.9041, name: "Amsterdam, Holandija" },
  "Rim": { lat: 41.9028, lng: 12.4964, name: "Rim, Italija" },
  "London": { lat: 51.5074, lng: -0.1278, name: "London, UK" },
  "Bec": { lat: 48.2082, lng: 16.3738, name: "Bec, Austrija" },
  "Barcelona": { lat: 41.3851, lng: 2.1734, name: "Barcelona, Spanija" },
  "Prag": { lat: 50.0755, lng: 14.4378, name: "Prag, Ceska" },
  "Berlin": { lat: 52.5200, lng: 13.4050, name: "Berlin, Nemacka" },
  "Budimpesta": { lat: 47.4979, lng: 19.0402, name: "Budimpesta, Madjarska" },
  "Beograd": { lat: 44.7866, lng: 20.4489, name: "Beograd, Srbija" },
  "Novi Sad": { lat: 45.2671, lng: 19.8335, name: "Novi Sad, Srbija" },
  "Nis": { lat: 43.3209, lng: 21.8954, name: "Nis, Srbija" },
}
```

```typescript
// src/app/api/locations/route.ts

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    if (city) {
      const location = await getLocationCoordinates(city)
      if (!location) {
        return NextResponse.json(
          { error: `Grad "${city}" nije pronadjen` },
          { status: 404 }
        )
      }
      return NextResponse.json(location)
    }
    const destinations = Object.entries(POPULAR_DESTINATIONS).map(
      ([key, value]) => ({
        id: key.toLowerCase().replace(/\s+/g, "-"),
        name: key,
        ...value,
      })
    )
    return NextResponse.json({
      destinations,
      total: destinations.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Greska pri dohvatanju lokacija" },
      { status: 500 }
    )
  }
}
```

## 7.3. Vizualizacija podataka - Recharts

Dashboard stranica prikazuje dva grafika za vizualizaciju troškova korišćenjem Recharts biblioteke.

**Pie Chart** prikazuje distribuciju troškova po kategorijama. Svaka kategorija ima svoju boju: Hrana (zelena), Prevoz (plava), Računi (narandžasta), Zabava (roze), Kupovina (ljubičasta) i Ostalo (siva). Grafik prikazuje procenat svakog tipa troška u ukupnoj potrošnji, sa donut stilom (prazan centar) i legend-om ispod.

**Bar Chart** prikazuje poređenje ukupnih troškova po grupama u horizontalnom rasporedu. Svaka grupa je prikazana kao ljubičasta traka čija dužina odgovara ukupnom iznosu troškova u toj grupi. X osa prikazuje iznose u formatiranom obliku, a Y osa nazive grupa.

Podaci za grafike se dohvataju sa `/api/dashboard` endpoint-a korišćenjem `useEffect` hook-a prilikom učitavanja dashboard stranice. Dok se podaci učitavaju, prikazuje se animirani spinner.

```tsx
// src/app/(dashboard)/dashboard/page.tsx

import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts"

const CATEGORY_COLORS: Record<string, string> = {
  FOOD: "#22c55e",
  TRANSPORT: "#3b82f6",
  UTILITIES: "#f59e0b",
  ENTERTAINMENT: "#ec4899",
  SHOPPING: "#8b5cf6",
  OTHER: "#6b7280",
}

// Priprema podataka za Pie chart
const pieChartData = data?.expensesByCategory?.map(item => ({
  name: CATEGORY_LABELS[item.category] || item.category,
  value: item.total,
  color: CATEGORY_COLORS[item.category] || "#6b7280",
})) || []

// Priprema podataka za Bar chart
const barChartData = data?.expensesByGroup?.map(item => ({
  name: item.name.length > 15
    ? item.name.substring(0, 15) + "..."
    : item.name,
  total: item.total,
})) || []

// Pie Chart renderovanje
<ResponsiveContainer width="100%" height={250}>
  <PieChart>
    <Pie
      data={pieChartData}
      cx="50%"
      cy="50%"
      innerRadius={60}
      outerRadius={90}
      paddingAngle={2}
      dataKey="value"
    >
      {pieChartData.map((entry, index) => (
        <Cell key={index} fill={CATEGORY_COLORS[entry.id] || "#6b7280"} />
      ))}
    </Pie>
    <Tooltip formatter={(value: number) => formatCurrency(value)} />
    <Legend />
  </PieChart>
</ResponsiveContainer>

// Bar Chart renderovanje
<ResponsiveContainer width="100%" height={250}>
  <BarChart data={barChartData} layout="vertical">
    <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
    <YAxis type="category" dataKey="name" width={100} />
    <Tooltip formatter={(value: number) => formatCurrency(value)} />
    <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
  </BarChart>
</ResponsiveContainer>
```

[SLIKA: Dashboard sa Pie i Bar chartom]

---

# 8. CI/CD pipeline i automatizovani testovi

## 8.1. GitHub Actions CI/CD

Automatizovan CI/CD pipeline je konfigurisan korišćenjem GitHub Actions-a. Konfiguracija se nalazi u fajlu `.github/workflows/ci.yml` i pokreće se automatski na svaki push i pull request ka main i develop granama.

Pipeline se sastoji od četiri posla (jobs) koji se izvršavaju na Ubuntu serveru sa Node.js 18:

1. **Lint & Type Check** - prvi posao koji proverava kvalitet koda pokretanjem ESLint-a i TypeScript kompajlera u režimu provere tipova (--noEmit). Ovaj korak obezbeđuje da kod prati definisane coding standarde i da nema type grešaka.

2. **Run Tests** - drugi posao koji pokreće sve automatizovane testove korišćenjem Jest testing framework-a. Izvršava se paralelno sa lint poslom.

3. **Build Application** - treći posao koji zavisi od uspešnog završetka lint-a i testova (`needs: [lint, test]`). Generiše Prisma klijent i pokreće Next.js build. Ovim se obezbeđuje da samo kod koji prolazi sve provere može biti izgrađen.

4. **Build Docker Image** - četvrti posao koji se pokreće samo na main grani (`if: github.ref == 'refs/heads/main'`) i zavisi od uspešnog build-a. Koristi Docker Buildx za efikasno kreiranje Docker image-a sa keširanjem.

```yaml
# .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci --legacy-peer-deps
      - run: npm run lint
      - run: npx tsc --noEmit

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci --legacy-peer-deps
      - run: npm test

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci --legacy-peer-deps
      - run: npx prisma generate
      - run: npm run build

  docker:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: expense-tracker:latest
```

## 8.2. Automatizovani testovi (Jest)

Automatizovani testovi su implementirani korišćenjem Jest testing framework-a. Konfiguracija se nalazi u `jest.config.js` fajlu koji koristi `next/jest` za integraciju sa Next.js-om, `jsdom` test okruženje za simulaciju browser-a i mapiranje `@/` aliasa za apsolutne importove.

Projekat sadrži tri test fajla sa ukupno 22 testa:

**Test fajl `validators.test.ts`** testira Zod validacione šeme za registraciju, login i kreiranje grupa. Proverava da šema prihvata validne podatke i odbacuje nevalidne (pogrešan email format, prekratka lozinka, prazan naziv grupe, nepostojeći tip grupe). Ovaj test je važan jer obezbeđuje da serverska validacija ispravno štiti API od nevalidnih podataka.

**Test fajl `external-apis.test.ts`** testira konfiguraciju eksternih API integracija. Proverava da lista podržanih valuta sadrži RSD, EUR i USD, da svaka valuta ima definisan kod, naziv i simbol, kao i da lista popularnih destinacija sadrži najmanje 10 gradova sa validnim koordinatama.

**Test fajl `utils.test.ts`** testira pomoćne funkcije: `formatCurrency` za formatiranje novčanih iznosa u različitim valutama, `formatDate` za formatiranje datuma, `getInitials` za generisanje inicijala iz imena i `cn` za spajanje CSS klasa.

```typescript
// src/__tests__/validators.test.ts

import { registerSchema, loginSchema, groupSchema } from '@/lib/validators'

describe('Validators', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'Lazar Trifkovic',
        email: 'lazar@test.com',
        password: 'password123',
      }
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'Lazar',
        email: 'invalid-email',
        password: 'password123',
      }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject short password', () => {
      const invalidData = {
        name: 'Lazar',
        email: 'lazar@test.com',
        password: '123',
      }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('groupSchema', () => {
    it('should validate correct group data', () => {
      const validData = { name: 'Put u Pariz', type: 'TRIP' }
      const result = groupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept all valid group types', () => {
      const validTypes = ['APARTMENT', 'TRIP', 'PROJECT', 'OTHER']
      validTypes.forEach(type => {
        const result = groupSchema.safeParse({ name: 'Test', type })
        expect(result.success).toBe(true)
      })
    })
  })
})
```

```typescript
// src/__tests__/external-apis.test.ts

import { SUPPORTED_CURRENCIES, POPULAR_DESTINATIONS } from '@/lib/external-apis'

describe('External APIs', () => {
  it('should contain RSD currency', () => {
    const rsd = SUPPORTED_CURRENCIES.find(c => c.code === 'RSD')
    expect(rsd).toBeDefined()
    expect(rsd?.name).toBe('Srpski dinar')
  })

  it('should have at least 10 popular destinations', () => {
    const count = Object.keys(POPULAR_DESTINATIONS).length
    expect(count).toBeGreaterThanOrEqual(10)
  })

  it('each destination should have valid coordinates', () => {
    Object.values(POPULAR_DESTINATIONS).forEach(dest => {
      expect(dest.lat).toBeGreaterThanOrEqual(-90)
      expect(dest.lat).toBeLessThanOrEqual(90)
      expect(dest.lng).toBeGreaterThanOrEqual(-180)
      expect(dest.lng).toBeLessThanOrEqual(180)
    })
  })
})
```

Pokretanje testova:
```bash
npm test                # pokretanje svih testova
npm run test:watch      # pokretanje u watch modu
npm run test:coverage   # sa izveštajem o pokrivenosti koda
```

---

# 9. Bezbednosne zaštite

Aplikacija implementira zaštitu od tri najčešća bezbednosna napada na veb aplikacije.

## 9.1. Zaštita od SQL Injection

SQL Injection je napad gde napadač umeće zlonamerni SQL kod u korisnički unos sa ciljem neovlašćenog pristupa bazi podataka. Aplikacija koristi Prisma ORM koji automatski koristi parametrizovane upite za sve interakcije sa bazom. To znači da se korisnički unos nikada ne umeće direktno u SQL upit, već se tretira kao podatak, čime se potpuno eliminiše mogućnost SQL injection napada.

Prisma dodatno pruža zaštitu na nivou tipova - TypeScript kompajler sprečava prosleđivanje nevalidnih podataka u upite.

```typescript
// BEZBEDNO - Prisma automatski parametrizuje upit
const user = await prisma.user.findUnique({
  where: { email: validatedData.email }
})

// NEBEZBEDNO - Direktan SQL koji se NE koristi u aplikaciji
// const user = db.query(`SELECT * FROM users WHERE email = '${email}'`)
```

## 9.2. Zaštita od XSS napada

Cross-Site Scripting (XSS) je napad gde napadač umeće zlonamerni JavaScript kod u sadržaj koji se prikazuje drugim korisnicima. React, koji se koristi kao frontend biblioteka, automatski escejpuje sve vrednosti koje se renderuju u JSX-u. To znači da čak i ako korisnik unese HTML ili JavaScript kod u neko polje, taj kod će biti prikazan kao običan tekst umesto da se izvrši.

Dodatno, Zod validacione šeme na serverskoj strani odbacuju podatke koji ne odgovaraju očekivanom formatu, čime se pruža još jedan sloj zaštite.

```tsx
// React automatski escejpuje sadržaj - XSS je nemoguć
<p>{expense.title}</p>
// Čak i ako expense.title sadrži "<script>alert('hack')</script>"
// biće prikazan kao običan tekst

// Zod validacija na serveru odbacuje sumnjive inpute
const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
})
```

## 9.3. Zaštita od CSRF napada

Cross-Site Request Forgery (CSRF) je napad gde zlonamerni sajt šalje zahteve u ime prijavljenog korisnika bez njegovog znanja. NextAuth.js automatski generiše i validira CSRF tokene za sve zahteve koji menjaju podatke. JWT tokeni se čuvaju u HttpOnly cookie-jima, što sprečava pristup tokenima iz JavaScript koda na klijentskoj strani.

Middleware štiti sve zaštićene rute (/dashboard, /groups, /settings) i automatski preusmerava neautentifikovane korisnike na login stranicu.

```typescript
// NextAuth automatski upravlja CSRF tokenima
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  // JWT tokeni se čuvaju u HttpOnly cookie-jima
  // CSRF tokeni se automatski generišu i validiraju
}

// Middleware štiti rute od neautorizovanog pristupa
export default withAuth({
  pages: { signIn: "/login" },
})
export const config = {
  matcher: ["/dashboard/:path*", "/groups/:path*", "/settings/:path*"],
}
```

---

# 10. Git branching strategija

Projekat koristi Git branching strategiju sa četiri grane:

| Grana | Namena | Opis |
|-------|--------|------|
| `main` | Stabilna verzija | Produkciona verzija aplikacije, samo provereni kod |
| `develop` | Integraciona grana | Grana za integraciju novih funkcionalnosti pre merge-a u main |
| `feature/docker-swagger` | Feature grana | Dockerizacija aplikacije i implementacija Swagger API dokumentacije |
| `feature/external-apis` | Feature grana | Integracija Exchange Rate API-ja i Google Maps API-ja |

**Tok rada (workflow):**
1. Nova funkcionalnost se razvija na `feature/*` grani
2. Po završetku se kreira Pull Request ka `develop` grani
3. CI/CD pipeline automatski pokreće testove
4. Nakon code review-a i uspešnih testova, vrši se merge u `develop`
5. Iz `develop` grane se periodično merge-uje u `main` za produkciju

---

# 11. Cloud deployment

Aplikacija je postavljena na cloud korišćenjem dve platforme:

**Vercel** se koristi za hosting Next.js aplikacije. Vercel je optimizovan za Next.js i pruža automatski deployment iz GitHub repository-ja, preview deployments za svaki pull request i Edge Network sa globalnom CDN distribucijom. Environment varijable (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL) se konfigurišu putem Vercel dashboard-a.

**Neon** se koristi za hosting PostgreSQL baze podataka u cloud-u. Neon je serverless platforma koja podržava connection pooling i automatsko skaliranje, sa SSL enkripcijom za sigurnu komunikaciju. Kompatibilan je sa Prisma ORM-om i pruža besplatan tier za razvojne projekte.

URL produkcione aplikacije: [DODATI URL NAKON DEPLOYMENTA]

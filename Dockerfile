# Dockerfile za Next.js Expense Tracker aplikaciju

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Kopiraj package.json i package-lock.json
COPY package.json package-lock.json ./

# Instaliraj dependencies
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Kopiraj dependencies iz prethodnog stage-a
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generiši Prisma klijent
RUN npx prisma generate

# Build Next.js aplikaciju
RUN npm run build

# Stage 3: Runner (Production)
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Kreiraj non-root korisnika za sigurnost
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiraj potrebne fajlove
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Postavi vlasništvo
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

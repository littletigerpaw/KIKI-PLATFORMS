# KIKI Platform

A multi-tenant merchant SaaS platform for creating branded storefronts, mobile apps, and business tools without writing code.

## Stack

- Frontend: Next.js + React + TypeScript on Vercel
- Backend: FastAPI + Python on Google Cloud Run
- Database: PostgreSQL
- Auth: Firebase Authentication
- Realtime: Firestore (optional for lightweight live features)
- Payments: Stripe Connect + Stripe Billing
- Edge and security: Cloudflare CDN + domain routing + WAF
- Mobile: Capacitor
- CI/CD: GitHub Actions

## Product categories

- E-commerce storefronts
- Branded merchant websites
- Booking and appointments
- Travel and tour bookings
- Restaurant ordering and reservations
- Memberships and subscriptions
- Service businesses and digital products

## Repo structure

- apps/web: merchant dashboard and public storefront shell
- backend: API, models, services, webhooks
- infra: deployment and environment configuration
- .github/workflows: CI/CD automation

## Current phase

This repository is being initialized as the foundation for the merchant SaaS platform MVP.

## Running locally

```bash
npm run dev            # applies database migrations, then starts API (:8000) + web app (:3000)
npm run test:backend   # backend tests (each test gets its own throwaway database)
```

Sign in at http://localhost:3000/login. Until Firebase is connected, local sign-in
only asks for an email (`AUTH_MODE=dev`); the backend refuses this mode when `APP_ENV=production`.

## Changing the database

Tables are managed by Alembic migrations in `backend/migrations/versions/`. Never edit the database by hand.

1. Change the models in `backend/app/models.py`.
2. `npm run db:new -- "add sku to products"` to generate a migration. Read the generated file and check it.
3. `npm run db:migrate` to apply it.

Other commands: `npm run db:status` (current version), `npm run db:rollback` (undo the last migration).
The test suite fails if the models and migrations ever drift apart.

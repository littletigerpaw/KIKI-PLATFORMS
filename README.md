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

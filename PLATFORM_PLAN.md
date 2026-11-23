# Merchant SaaS Platform Plan

## Vision

Build a white-label platform where merchants can create their own branded websites, storefronts, mobile apps, and business operations tools without writing code. The platform owner retains control of the software, infrastructure, and platform maintenance, while merchants own their brands, products, and customer relationships.

This is a hybrid of Shopify, WooCommerce, no-code builders, and business app platforms.

## Product direction

### Core product categories
- E-commerce storefronts
- Branded mobile apps
- Booking and appointment apps
- Travel and tour booking businesses
- Destination, package, and activity booking flows
- Restaurant ordering and reservations
- Membership and subscriptions
- Service businesses
- Digital goods and memberships
- Marketplace and multi-seller features

### Platform positioning
- Hosted SaaS
- Multi-tenant architecture for 100,000+ merchants and business tenants
- Merchant-controlled stores and branding
- Shared platform infrastructure behind the scenes
- Recurring subscription revenue
- Optional premium modules and app publishing
- Modular expansion into travel, tours, local services, events, and commerce

## Monetization model

### Recommended pricing structure
- Starter: low-cost plan for launching a simple storefront
- Growth: includes custom domain, analytics, and discounts
- Pro: advanced orders, inventory, automation, and subscriptions
- Enterprise: premium workflows, support, and advanced integrations

### Additional revenue streams
- app publishing add-ons
- premium templates
- automation tools
- marketplace commission fees
- custom integrations and setup fees
- enterprise onboarding

## Recommended stack

### Frontend
- Next.js
- React
- TypeScript

### Backend
- FastAPI
- Python

### Data layer
- PostgreSQL as the source of truth
- Firebase Auth for authentication
- Firestore for lightweight real-time features only

### Payments
- Stripe Connect for multi-merchant payouts and platform onboarding
- Stripe Billing for SaaS subscriptions
- Alternative: Paddle for a simpler SaaS billing experience, but Stripe Connect is still the better fit for multi-merchant payouts

### Mobile
- Capacitor

### Infra and deployment
- GitHub Actions for CI/CD
- Vercel for frontend deployment, preview environments, and global app delivery
- Cloudflare for CDN, edge performance, domain routing, and security
- Google Cloud Run for API/backend service hosting and autoscaling
- PostgreSQL as the transactional core for multi-tenant merchant data
- Firebase for auth and real-time product features
- CDN for storefronts and app assets
- domain automation and provisioning
- design for 100k+ merchants, multi-region deployment, and platform-level scaling
- Vercel is a strong starting point for React/Next.js customer apps and dashboards, but not the only platform for the full stack
- use Google Cloud Run for Python/FastAPI business logic and autoscaling backend services
- use Cloudflare as the main edge/security layer for custom domains, WAF, rate limiting, and traffic routing
- keep the core business logic portable so the platform is not locked to one hosting provider

## Payment decision

### Recommendation: Stripe Connect + Stripe Billing
Why:
- best fit for merchant onboarding
- supports marketplace-style payouts
- handles subscription billing cleanly
- strong API and webhook support
- scalable for multi-tenant payments

### When a different option may be better
- If the platform is mostly a SaaS subscription layer and not a marketplace, Paddle can be simpler for billing and tax handling.
- If the team wants one vendor with easier tax and global SaaS invoicing, Paddle may be attractive.
- But for your use case, Stripe Connect is still the stronger long-term design because you plan to support merchant payouts, apps, and business payments.

## Architectural approach

### Use a modular monolith for V1
This keeps the first release much easier to build and validate while still allowing future service separation.

### Shared platform core
- auth
- merchants
- stores
- domains
- subscriptions
- billing
- permissions
- audit logs
- app settings

### Commerce modules
- products
- inventory
- carts
- orders
- payment status
- shipping
- taxes
- discounts

### Business modules
- travel and tour bookings
- destination packages and activity reservations
- booking and scheduling
- restaurant ordering
- memberships
- events
- appointments
- digital products
- local service businesses and fulfillment workflows

## Tenant model
Every merchant-owned record must be scoped to:
- merchant_id
- store_id
- user_id or team member role

This is required for isolation, auditing, and safe authorization.

## Platform audience and long-term shape
The platform is designed to serve:
- store owners and e-commerce merchants
- restaurants and food businesses
- booking and reservation businesses
- membership and subscription operators
- creators and digital brands
- app builders and no-code creators
- local service businesses and agencies

This is a combination of Shopify, WooCommerce, Wix, and a no-code app builder operating under a single software company model.

## Multi-tenancy and scale strategy
The most important design choice is multi-tenancy: one software platform serves many independent businesses while their data, permissions, billing, custom domains, and workflows remain isolated.

We do not need 100,000 separate servers or 100,000 separate deployments. Instead, we need:
- shared platform infrastructure
- tenant-aware authorization and data scoping
- isolated merchant data boundaries
- modular business features that can be enabled per merchant
- scalable API and database design for platform-wide growth

The platform should support 100,000+ businesses without forcing us to rebuild the architecture later.

## Build without rebuilding later
- MVP: 1-100 businesses; focus on storefront builder, checkout, and dashboard
- Growth: 100-1,000 businesses; add custom domains, booking flows, memberships, and more
- Expansion: 1,000-10,000 businesses; add app publishing, integrations, and analytics
- Large scale: 10,000-100,000+ businesses; add database partitioning, regional scaling, and advanced monitoring

These are planning milestones, not guaranteed capacity limits.

## No-code builder decision
One major decision remains:
- Should customers be able to build completely custom applications with their own workflows and database structures?
- Or should they only customize the types of apps the platform provides?

Recommended direction:
- support both eventually
- start with a structured platform that supports commerce, bookings, memberships, and app publishing
- allow custom workflows and app configuration without exposing raw infrastructure complexity too early
- keep the core builder extensible so new business types can be added without rewriting the platform

## MVP roadmap

### Phase 1: Foundation
- repo setup and environment management
- merchant signup and login
- merchant dashboard shell
- store creation and settings
- PostgreSQL models
- Firebase auth integration
- Stripe billing setup

### Phase 2: Commerce engine
- product catalog
- inventory management
- cart and checkout flow
- Stripe Connect onboarding
- order dashboard
- refund and payout base flow

### Phase 3: Storefront and builder
- theme configuration
- custom domains
- responsive storefront pages
- visual builder foundations
- templates and reusable components

### Phase 4: Mobile app generation
- app configuration
- branded mobile preview
- Capacitor wrapper
- app publishing flow scaffolding

### Phase 5: Additional modules
- travel and tour booking flows
- destination package and activity management
- booking calendars and availability rules
- restaurant ordering
- memberships
- automation and marketing
- marketplace features
- local service and event business modules

## CI/CD and pipeline usage

The existing Pipeline project is a useful starting point because it already demonstrates:
- React + TypeScript storefront setup
- Firebase integration mindset
- product/catalog handling
- cart logic
- automated testing
- GitHub Actions / deployment flow

We should reuse this pattern and extend it toward the merchant SaaS platform instead of building a completely unrelated app.

## First concrete work items

1. Define the merchant and store data model
2. Create the merchant onboarding flow
3. Build a SaaS dashboard shell
4. Build a simple storefront template engine
5. Add product and inventory CRUD
6. Add Stripe billing and merchant account setup
7. Add a secure checkout flow
8. Add automated tests for cart, order flow, and merchant onboarding
9. Deploy to Vercel or a similar managed platform
10. Add GitHub Actions for validation and deploy checks

## Security architecture

### Security foundations
- Cloudflare WAF for common web attacks and malicious requests
- DDoS protection and traffic limiting at the edge
- TLS termination and domain protection for all merchant storefronts
- rate limiting for public APIs, checkout endpoints, and app-builder actions
- protected backend services with private ingress and restricted network access
- encrypted PostgreSQL storage and least-privilege database access
- Firebase Auth + MFA for merchant account protection
- payment verification and webhook validation for Stripe workflows
- audit logs, alerts, and incident response processes for all merchant actions

### Tenant isolation requirements
Every database request must be scoped to the correct merchant, store, user, or business context. This includes:
- merchant_id scoping on every business record
- store_id scoping for storefront and order access
- role-based permissions for team members and customers
- strict authorization checks on all custom app and workflow actions
- sandboxing for user-generated builder logic and workflows

### Extra protection for a no-code app builder
Because merchants will build custom apps and workflows, we need:
- sandboxed execution for user-generated code or automation workflows
- resource limits to prevent one merchant from exhausting CPU, API calls, or database connections
- secure publishing with custom domain validation, SSL, file checks, and configuration verification
- merchant-specific permissions and workflow isolation
- abuse detection for suspicious signups, fraudulent transactions, and bot activity

### Recommended security stack
- Cloudflare WAF + DDoS + rate limiting
- Google Cloud Run with private backend networking and ingress controls
- Firebase Auth with MFA and strong identity controls
- PostgreSQL encryption and least-privilege access
- continuous monitoring and vulnerability scanning in CI/CD
- OWASP ZAP security testing in staging before launch

## Platform scaling plan

### Multi-tenant growth milestones
- MVP: 1-100 businesses
- Growth: 100-1,000 businesses with custom domains and memberships
- Expansion: 1,000-10,000 businesses with app publishing and analytics
- Large scale: 10,000-100,000+ businesses with partitioning and regional scaling

### Long-term architecture
- Customers: merchants, restaurants, creators, businesses, app builders
- Cloudflare: DNS, DDoS protection, CDN, custom domains, edge routing
- Vercel: React/Next.js merchant dashboards and customer storefronts
- Google Cloud Run: FastAPI backend, checkout logic, bookings, and business operations
- PostgreSQL: transactional data, merchant isolation, subscriptions, orders
- Firebase: authentication, live updates, notifications
- Redis + queues: caching, jobs, rate limiting, async workflows

## Merchant security dashboard
We should also add a merchant-facing security center that includes:
- blocked attacks and suspicious login events
- merchant-specific security alerts
- custom domain and SSL health monitoring
- suspicious visitor and bot activity views
- incident reporting and security settings controls
- compliance and audit visibility for their own storefronts

## Bottom line

Start with a strong e-commerce SaaS core, use Stripe Connect for merchant payment architecture, and build the no-code platform on top of a shared modular foundation. This gives us a real business model and a platform we can expand into restaurants, bookings, memberships, and more without rebuilding everything from scratch.

The right long-term operating model is: Vercel and Cloudflare for customer-facing delivery, Firebase for auth and real-time experiences, Google Cloud Run for backend scaling, PostgreSQL for the shared transactional core, and a security-first multi-tenant architecture designed to support 100,000+ businesses safely from day one.

We should build the platform in a modular monolith first using Next.js, Python/FastAPI, PostgreSQL, and Firebase Authentication. This creates clean modules for commerce, bookings, memberships, and app building without the operational burden of dozens of microservices while keeping the door open for future scale and extension.

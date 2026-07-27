# Ruzzi Web — real estate platform with a self-service content layer

A production web platform for a real estate agency: property catalogue, guided search, lead capture,
and a back office where the agency runs its own listings, leads and landing pages **without a
developer in the loop**.

Built end to end — discovery with the client, data model, implementation, deployment and the
post-launch technical audit.

---

## The problem it solves

The agency's previous site was a brochure. Every price change, every new listing and every landing
page for a campaign meant a ticket to a developer and a wait. Meanwhile leads arrived through four
different channels and lived nowhere in particular.

Two decisions followed from that, and they shaped the whole build:

1. **The agency edits the site, not the developer.** Pages are composed visually in the admin panel
   and rendered by the app, so marketing can ship a campaign landing page on its own.
2. **Every lead lands in one place, attributed.** Whatever the entry point — floating form, property
   enquiry, WhatsApp — the lead is normalised into a single pipeline and assigned to an agent.

## What it does

**Public site**
- Property catalogue with filtering by type, price, location and features.
- Property detail pages with galleries, specifications and enquiry forms.
- Side-by-side property comparison.
- **Ruzzi AI** — a guided assistant that narrows listings conversationally by budget and intent
  instead of making the visitor operate filters.
- Lead capture on scroll, plus a direct WhatsApp channel.

**Back office (role-gated)**
- Property CRUD with image upload and publish/draft states.
- Lead inbox with automatic assignment to agents.
- Dashboard with operational metrics.
- **Visual page editor** — pages are built by composing blocks and stored as structured content,
  then rendered by the app at request time.
- User management with role-based access control.

## Architecture notes

- **Content as data, not as code.** The visual editor stores a page as a structured document; a
  renderer maps it to React components. New page types are a component registration, not a
  deployment. This is what keeps the agency independent.
- **Business logic in edge functions.** Property search, lead creation and assignment, bookings,
  image upload and transactional email run as ten Supabase Edge Functions rather than in the client,
  so the browser never becomes the authority on who owns a lead.
- **Typed boundaries.** Forms are validated with Zod schemas shared between form state and the
  functions that persist them, so a malformed lead fails at the edge instead of halfway through.
- **Role-based routing.** Admin surfaces sit behind a guard that resolves the session role before
  rendering, not after.

## Stack

**Frontend** React 19 · TypeScript · Vite · Tailwind CSS · Radix UI · React Router
**Content** Puck (visual page composition) · structured page documents
**Backend** Supabase — PostgreSQL, Auth, Storage, Edge Functions (Deno)
**Forms & data** React Hook Form · Zod · Recharts
**Deployment** Docker · nginx

---

*Client-facing project. This repository holds the application code; the agency's data and
credentials are not part of it.*

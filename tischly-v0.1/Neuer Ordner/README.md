# Tischly – Restaurant Table Kiosk

Tablet-first restaurant self-service kiosk built with Next.js 16, TypeScript, Tailwind CSS, Zustand, and Supabase.

## Stack

| Layer     | Tech                        |
|-----------|-----------------------------|
| Framework | Next.js 16 App Router       |
| Language  | TypeScript                  |
| Styling   | Tailwind CSS v4             |
| State     | Zustand (persisted)         |
| Backend   | Supabase (PostgreSQL + RLS) |
| Icons     | Lucide React                |

## Routes

| Route              | Description                        |
|--------------------|------------------------------------|
| `/`                | Redirects to `/table/1`            |
| `/table/[tableId]` | Kiosk UI for the given table       |
| `/admin`           | Admin panel (password: `admin123`) |

## Features

### Kiosk (`/table/[tableId]`)
- **Language screen** – DE 🇩🇪 EN 🇬🇧 TR 🇹🇷 FR 🇫🇷 IT 🇮🇹 ES 🇪🇸
- **Home dashboard** – 6 quick-action tiles
- **Menu** – Burger · Pizza · Getränke · Desserts with category tabs
- **Product detail** – extras (checkbox), notes, quantity picker, add to cart
- **Cart** – quantity control, remove, order placement
- **Payment** – Apple Pay / Google Pay / Karte / TWINT + tip selector (5/10/15/custom%)
- **Service** – Kellner rufen / Wasser / Rechnung / Hilfe
- **Offers & Benefits** – loyalty points, claim offers
- **Games** – Tic-Tac-Toe, Memory, Stein-Schere-Papier
- **Tagesempfehlung** – daily special with chef note

### Admin (`/admin`)
- Login (demo password: `admin123`)
- Dashboard with KPI cards + recent orders
- Orders – status advancement
- Menu – availability toggle per item
- Tables – visual grid, click to cycle status
- Analytics – weekly bar chart, top items

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to the kiosk.
Admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

## Supabase Setup

Run `supabase/schema.sql` in the Supabase SQL editor.

## Project Structure

```
tischly/
├── app/
│   ├── table/[tableId]/page.tsx   # Kiosk route
│   └── admin/page.tsx             # Admin route
├── components/
│   ├── TableKiosk.tsx             # Kiosk orchestrator
│   ├── HomeScreen.tsx
│   ├── menu/                      # Menu + ProductDetail
│   ├── cart/
│   ├── games/                     # TicTacToe, Memory, RPS
│   ├── ui/                        # TopBar, BottomNav
│   └── admin/                     # Admin panel tabs
├── lib/
│   ├── types.ts
│   ├── mockData.ts
│   ├── i18n.ts
│   ├── store/appStore.ts          # Zustand
│   └── supabase/
├── messages/                      # de en tr fr it es
└── supabase/schema.sql
```

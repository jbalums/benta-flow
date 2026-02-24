# BentaFlow

BentaFlow is a multi-branch Point of Sale and inventory management platform designed for small and big business owners.

This project is personalized and maintained by **Joel Baluma**.

## Features

- Public landing page for product marketing and onboarding
- Authentication:
  - Login with email/password
  - Sign-up form
  - Sign up with Google flow (configurable via environment variable)
- Role-aware app access for `ADMIN`, `MANAGER`, and `CASHIER`
- My Store Management page for business profile and store operations settings
- Dashboard with summary stats and sales insights
- POS module:
  - Product search and category filtering
  - Cart management, discounts, tax, split payment
  - Sale creation and receipt view
- Products module (full CRUD):
  - Create, read, update, delete products
  - Store relationship (`locationId`)
  - Category assignment
  - Extended product fields (brand, unit, description, tax rate, reorder level, active status)
- Categories module for category management
- Inventory module:
  - Stock list, low-stock, movements
  - Stock adjustments
- Purchase Orders:
  - Table list view
  - Create PO with line items
  - View PO details
  - Receive PO with received quantity input
- Reports:
  - Summary metrics
  - Sales report
  - Top products
- Users module for role-based user management

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui + Radix UI
- Lucide React icons
- Recharts
- Vitest + Testing Library
- ESLint

## Installation

### Prerequisites

- Node.js 18+ (recommended: Node 20+)
- npm

### 1. Clone repository

```bash
git clone <your-repo-url>
cd benta-flow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create or update `.env`:

```env
VITE_API_BASE_URL="http://127.0.0.1:8000/api"
VITE_USE_MOCK_API="true"
```

Optional for Google signup:

```env
VITE_GOOGLE_SIGNUP_URL="http://127.0.0.1:8000/api/auth/google/redirect"
```

### 4. Run development server

```bash
npm run dev
```

Open the local URL shown in terminal (usually `http://localhost:5173`).

## Scripts

- `npm run dev` - start development server
- `npm run build` - build production bundle
- `npm run preview` - preview production build
- `npm run test` - run tests once
- `npm run test:watch` - run tests in watch mode
- `npm run lint` - run ESLint

## Notes

- Set `VITE_USE_MOCK_API="true"` to use local mock handlers and seed data.
- Set `VITE_USE_MOCK_API="false"` to use your real backend.

## Author

**Joel Baluma**

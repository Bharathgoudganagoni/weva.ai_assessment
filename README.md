# StockFlow – Inventory Management System

A full-stack inventory management web app built as part of a technical assessment. It supports multiple tenants (organizations), each with their own isolated product data, and provides a dashboard with real-time stock metrics.

---

## Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS
- Lucide React (icons)

**Backend**
- Node.js + Express
- Prisma ORM
- MySQL

**Auth**
- JWT-based authentication
- Per-tenant data isolation

---

## Features

- User signup and login (per organization/tenant)
- Dashboard with stock summary, low-stock alerts, revenue chart, and inventory trends
- Product catalog with add, edit, delete, and stock adjustment
- Category filtering and search
- CSV export for product data
- Settings page for organization preferences
- Orders and Suppliers pages

---

## Project Structure

```
wexa.ai/
├── backend/         # Express API server
│   ├── prisma/      # Schema and seed data
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       └── routes/
└── frontend/        # React app
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        └── services/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL running locally

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (use `.env.example` as reference):

```
DATABASE_URL=mysql://root:yourpassword@localhost:3306/stockflow_db
JWT_SECRET=your_secret_key
PORT=5000
```

Then run:

```bash
npx prisma db push
node prisma/seed.js   # optional: loads sample data
node src/server.js
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Sample Accounts (after seeding)

| Email | Password | Org |
|---|---|---|
| demo@stockflow.com | password123 | Acme Retailers |
| tester@apex.com | password123 | Apex Logistics |

---

## Notes

- `.env` files are excluded from version control
- Each tenant only sees their own products — cross-tenant access returns 404
- The seed script can be re-run to reset data


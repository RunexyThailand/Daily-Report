# Next.js App

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- Node.js 18+ (or 20+ recommended)
- A database supported by Prisma (e.g., PostgreSQL) and a valid `DATABASE_URL` in `.env`

## Getting Started

### 1) Migrate the database

```bash
npx prisma migrate dev --name migrate_name

npx prisma generate
```

### 2) Seed default data

```bash
npx prisma db seed
```

### 3) Install dependencies & run the dev server

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser to see the app.

You can start editing the homepage by modifying `app/page.tsx`. The page will auto-update as you edit.

> This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically load and optimize [Geist](https://vercel.com/font), a new font family from Vercel.

## Scripts

- `npm run dev` – Start the development server
- `npm run build` – Create a production build
- `npm start` – Run the production server
- `npm run fmt` – Format the codebase

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) – Learn about features and APIs.
- [Learn Next.js](https://nextjs.org/learn) – Interactive Next.js tutorial.
- [Next.js GitHub Repository](https://github.com/vercel/next.js) – Feedback and contributions are welcome.

## Deploy on Vercel

The easiest way to deploy your Next.js app is on [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), the creators of Next.js.

See the [deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

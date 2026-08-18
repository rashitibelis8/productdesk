# ProductDesk — Product Management for Online Businesses

Full-stack Next.js app for businesses to register, organize and manage their products: dashboard, product CRUD with image upload, categories, stock/low-stock tracking, and multi-tenant authentication (each business only sees its own data).

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL · NextAuth.js

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Configure environment** — copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — point this at a **new** PostgreSQL database (e.g. `productsmanagement`) on your existing server, or run `docker compose up -d` to spin up a local one.
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`.

3. **Set up the database**
   ```
   npm run prisma:migrate
   npm run db:seed
   ```
   Seeds a demo account: `demo@business.com` / `Demo1234!`

4. **Run the app**
   ```
   npm run dev
   ```
   Visit http://localhost:3000

## Notes

- **Product images** are stored on local disk under `public/uploads/{userId}/` via the abstraction in `src/lib/storage.ts`. Swap that file's implementation for S3/Cloudinary later without touching any callers.
- **Password reset** currently logs the reset link to the server console instead of sending a real email (see `src/app/api/auth/forgot-password/route.ts`) — swap in a provider like Resend when ready.
- **Plan limits** (Free/Basic/Pro/Business product caps) are defined in `src/lib/plans.ts` and enforced on product creation — the scaffold for future paid plans.
- Every Product/Category query is scoped by the logged-in user's id, enforced server-side in the API routes — businesses never see each other's data.

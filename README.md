# Mrigaank Tex

An e-commerce application built with Next.js.

## Database Setup

This project uses PostgreSQL with Prisma ORM.

### Local Development

1. Install PostgreSQL on your system or use Docker:
   ```bash
   # Using Docker
   docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mrigaank_tex -p 5432:5432 -d postgres
   ```

2. Update `.env` with your database URL:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/mrigaank_tex?schema=public"
   ```

3. Run database migrations:
   ```bash
   npm run db:migrate
   ```

4. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

### Deployment on Vercel

1. Create a Vercel Postgres database.
2. Set the `DATABASE_URL` environment variable in Vercel dashboard.
3. Deploy the application.

### Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio for database management

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
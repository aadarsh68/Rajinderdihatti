# Database Management Commands

This document contains essential commands for managing the Prisma database and migrations with Neon DB.

## 1. Setup Environment
Ensure your `.env` file has the correct Neon connection string:
```env
DATABASE_URL="postgresql://user:password@ep-hostname.region.aws.neon.tech/neondb?sslmode=require"
```

## 2. Prisma Commands

### Generate Prisma Client
Run this whenever you change the `schema.prisma` file.
```bash
npm run db:generate
```
*Or directly:* `npx prisma generate`

### Create and Apply Migrations (Development)
Use this when you make changes to the schema and want to create a migration file.
```bash
npm run db:migrate
```
*Or directly:* `npx prisma migrate dev --name init`

### Sync Schema with Database (No Migrations)
Good for rapid prototyping. Updates the database schema without creating migration files.
```bash
npm run db:push
```
*Or directly:* `npx prisma db push`

### Open Prisma Studio
View and edit your data in a browser-based GUI.
```bash
npm run db:studio
```
*Or directly:* `npx prisma studio`

### Seed the Database
Populate your database with initial data using the script in `prisma/seed.js`.
```bash
npx prisma db seed
```

## 3. Neon Serverless Adapter (Optional)
If you are deploying to a serverless environment (like Vercel or Netlify), you might want to use the Neon serverless driver.

Install the dependencies (already done):
```bash
npm install @neondatabase/serverless @prisma/adapter-neon
```

Then, you can use it in your Prisma client initialization:
```javascript
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaNeon(pool)
const prisma = new PrismaClient({ adapter })
```

## 4. Migration Workflow
1. Modify `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <migration_name>`.
3. Prisma will generate the SQL, run it against the database, and update the client.

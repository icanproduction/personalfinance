# iCAN Financial - Deployment Guide

## Quick Deploy (2 minutes)

### Step 1: Install dependencies
```bash
cd ican-financial
npm install
```

### Step 2: Set Vercel Environment Variables
Go to Vercel project settings → Environment Variables

Add these variables (for **all environments**: Production, Preview, Development):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zxmkyuoigbxaplydvcbu.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bWt5dW9pZ2J4YXBseWR2Y2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTY4NDcsImV4cCI6MjA4OTczMjg0N30.YA4j9JdDxkqvNNifJD0bkr10SIVivJPJ8l4vBi1MHnM` |

### Step 3: Local Development
```bash
# Create .env.local with these values:
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://zxmkyuoigbxaplydvcbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bWt5dW9pZ2J4YXBseWR2Y2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTY4NDcsImV4cCI6MjA4OTczMjg0N30.YA4j9JdDxkqvNNifJD0bkr10SIVivJPJ8l4vBi1MHnM
EOF

# Run dev server
npm run dev
```

### Step 4: Deploy to Vercel
```bash
npx vercel deploy --prod
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Eric Saputra's projects
- **Link to existing project?** → No (create new)
- **What's the project name?** → ican-financial
- **Framework preset?** → Next.js

## Supabase Setup

Supabase project is already created: **iCAN Financial** (`zxmkyuoigbxaplydvcbu`)

If you need to recreate the database:
1. Go to Supabase SQL Editor
2. Run `database/01_schema.sql`
3. This creates all tables with sample data

## Important Notes

- Supabase project region: **ap-southeast-1** (Singapore)
- No auth/RLS needed (personal dashboard)
- Database already has 1,221+ transactions loaded
- Vercel auto-deploys on git push (if connected to repo)

---

**Last Updated:** 2026-03-22

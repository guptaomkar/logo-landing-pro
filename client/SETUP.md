# Setup Instructions

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example and fill in values)
cp .env.example .env

# Set up database
npm run prisma:migrate
npm run prisma:generate

# Start backend
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:3001" > .env

# Start frontend
npm run dev
```

### 3. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Environment Variables

### Backend (.env in backend/)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/landing_page_db
OPENAI_API_KEY=sk-...
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env in root)

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Database Setup

### Option 1: Local PostgreSQL

1. Install PostgreSQL
2. Create database: `createdb landing_page_db`
3. Update DATABASE_URL in backend/.env
4. Run migrations: `cd backend && npm run prisma:migrate`

### Option 2: Cloud PostgreSQL (Recommended)

Use a cloud provider like:
- **Supabase** (free tier available)
- **Railway** (free tier available)
- **Neon** (free tier available)

1. Create a PostgreSQL database
2. Copy the connection string
3. Update DATABASE_URL in backend/.env
4. Run migrations: `cd backend && npm run prisma:migrate`

## Getting OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add to backend/.env

## Troubleshooting

### Backend won't start

- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure OpenAI API key is valid
- Check port 3001 is not in use

### Frontend can't connect to backend

- Verify backend is running on port 3001
- Check VITE_API_BASE_URL in frontend .env
- Check CORS_ORIGIN in backend .env matches frontend URL

### Database migration errors

- Ensure PostgreSQL is accessible
- Check DATABASE_URL format
- Try: `cd backend && npx prisma migrate reset`

## Next Steps

After setup:
1. Test the application by generating a landing page
2. Check the database with Prisma Studio: `cd backend && npm run prisma:studio`
3. Review the API endpoints in backend/README.md

# Landing Page Generator - Backend

Node.js/Express backend for the AI-powered landing page generator.

## Features

- **OpenAI Integration**: GPT-4 powered content generation
- **PostgreSQL Database**: Stores companies, landing pages, and download leads
- **REST API**: Clean API endpoints for frontend integration
- **Section Regeneration**: Regenerate individual sections without recreating entire page
- **Public Preview URLs**: Share generated pages with unique URLs

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PORT`: Server port (default: 3001)
   - `CORS_ORIGIN`: Frontend URL (default: http://localhost:5173)

3. **Set Up Database**
   
   Run Prisma migrations:
   ```bash
   npm run prisma:migrate
   ```

   Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3001`

## API Endpoints

### Landing Pages

- `POST /api/landing-pages/generate` - Generate a new landing page
  ```json
  {
    "companyName": "string",
    "companyDescription": "string",
    "logoBase64": "string"
  }
  ```

- `GET /api/landing-pages/:id` - Get landing page by ID

- `GET /api/landing-pages/preview/:publicUrl` - Get landing page by public URL

- `POST /api/landing-pages/:id/sections/:sectionType/regenerate` - Regenerate a specific section

### Download Leads

- `POST /api/download-leads` - Save download lead information
  ```json
  {
    "name": "string",
    "email": "string",
    "contactNumber": "string",
    "businessName": "string",
    "location": "string",
    "downloadFormat": "html" | "react"
  }
  ```

## Database Schema

- **companies**: Company information
- **landing_pages**: Generated landing pages with content, layout, and code
- **page_sections**: Individual sections of landing pages
- **download_leads**: User information from download requests

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Deployment

1. Set up PostgreSQL database on your hosting platform
2. Set environment variables
3. Run migrations: `npm run prisma:migrate`
4. Build: `npm run build`
5. Start: `npm start`

Recommended platforms:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

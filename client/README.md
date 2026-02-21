# Landing Page Generator

AI-powered landing page generator that creates beautiful, customized landing pages based on your company description and logo.

## 🚀 Features

- **AI Content Generation**: OpenAI-powered content tailored to your industry
- **Industry-Specific Designs**: Different layouts for SaaS, restaurants, agencies, etc.
- **Color Extraction**: Automatic color palette from your logo
- **Export Options**: Download as HTML or React component
- **Section Regeneration**: Regenerate individual sections without starting over
- **Public Preview URLs**: Share generated pages with unique links

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

## 🛠️ Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Create `.env` file in the `backend` directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/landing_page_db
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Set up database**
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. **Start backend server**
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:3001`

### Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ..
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Create `.env` file in the project root:
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   ```

4. **Start frontend development server**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

## 🎯 Usage

1. Open `http://localhost:5173` in your browser
2. Enter your company name and description
3. Upload your company logo
4. Click "Generate Landing Page"
5. Preview the generated page
6. Download as HTML or React component

## 🏗️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- TailwindCSS
- shadcn/ui components
- Framer Motion
- Axios

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- OpenAI API

## 📁 Project Structure

```
landing-page-generator/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── types/          # TypeScript types
│   │   └── server.ts       # Express server
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── src/                     # Frontend source
│   ├── components/         # React components
│   ├── services/           # API client
│   ├── pages/              # Page components
│   └── hooks/              # Custom hooks
└── package.json
```

## 🚢 Deployment

### Backend Deployment

Deploy to Railway, Render, or Heroku:

1. Set up PostgreSQL database
2. Set environment variables
3. Run migrations: `npm run prisma:migrate`
4. Deploy backend

### Frontend Deployment

Deploy to Vercel or Netlify:

1. Update `VITE_API_BASE_URL` to production backend URL
2. Build: `npm run build`
3. Deploy `dist` folder

## 📝 API Documentation

See [backend/README.md](backend/README.md) for detailed API documentation.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

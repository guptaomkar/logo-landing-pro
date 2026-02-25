import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    databaseUrl: process.env.DATABASE_URL || '',
};

if (!config.openaiApiKey) {
    console.warn('WARNING: OPENAI_API_KEY is not set');
}

if (!config.databaseUrl) {
    console.warn('WARNING: DATABASE_URL is not set');
}

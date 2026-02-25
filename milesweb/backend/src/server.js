import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import landingPagesRoutes from './routes/landingPages.routes.js';
import downloadLeadsRoutes from './routes/downloadLeads.routes.js';

const app = express();

// Middleware
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/landing-pages', landingPagesRoutes);
app.use('/api/download-leads', downloadLeadsRoutes);

// Error handling
app.use(errorHandler);

// Start server
async function start() {
    try {
        await connectDatabase();

        app.listen(config.port, () => {
            console.log(`🚀 Server running on port ${config.port}`);
            console.log(`📝 Environment: ${config.nodeEnv}`);
            console.log(`🌐 CORS origin: ${config.corsOrigin}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down gracefully...');
    await disconnectDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n👋 Shutting down gracefully...');
    await disconnectDatabase();
    process.exit(0);
});

start();

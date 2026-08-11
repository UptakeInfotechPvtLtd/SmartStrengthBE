import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import http from 'http';

import routes from './routes';
import {
    connectDB,
    logger,
    loadEnv,
    requestLogger,
    getEnv,
    exceptionDispatchers,
    EmailQueue,
    WhatsAppQueue,
    istResponseTimezone,
} from './utils/';
import { startCronJobs } from './utils/cron';
import path from 'path';
import { messages } from './lang/api-messages';

// Load environment variables
loadEnv();

const app: Application = express();
const PORT: number = Number(getEnv('BACKEND_PORT')) || 8000;

// -------------------------
// Global Middlewares
// -------------------------
app.use(cors());

helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                'https://checkout.razorpay.com',
            ],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://api.razorpay.com', 'https://lumberjack.razorpay.com'],
            frameSrc: ["'self'", 'https://api.razorpay.com'],
            childSrc: ["'self'", 'https://api.razorpay.com'],
            fontSrc: ["'self'", 'data:'],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
            formAction: ["'self'"],
        },
    },

    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
        policy: 'cross-origin',
    },
    crossOriginOpenerPolicy: {
        policy: 'unsafe-none',
    },
});

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(istResponseTimezone);

// -------------------------
// Request Logger (before routes)
// -------------------------
app.use(requestLogger);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------------
// Static Files (public folder) - Must come before routes
// -------------------------
app.use(express.static(path.join(__dirname, '../public')));

// -------------------------
// Health Check Route
// -------------------------
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: messages.serverRunning });
});

// -------------------------
// Root Route - Serve landing page
// -------------------------
app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// -------------------------
// Favicon Route (fallback if no favicon in public folder)
// -------------------------
app.get('/favicon.ico', (_req: Request, res: Response) => {
    res.status(204).end(); // No content
});

// -------------------------
// API Routes
// -------------------------
app.use('/api', routes);

// -------------------------
// 404 Handler
// -------------------------
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: messages.routeNotFound,
        data: null,
    });
});

// -------------------------
// Exception Dispatcher (last)
// -------------------------
app.use(exceptionDispatchers);

// -------------------------
// Create HTTP Server
// -------------------------
const server = http.createServer(app);

Promise.all([connectDB()])
    .then(() => {
        void EmailQueue.startConsumer();
        void WhatsAppQueue.startConsumer();
        startCronJobs();
        server.listen(PORT, '0.0.0.0', () => {
            logger.info(`🚀 Server running at http://0.0.0.0:${PORT}/api/`);
        });
    })
    .catch((err) => {
        logger.error('Database connection failed', err);
        process.exit(1);
    });

export default app;

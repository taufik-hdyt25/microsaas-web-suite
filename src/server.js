import express from 'express';
import cors from 'cors';
import { PORT, UPLOADS_DIR, OUTPUTS_DIR, PUBLIC_DIR } from './config/env.js';
import { ensureDirs } from './utils/fileHelper.js';
import apiRouter from './routes/api.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Ensure working directories exist
await ensureDirs([UPLOADS_DIR, OUTPUTS_DIR]);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static frontend assets
app.use(express.static(PUBLIC_DIR));

// API Routes
app.use('/api', apiRouter);

// 404 for unknown API routes
app.use('/api/*', notFoundHandler);

// Centralized error handling
app.use(errorHandler);

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Micro-SaaS Web Studio running at http://0.0.0.0:${PORT}`);
  console.log(`📁 Uploads dir: ${UPLOADS_DIR}`);
  console.log(`📁 Outputs dir: ${OUTPUTS_DIR}`);
});

export default app;

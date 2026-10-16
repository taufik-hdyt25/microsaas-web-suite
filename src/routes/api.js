import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import atsRoutes from './atsRoutes.js';
import mediaRoutes from './mediaRoutes.js';

const apiRouter = Router();

apiRouter.use('/', healthRoutes);
apiRouter.use('/ats', atsRoutes);
apiRouter.use('/media', mediaRoutes);

export default apiRouter;

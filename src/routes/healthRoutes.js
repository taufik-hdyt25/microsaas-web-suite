import { Router } from 'express';
import { getHealth, getSample } from '../controllers/healthController.js';

const router = Router();

router.get('/health', getHealth);
router.get('/ats/sample', getSample);

export default router;

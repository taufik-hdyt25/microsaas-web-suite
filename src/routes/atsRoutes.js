import { Router } from 'express';
import {
  reviewResume,
  matchJobDescription,
  optimizeBulletPoint,
  generateResume
} from '../controllers/atsController.js';

const router = Router();

router.post('/review', reviewResume);
router.post('/match', matchJobDescription);
router.post('/optimize-bullet', optimizeBulletPoint);
router.post('/generate', generateResume);

export default router;

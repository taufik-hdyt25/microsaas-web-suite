import { Router } from 'express';
import { upload } from '../config/upload.js';
import {
  convertImage,
  compressImage,
  imagesToPdf,
  compressPdf,
  mergePdfs,
  extractPdfText,
  getFileInfo
} from '../controllers/mediaController.js';

const router = Router();

router.post('/convert-image', upload.single('file'), convertImage);
router.post('/compress-image', upload.single('file'), compressImage);
router.post('/images-to-pdf', upload.array('images', 20), imagesToPdf);
router.post('/compress-pdf', upload.single('file'), compressPdf);
router.post('/merge-pdfs', upload.array('pdfs', 10), mergePdfs);
router.post('/extract-pdf-text', upload.single('file'), extractPdfText);
router.post('/info', upload.single('file'), getFileInfo);

export default router;

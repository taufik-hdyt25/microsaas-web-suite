import path from 'node:path';
import { createReadStream } from 'node:fs';
import { OUTPUTS_DIR } from '../config/env.js';
import { safeUnlink } from '../utils/fileHelper.js';
import { ImageService } from '../services/imageService.js';
import { PdfService } from '../services/pdfService.js';

/**
 * 1. Convert Image
 */
export async function convertImage(req, res) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'Pilih file gambar untuk dikonversi.' });
  }

  const { format = 'webp', width, height, quality = 80, stripMetadata = 'true', grayscale = 'false' } = req.body;
  const outFileName = `converted-${Date.now()}.${format}`;
  const outPath = path.join(OUTPUTS_DIR, outFileName);

  try {
    const result = await ImageService.convertImage({
      inputPath: file.path,
      outputPath: outPath,
      targetFormat: format,
      width: width ? parseInt(width, 10) : undefined,
      height: height ? parseInt(height, 10) : undefined,
      quality: parseInt(quality, 10) || 80,
      stripMetadata: stripMetadata === 'true' || stripMetadata === true,
      grayscale: grayscale === 'true' || grayscale === true
    });

    res.setHeader('Content-Disposition', `attachment; filename="${outFileName}"`);
    res.setHeader('X-Original-Size', result.originalSize);
    res.setHeader('X-Converted-Size', result.convertedSize);
    res.setHeader('X-Reduction', result.reductionPercentage);

    const stream = createReadStream(outPath);
    stream.pipe(res);
    stream.on('end', () => {
      safeUnlink(file.path);
      safeUnlink(outPath);
    });
  } catch (err) {
    await safeUnlink(file.path);
    await safeUnlink(outPath);
    res.status(500).json({ error: err.message || 'Gagal mengonversi gambar.' });
  }
}

/**
 * 2. Compress Image
 */
export async function compressImage(req, res) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'Pilih file gambar untuk dikompresi.' });
  }

  const { quality = 75, lossless = 'false' } = req.body;
  const ext = path.extname(file.originalname) || '.jpg';
  const outFileName = `compressed-${Date.now()}${ext}`;
  const outPath = path.join(OUTPUTS_DIR, outFileName);

  try {
    const result = await ImageService.compressImage({
      inputPath: file.path,
      outputPath: outPath,
      quality: parseInt(quality, 10) || 75,
      lossless: lossless === 'true' || lossless === true
    });

    res.setHeader('Content-Disposition', `attachment; filename="${outFileName}"`);
    res.setHeader('X-Original-Size', result.originalSize);
    res.setHeader('X-Compressed-Size', result.compressedSize);
    res.setHeader('X-Reduction', result.reductionPercentage);

    const stream = createReadStream(outPath);
    stream.pipe(res);
    stream.on('end', () => {
      safeUnlink(file.path);
      safeUnlink(outPath);
    });
  } catch (err) {
    await safeUnlink(file.path);
    await safeUnlink(outPath);
    res.status(500).json({ error: err.message || 'Gagal mengompresi gambar.' });
  }
}

/**
 * 3. Images to PDF
 */
export async function imagesToPdf(req, res) {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Pilih minimal 1 gambar.' });
  }

  const { pageSize = 'a4', fit = 'contain' } = req.body;
  const outFileName = `bundle-${Date.now()}.pdf`;
  const outPath = path.join(OUTPUTS_DIR, outFileName);

  try {
    const inputPaths = files.map(f => f.path);
    const result = await PdfService.imagesToPdf({
      imagePaths: inputPaths,
      outputPath: outPath,
      pageSize,
      fit
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outFileName}"`);
    res.setHeader('X-Page-Count', result.pageCount);

    const stream = createReadStream(outPath);
    stream.pipe(res);
    stream.on('end', () => {
      inputPaths.forEach(p => safeUnlink(p));
      safeUnlink(outPath);
    });
  } catch (err) {
    files.forEach(f => safeUnlink(f.path));
    await safeUnlink(outPath);
    res.status(500).json({ error: err.message || 'Gagal mengubah gambar ke PDF.' });
  }
}

/**
 * 4. Compress PDF
 */
export async function compressPdf(req, res) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'Pilih file PDF.' });
  }

  const outFileName = `compressed-${Date.now()}.pdf`;
  const outPath = path.join(OUTPUTS_DIR, outFileName);

  try {
    const result = await PdfService.compressPdf({
      inputPath: file.path,
      outputPath: outPath
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outFileName}"`);
    res.setHeader('X-Original-Size', result.originalSize);
    res.setHeader('X-Compressed-Size', result.compressedSize);
    res.setHeader('X-Reduction', result.reductionPercentage);

    const stream = createReadStream(outPath);
    stream.pipe(res);
    stream.on('end', () => {
      safeUnlink(file.path);
      safeUnlink(outPath);
    });
  } catch (err) {
    await safeUnlink(file.path);
    await safeUnlink(outPath);
    res.status(500).json({ error: err.message || 'Gagal mengompresi PDF.' });
  }
}

/**
 * 5. Merge Multiple PDFs
 */
export async function mergePdfs(req, res) {
  const files = req.files;
  if (!files || files.length < 2) {
    return res.status(400).json({ error: 'Pilih minimal 2 file PDF untuk digabungkan.' });
  }

  const outFileName = `merged-${Date.now()}.pdf`;
  const outPath = path.join(OUTPUTS_DIR, outFileName);

  try {
    const inputPaths = files.map(f => f.path);
    const result = await PdfService.mergePdfs({
      pdfPaths: inputPaths,
      outputPath: outPath
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outFileName}"`);
    res.setHeader('X-Total-Pages', result.totalPages);

    const stream = createReadStream(outPath);
    stream.pipe(res);
    stream.on('end', () => {
      inputPaths.forEach(p => safeUnlink(p));
      safeUnlink(outPath);
    });
  } catch (err) {
    files.forEach(f => safeUnlink(f.path));
    await safeUnlink(outPath);
    res.status(500).json({ error: err.message || 'Gagal menggabungkan PDF.' });
  }
}

/**
 * 6. Extract PDF Text & Metadata
 */
export async function extractPdfText(req, res) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'Pilih file PDF untuk diekstrak.' });
  }

  try {
    const result = await PdfService.extractPdfText(file.path);
    await safeUnlink(file.path);
    res.json({ success: true, result });
  } catch (err) {
    await safeUnlink(file.path);
    res.status(500).json({ error: err.message || 'Gagal mengekstrak teks PDF.' });
  }
}

/**
 * 7. Get File Info (Image or PDF)
 */
export async function getFileInfo(req, res) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'Pilih file untuk diinspeksi.' });
  }

  try {
    const ext = path.extname(file.originalname).toLowerCase();
    let info;
    if (ext === '.pdf') {
      info = await PdfService.getPdfInfo(file.path);
    } else {
      info = await ImageService.getImageInfo(file.path);
    }
    await safeUnlink(file.path);
    res.json({ success: true, info });
  } catch (err) {
    await safeUnlink(file.path);
    res.status(500).json({ error: err.message || 'Gagal mendapatkan info file.' });
  }
}

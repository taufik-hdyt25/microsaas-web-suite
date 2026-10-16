import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';
import { ImageService } from '../dist/services/imageService.js';
import { PdfService } from '../dist/services/pdfService.js';

async function runDemo() {
  console.log('=== Media Converter & Compressor MCP: Test Suite ===\n');

  const testDir = path.resolve('test-assets');
  await fs.mkdir(testDir, { recursive: true });

  const samplePng = path.join(testDir, 'sample_banner.png');

  // 1. Generate an initial rich test image using sharp
  console.log('1. Generating sample image...');
  const svgBuffer = Buffer.from(`
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(79,70,229);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(236,72,153);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="400" fill="url(#grad1)" rx="20"/>
      <text x="400" y="180" font-family="sans-serif" font-size="38" font-weight="bold" fill="white" text-anchor="middle">Antigravity Micro-SaaS</text>
      <text x="400" y="240" font-family="sans-serif" font-size="22" fill="#e0e7ff" text-anchor="middle">Image &amp; PDF Converter MCP</text>
    </svg>
  `);

  await sharp(svgBuffer).png().toFile(samplePng);
  console.log('✓ Generated sample banner at:', samplePng);

  // 2. Test Get Image Info
  console.log('\n2. Testing get_image_info...');
  const info = await ImageService.getImageInfo(samplePng);
  console.log('✓ Image info:', {
    format: info.format,
    dimensions: `${info.width}x${info.height}`,
    size: info.sizeHuman,
  });

  // 3. Test Convert Image (PNG -> WebP)
  console.log('\n3. Testing convert_image (PNG -> WebP with resize)...');
  const converted = await ImageService.convertImage({
    inputPath: samplePng,
    format: 'webp',
    width: 600,
    quality: 80,
  });
  console.log('✓ Converted:', {
    outputPath: converted.outputPath,
    originalSize: converted.originalSize,
    newSize: converted.newSize,
    reduction: converted.reduction,
  });

  // 4. Test Compress Image
  console.log('\n4. Testing compress_image...');
  const compressed = await ImageService.compressImage({
    inputPath: samplePng,
    quality: 65,
  });
  console.log('✓ Compressed:', {
    outputPath: compressed.outputPath,
    originalSize: compressed.originalSize,
    newSize: compressed.newSize,
    reduction: compressed.reductionPercent,
  });

  // 5. Test Images to PDF
  console.log('\n5. Testing images_to_pdf...');
  const outputPdf = path.join(testDir, 'generated_document.pdf');
  const pdfResult = await PdfService.imagesToPdf({
    imagePaths: [samplePng, converted.outputPath],
    outputPath: outputPdf,
    pageSize: 'A4',
    title: 'Micro-SaaS Sample Portfolio',
    author: 'Antigravity AI',
  });
  console.log('✓ Images to PDF generated:', {
    outputPath: pdfResult.outputPath,
    pages: pdfResult.pageCount,
    size: pdfResult.fileSize,
  });

  // 6. Test PDF Info & Text Extraction
  console.log('\n6. Testing get_pdf_info...');
  const pdfInfo = await PdfService.getPdfInfo(outputPdf);
  console.log('✓ PDF info:', {
    title: pdfInfo.title,
    totalPages: pdfInfo.totalPages,
    size: pdfInfo.fileSize,
  });

  // 7. Test PDF Compression
  console.log('\n7. Testing compress_pdf...');
  const compressedPdf = await PdfService.compressPdf({
    inputPath: outputPdf,
    stripMetadata: true,
  });
  console.log('✓ PDF Compressed:', {
    originalSize: compressedPdf.originalSize,
    compressedSize: compressedPdf.compressedSize,
    reduction: compressedPdf.reduction,
  });

  // 8. Test Merge PDFs
  console.log('\n8. Testing merge_pdfs...');
  const mergedPdfPath = path.join(testDir, 'merged_document.pdf');
  const mergedResult = await PdfService.mergePdfs({
    inputPaths: [outputPdf, compressedPdf.outputPath],
    outputPath: mergedPdfPath,
    title: 'Combined Report',
  });
  console.log('✓ Merged PDFs:', {
    outputPath: mergedResult.outputPath,
    totalPages: mergedResult.totalPages,
    size: mergedResult.fileSize,
  });

  console.log('\nAll Media Converter MCP tests passed successfully! 🎉');
}

runDemo().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

import { PDFDocument, PageSizes } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
// @ts-ignore
import pdfParseModule from 'pdf-parse';
const pdfParse = typeof pdfParseModule === 'function' ? pdfParseModule : pdfParseModule.default;
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
export class PdfService {
    /**
     * Convert one or more images into a single cohesive PDF document
     */
    static async imagesToPdf(options) {
        if (!options.imagePaths || options.imagePaths.length === 0) {
            throw new Error('At least one image path is required.');
        }
        const pdfDoc = await PDFDocument.create();
        if (options.title)
            pdfDoc.setTitle(options.title);
        if (options.author)
            pdfDoc.setAuthor(options.author);
        pdfDoc.setProducer('Antigravity Media Converter MCP');
        const margin = options.margin ?? 20;
        for (const imgPath of options.imagePaths) {
            const resolvedImgPath = path.resolve(imgPath);
            const metadata = await sharp(resolvedImgPath).metadata();
            // Ensure image is JPEG or PNG for pdf-lib embedding
            let imgBuffer;
            let isPng = metadata.format === 'png';
            if (metadata.format === 'png' || metadata.format === 'jpeg') {
                imgBuffer = await fs.readFile(resolvedImgPath);
            }
            else {
                // Convert to high-quality JPEG for other formats (webp, avif, tiff, etc.)
                imgBuffer = await sharp(resolvedImgPath).jpeg({ quality: 95 }).toBuffer();
                isPng = false;
            }
            const embeddedImage = isPng
                ? await pdfDoc.embedPng(imgBuffer)
                : await pdfDoc.embedJpg(imgBuffer);
            let pageWidth;
            let pageHeight;
            if (options.pageSize === 'LETTER') {
                [pageWidth, pageHeight] = PageSizes.Letter;
            }
            else if (options.pageSize === 'A4') {
                [pageWidth, pageHeight] = PageSizes.A4;
            }
            else {
                // FIT_IMAGE: page size matches image dimensions directly
                pageWidth = embeddedImage.width + margin * 2;
                pageHeight = embeddedImage.height + margin * 2;
            }
            const page = pdfDoc.addPage([pageWidth, pageHeight]);
            const availableWidth = pageWidth - margin * 2;
            const availableHeight = pageHeight - margin * 2;
            // Scale to fit page while maintaining aspect ratio
            const scale = Math.min(availableWidth / embeddedImage.width, availableHeight / embeddedImage.height, 1 // Do not upscale if image is smaller than page
            );
            const renderWidth = embeddedImage.width * scale;
            const renderHeight = embeddedImage.height * scale;
            // Center image on page
            const x = (pageWidth - renderWidth) / 2;
            const y = (pageHeight - renderHeight) / 2;
            page.drawImage(embeddedImage, {
                x,
                y,
                width: renderWidth,
                height: renderHeight,
            });
        }
        const resolvedOutput = path.resolve(options.outputPath);
        await fs.mkdir(path.dirname(resolvedOutput), { recursive: true });
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        await fs.writeFile(resolvedOutput, pdfBytes);
        const stats = await fs.stat(resolvedOutput);
        return {
            success: true,
            outputPath: resolvedOutput,
            pageCount: options.imagePaths.length,
            fileSize: formatBytes(stats.size),
            sizeBytes: stats.size,
        };
    }
    /**
     * Optimize and compress PDF by stripping unused objects, enabling object streams, and re-encoding
     */
    static async compressPdf(options) {
        const resolvedInput = path.resolve(options.inputPath);
        const inputStats = await fs.stat(resolvedInput);
        const pdfData = await fs.readFile(resolvedInput);
        let outputTarget = options.outputPath;
        if (!outputTarget) {
            const parsed = path.parse(resolvedInput);
            outputTarget = path.join(parsed.dir, `${parsed.name}_compressed.pdf`);
        }
        else {
            outputTarget = path.resolve(outputTarget);
        }
        await fs.mkdir(path.dirname(outputTarget), { recursive: true });
        const pdfDoc = await PDFDocument.load(pdfData, {
            ignoreEncryption: true,
            updateMetadata: false,
        });
        if (options.stripMetadata) {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('Antigravity MCP Optimizer');
            pdfDoc.setCreator('');
        }
        // Save with maximum object stream compression
        const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
        });
        await fs.writeFile(outputTarget, compressedBytes);
        const outputStats = await fs.stat(outputTarget);
        const savedBytes = inputStats.size - outputStats.size;
        const reductionPercent = Math.round((savedBytes / inputStats.size) * 100);
        return {
            success: true,
            inputPath: resolvedInput,
            outputPath: outputTarget,
            originalSize: formatBytes(inputStats.size),
            compressedSize: formatBytes(outputStats.size),
            reduction: `${reductionPercent > 0 ? reductionPercent : 0}%`,
            savedBytes: Math.max(0, savedBytes),
        };
    }
    /**
     * Merge multiple PDF files into a single unified PDF
     */
    static async mergePdfs(options) {
        if (!options.inputPaths || options.inputPaths.length < 2) {
            throw new Error('At least two PDF files are required for merging.');
        }
        const mergedDoc = await PDFDocument.create();
        if (options.title)
            mergedDoc.setTitle(options.title);
        if (options.author)
            mergedDoc.setAuthor(options.author);
        mergedDoc.setProducer('Antigravity PDF Merger MCP');
        let totalPages = 0;
        for (const inputPath of options.inputPaths) {
            const resolvedPath = path.resolve(inputPath);
            const pdfBytes = await fs.readFile(resolvedPath);
            const doc = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
            for (const page of copiedPages) {
                mergedDoc.addPage(page);
                totalPages++;
            }
        }
        const resolvedOutput = path.resolve(options.outputPath);
        await fs.mkdir(path.dirname(resolvedOutput), { recursive: true });
        const savedBytes = await mergedDoc.save({ useObjectStreams: true });
        await fs.writeFile(resolvedOutput, savedBytes);
        const stats = await fs.stat(resolvedOutput);
        return {
            success: true,
            outputPath: resolvedOutput,
            mergedFilesCount: options.inputPaths.length,
            totalPages,
            fileSize: formatBytes(stats.size),
            sizeBytes: stats.size,
        };
    }
    /**
     * Extract text and metadata from PDF for analysis or LLM ingestion
     */
    static async extractPdfText(filePath) {
        const resolvedPath = path.resolve(filePath);
        const dataBuffer = await fs.readFile(resolvedPath);
        const data = await pdfParse(dataBuffer);
        return {
            filePath: resolvedPath,
            totalPages: data.numpages,
            text: data.text.trim(),
            charCount: data.text.length,
            wordCount: data.text.trim().split(/\s+/).filter(Boolean).length,
            info: data.info || {},
            version: data.version,
        };
    }
    /**
     * Get metadata and page info of a PDF
     */
    static async getPdfInfo(filePath) {
        const resolvedPath = path.resolve(filePath);
        const stats = await fs.stat(resolvedPath);
        const dataBuffer = await fs.readFile(resolvedPath);
        const data = await pdfParse(dataBuffer);
        return {
            filePath: resolvedPath,
            fileSize: formatBytes(stats.size),
            sizeBytes: stats.size,
            totalPages: data.numpages,
            title: data.info?.Title || null,
            author: data.info?.Author || null,
            creator: data.info?.Creator || null,
            producer: data.info?.Producer || null,
            creationDate: data.info?.CreationDate || null,
            version: data.version,
            hasText: data.text.trim().length > 0,
        };
    }
}
//# sourceMappingURL=pdfService.js.map
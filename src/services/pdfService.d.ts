export interface ImagesToPdfOptions {
    imagePaths: string[];
    outputPath: string;
    pageSize?: 'A4' | 'LETTER' | 'FIT_IMAGE';
    margin?: number;
    author?: string;
    title?: string;
}
export interface CompressPdfOptions {
    inputPath: string;
    outputPath?: string;
    stripMetadata?: boolean;
}
export interface MergePdfsOptions {
    inputPaths: string[];
    outputPath: string;
    title?: string;
    author?: string;
}
export declare class PdfService {
    /**
     * Convert one or more images into a single cohesive PDF document
     */
    static imagesToPdf(options: ImagesToPdfOptions): Promise<{
        success: boolean;
        outputPath: string;
        pageCount: number;
        fileSize: string;
        sizeBytes: number;
    }>;
    /**
     * Optimize and compress PDF by stripping unused objects, enabling object streams, and re-encoding
     */
    static compressPdf(options: CompressPdfOptions): Promise<{
        success: boolean;
        inputPath: string;
        outputPath: string;
        originalSize: string;
        compressedSize: string;
        reduction: string;
        savedBytes: number;
    }>;
    /**
     * Merge multiple PDF files into a single unified PDF
     */
    static mergePdfs(options: MergePdfsOptions): Promise<{
        success: boolean;
        outputPath: string;
        mergedFilesCount: number;
        totalPages: number;
        fileSize: string;
        sizeBytes: number;
    }>;
    /**
     * Extract text and metadata from PDF for analysis or LLM ingestion
     */
    static extractPdfText(filePath: string): Promise<{
        filePath: string;
        totalPages: number;
        text: string;
        charCount: number;
        wordCount: number;
        info: any;
        version: string;
    }>;
    /**
     * Get metadata and page info of a PDF
     */
    static getPdfInfo(filePath: string): Promise<{
        filePath: string;
        fileSize: string;
        sizeBytes: number;
        totalPages: number;
        title: any;
        author: any;
        creator: any;
        producer: any;
        creationDate: any;
        version: string;
        hasText: boolean;
    }>;
}
//# sourceMappingURL=pdfService.d.ts.map
import sharp from 'sharp';
export interface ConvertImageOptions {
    inputPath: string;
    outputPath?: string;
    format: 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff' | 'gif';
    width?: number;
    height?: number;
    quality?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    rotate?: number;
    grayscale?: boolean;
}
export interface CompressImageOptions {
    inputPath: string;
    outputPath?: string;
    quality?: number;
    maxDimension?: number;
    stripMetadata?: boolean;
}
export interface ImageInfoResult {
    filePath: string;
    format?: string;
    width?: number;
    height?: number;
    space?: string;
    channels?: number;
    depth?: string;
    density?: number;
    isProgressive?: boolean;
    hasAlpha?: boolean;
    sizeBytes: number;
    sizeHuman: string;
}
export declare class ImageService {
    /**
     * Get metadata and information about an image
     */
    static getImageInfo(filePath: string): Promise<ImageInfoResult>;
    /**
     * Convert image between formats with resizing, rotating, and optimization options
     */
    static convertImage(options: ConvertImageOptions): Promise<{
        success: boolean;
        inputPath: string;
        outputPath: string;
        format: "jpeg" | "png" | "webp" | "avif" | "tiff" | "gif";
        originalSize: string;
        newSize: string;
        reduction: string;
        savedBytes: number;
    }>;
    /**
     * Intelligently compress image to reduce payload size while preserving perceptual quality
     */
    static compressImage(options: CompressImageOptions): Promise<{
        success: boolean;
        inputPath: string;
        outputPath: string;
        format: keyof sharp.FormatEnum;
        originalSize: string;
        newSize: string;
        reductionPercent: string;
        savedBytes: number;
    }>;
}
//# sourceMappingURL=imageService.d.ts.map
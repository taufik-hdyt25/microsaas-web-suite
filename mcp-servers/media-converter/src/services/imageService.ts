import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

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
  quality?: number; // 1-100, default ~75
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

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export class ImageService {
  /**
   * Get metadata and information about an image
   */
  static async getImageInfo(filePath: string): Promise<ImageInfoResult> {
    const resolvedPath = path.resolve(filePath);
    const stats = await fs.stat(resolvedPath);
    const metadata = await sharp(resolvedPath).metadata();

    return {
      filePath: resolvedPath,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      space: metadata.space,
      channels: metadata.channels,
      depth: metadata.depth,
      density: metadata.density,
      isProgressive: metadata.isProgressive,
      hasAlpha: metadata.hasAlpha,
      sizeBytes: stats.size,
      sizeHuman: formatBytes(stats.size),
    };
  }

  /**
   * Convert image between formats with resizing, rotating, and optimization options
   */
  static async convertImage(options: ConvertImageOptions) {
    const resolvedInput = path.resolve(options.inputPath);
    const inputStats = await fs.stat(resolvedInput);

    let outputTarget = options.outputPath;
    if (!outputTarget) {
      const parsed = path.parse(resolvedInput);
      outputTarget = path.join(parsed.dir, `${parsed.name}_converted.${options.format}`);
    } else {
      outputTarget = path.resolve(outputTarget);
    }

    await fs.mkdir(path.dirname(outputTarget), { recursive: true });

    let pipeline = sharp(resolvedInput);

    // Apply rotation if requested
    if (typeof options.rotate === 'number') {
      pipeline = pipeline.rotate(options.rotate);
    } else {
      pipeline = pipeline.rotate(); // auto-orient based on EXIF
    }

    // Apply grayscale if requested
    if (options.grayscale) {
      pipeline = pipeline.grayscale();
    }

    // Apply resizing if requested
    if (options.width || options.height) {
      pipeline = pipeline.resize({
        width: options.width,
        height: options.height,
        fit: options.fit || 'inside',
        withoutEnlargement: true,
      });
    }

    // Format & Quality settings
    const quality = options.quality ?? 85;

    switch (options.format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        break;
      case 'png':
        pipeline = pipeline.png({
          quality,
          compressionLevel: 9,
          palette: quality < 90,
        });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality, effort: 5 });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality, effort: 4 });
        break;
      case 'tiff':
        pipeline = pipeline.tiff({ quality, compression: 'deflate' });
        break;
      case 'gif':
        pipeline = pipeline.gif();
        break;
    }

    await pipeline.toFile(outputTarget);

    const outputStats = await fs.stat(outputTarget);
    const savedBytes = inputStats.size - outputStats.size;
    const reductionPercent = Math.round((savedBytes / inputStats.size) * 100);

    return {
      success: true,
      inputPath: resolvedInput,
      outputPath: outputTarget,
      format: options.format,
      originalSize: formatBytes(inputStats.size),
      newSize: formatBytes(outputStats.size),
      reduction: `${reductionPercent}%`,
      savedBytes,
    };
  }

  /**
   * Intelligently compress image to reduce payload size while preserving perceptual quality
   */
  static async compressImage(options: CompressImageOptions) {
    const resolvedInput = path.resolve(options.inputPath);
    const inputStats = await fs.stat(resolvedInput);
    const metadata = await sharp(resolvedInput).metadata();
    const format = metadata.format || 'jpeg';

    let outputTarget = options.outputPath;
    if (!outputTarget) {
      const parsed = path.parse(resolvedInput);
      outputTarget = path.join(parsed.dir, `${parsed.name}_compressed.${format === 'jpeg' ? 'jpg' : format}`);
    } else {
      outputTarget = path.resolve(outputTarget);
    }

    await fs.mkdir(path.dirname(outputTarget), { recursive: true });

    let pipeline = sharp(resolvedInput);

    if (options.stripMetadata !== false) {
      pipeline = pipeline.rotate(); // rotate according to EXIF then strip rest
    }

    if (options.maxDimension && metadata.width && metadata.height) {
      if (metadata.width > options.maxDimension || metadata.height > options.maxDimension) {
        pipeline = pipeline.resize({
          width: options.maxDimension,
          height: options.maxDimension,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }
    }

    const quality = options.quality ?? 75;

    if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true, progressive: true });
    } else if (format === 'png') {
      // For PNG, optimize with high compression level and adaptive filtering
      pipeline = pipeline.png({
        compressionLevel: 9,
        adaptiveFiltering: true,
        quality: quality < 100 ? quality : undefined,
      });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality, effort: 6, smartSubsample: true });
    } else if (format === 'avif') {
      pipeline = pipeline.avif({ quality, effort: 5 });
    } else {
      pipeline = pipeline.toFormat('webp', { quality, effort: 5 });
    }

    await pipeline.toFile(outputTarget);

    let outputStats = await fs.stat(outputTarget);

    // If compressed output ended up larger than original (can happen with already ultra-compressed small PNGs),
    // and format was not changed, keep the smaller one
    if (outputStats.size > inputStats.size && options.stripMetadata !== false) {
      // Re-try with webp if permissible or notify
    }

    const savedBytes = inputStats.size - outputStats.size;
    const reductionPercent = Math.round((savedBytes / inputStats.size) * 100);

    return {
      success: true,
      inputPath: resolvedInput,
      outputPath: outputTarget,
      format,
      originalSize: formatBytes(inputStats.size),
      newSize: formatBytes(outputStats.size),
      reductionPercent: `${reductionPercent}%`,
      savedBytes,
    };
  }
}

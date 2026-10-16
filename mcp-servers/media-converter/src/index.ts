#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { ImageService } from './services/imageService.js';
import { PdfService } from './services/pdfService.js';

const server = new Server(
  {
    name: 'media-converter-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register list of tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'convert_image',
        description:
          'Convert image between formats (JPEG, PNG, WebP, AVIF, TIFF, GIF) with optional resizing, rotation, grayscale, and quality control.',
        inputSchema: {
          type: 'object',
          properties: {
            inputPath: {
              type: 'string',
              description: 'Absolute or relative path to the source image file',
            },
            outputPath: {
              type: 'string',
              description:
                'Optional path for the output file. If omitted, will be generated automatically in the same directory.',
            },
            format: {
              type: 'string',
              enum: ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'],
              description: 'Target image format',
            },
            width: {
              type: 'number',
              description: 'Target width in pixels (maintains aspect ratio if height omitted)',
            },
            height: {
              type: 'number',
              description: 'Target height in pixels (maintains aspect ratio if width omitted)',
            },
            quality: {
              type: 'number',
              description: 'Quality level from 1 to 100 (default: 85)',
            },
            fit: {
              type: 'string',
              enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
              description: 'Resize strategy (default: inside)',
            },
            rotate: {
              type: 'number',
              description: 'Degrees to rotate the image (e.g. 90, 180, 270)',
            },
            grayscale: {
              type: 'boolean',
              description: 'Convert image to black & white grayscale',
            },
          },
          required: ['inputPath', 'format'],
        },
      },
      {
        name: 'compress_image',
        description:
          'Smart lossy/lossless image compression to significantly reduce file size while preserving perceptual quality. Strips EXIF metadata.',
        inputSchema: {
          type: 'object',
          properties: {
            inputPath: {
              type: 'string',
              description: 'Path to the image to compress',
            },
            outputPath: {
              type: 'string',
              description: 'Optional output destination path',
            },
            quality: {
              type: 'number',
              description: 'Compression quality target (1-100, default: 75)',
            },
            maxDimension: {
              type: 'number',
              description: 'Optional max width/height bound in pixels to downscale ultra large images',
            },
            stripMetadata: {
              type: 'boolean',
              description: 'Whether to strip metadata/EXIF for smaller payload (default: true)',
            },
          },
          required: ['inputPath'],
        },
      },
      {
        name: 'get_image_info',
        description:
          'Inspect image dimensions, format, color space, channel count, alpha channel, and file size.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the image file',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'images_to_pdf',
        description:
          'Combine one or more images into a structured PDF document with custom margins, paper format (A4, Letter, Fit Image), and metadata.',
        inputSchema: {
          type: 'object',
          properties: {
            imagePaths: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of image paths in page order to combine into PDF',
            },
            outputPath: {
              type: 'string',
              description: 'Destination path for generated PDF file',
            },
            pageSize: {
              type: 'string',
              enum: ['A4', 'LETTER', 'FIT_IMAGE'],
              description: 'Page sizing layout (default: FIT_IMAGE)',
            },
            margin: {
              type: 'number',
              description: 'Page margin in points (default: 20)',
            },
            title: {
              type: 'string',
              description: 'PDF document title',
            },
            author: {
              type: 'string',
              description: 'PDF document author',
            },
          },
          required: ['imagePaths', 'outputPath'],
        },
      },
      {
        name: 'compress_pdf',
        description:
          'Compress and optimize PDF file by enabling object streams, removing unreferenced objects, and stripping non-essential metadata.',
        inputSchema: {
          type: 'object',
          properties: {
            inputPath: {
              type: 'string',
              description: 'Path to input PDF file',
            },
            outputPath: {
              type: 'string',
              description: 'Optional output path for compressed PDF',
            },
            stripMetadata: {
              type: 'boolean',
              description: 'Strip metadata tags like author, creator, keywords for smaller size',
            },
          },
          required: ['inputPath'],
        },
      },
      {
        name: 'merge_pdfs',
        description:
          'Merge multiple PDF documents into a single document in sequential order.',
        inputSchema: {
          type: 'object',
          properties: {
            inputPaths: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of PDF file paths to merge in order',
            },
            outputPath: {
              type: 'string',
              description: 'Destination path for the merged PDF',
            },
            title: {
              type: 'string',
              description: 'Optional document title',
            },
          },
          required: ['inputPaths', 'outputPath'],
        },
      },
      {
        name: 'extract_pdf_text',
        description:
          'Extract full raw text content and metadata from a PDF file for LLM reading, summarization, or ATS parsing.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the PDF file to read',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'get_pdf_info',
        description:
          'Get PDF metadata including total page count, author, title, version, and file size.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the PDF file',
            },
          },
          required: ['filePath'],
        },
      },
    ],
  };
});

// Tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'convert_image': {
        const result = await ImageService.convertImage(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'compress_image': {
        const result = await ImageService.compressImage(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_image_info': {
        const result = await ImageService.getImageInfo((args as any).filePath);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'images_to_pdf': {
        const result = await PdfService.imagesToPdf(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'compress_pdf': {
        const result = await PdfService.compressPdf(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'merge_pdfs': {
        const result = await PdfService.mergePdfs(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'extract_pdf_text': {
        const result = await PdfService.extractPdfText((args as any).filePath);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_pdf_info': {
        const result = await PdfService.getPdfInfo((args as any).filePath);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message || String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Media Converter MCP Server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error running Media Converter MCP Server:', err);
  process.exit(1);
});

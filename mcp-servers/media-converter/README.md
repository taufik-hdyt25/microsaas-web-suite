# Media Converter & Compressor MCP Server 🖼️📄

A high-performance **Model Context Protocol (MCP)** server built with Node.js and Libvips (`sharp`) + `pdf-lib` for fast image/PDF processing, format conversion, and intelligent compression.

Built as a ready-to-monetize **Micro-SaaS MCP service**.

---

## 🚀 Features & Tools

### 1. `convert_image`
Convert images between multiple modern formats with precision resizing and transformations:
- **Formats Supported**: PNG, JPEG, WebP, AVIF, TIFF, GIF
- **Options**: `width`, `height`, `quality` (1-100), `fit` (cover, contain, inside, fill, outside), `rotate`, `grayscale`

### 2. `compress_image`
Smart compression targeting optimal size reduction while preserving perceptual quality. Strips EXIF/metadata and optimizes palette/quantization.

### 3. `get_image_info`
Inspects image dimensions, format, color space, bit depth, channel count, alpha channel, and file size.

### 4. `images_to_pdf`
Combine one or multiple images into a clean, formatted PDF document with customizable margins and paper sizes (A4, Letter, Fit Image).

### 5. `compress_pdf`
Optimizes PDF size by consolidating object streams, stripping redundant metadata, and compressing internal resources.

### 6. `merge_pdfs`
Merges multiple PDF documents into a single document in sequential order.

### 7. `extract_pdf_text`
Extracts raw text and document metadata from PDF files for LLM summarization, semantic search, or ATS ingestion.

### 8. `get_pdf_info`
Returns total page count, document title, author, version, and file size.

---

## 🛠️ Installation & Setup

```bash
cd projects/media-converter-mcp
npm install
npm run build
```

To run test suite:
```bash
node --experimental-strip-types test/demo-test.ts
```

---

## 🔌 MCP Client Configuration

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "media-converter": {
      "command": "node",
      "args": ["/app/projects/media-converter-mcp/dist/index.js"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "media-converter": {
      "command": "node",
      "args": ["/app/projects/media-converter-mcp/dist/index.js"]
    }
  }
}
```

---

## 💡 Micro-SaaS Monetization Ideas
1. **Tiered API / Hosted MCP**: Offer free tier (10 conversions/day) and Pro tier ($9/mo for unlimited high-res AVIF/WebP batch conversions and OCR/PDF compression).
2. **E-commerce Image Pipeline**: Automate Shopify/WooCommerce product photo optimization directly from AI assistants.
3. **Document Archival Tool**: Auto-convert and compress scanned receipts/invoices into lightweight searchable PDFs.

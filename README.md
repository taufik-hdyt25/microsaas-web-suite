# 🚀 Micro-SaaS Suite: Web Studio, REST API & MCP Servers

Proyek Micro-SaaS terpadu yang menggabungkan **Interactive Web Studio**, **REST API**, dan **Model Context Protocol (MCP) Servers** dalam satu repository rapi.

Fitur inti yang disediakan:
1. **ATS Resume Builder & Scorer**: Scoring 0–100, Job Description Matcher, STAR Bullet Optimizer, & Export (HTML, Markdown, Plain Text, JSONResume).
2. **Media & PDF Converter/Compressor**: Konversi gambar modern (WebP, AVIF, PNG, JPEG), kompresi cerdas, Image-to-PDF, PDF compressor, PDF merger, & ekstraksi teks.

---

## 📁 Struktur Project (Unified Monorepo)

```text
microsaas-web-suite/
├── src/                      # Backend REST API & Controllers (Express)
│   ├── config/               # Upload & env configuration
│   ├── controllers/          # ATS & Media controllers
│   ├── middlewares/          # Error handling & validation
│   ├── routes/               # API route definitions
│   ├── services/             # Core business logic services
│   └── server.js             # Entrypoint server HTTP
├── public/                   # Frontend Web Studio (Shadcn-styled UI)
├── mcp-servers/              # Model Context Protocol (TypeScript)
│   ├── ats-resume/           # ATS Resume Maker & AI Reviewer MCP Server
│   └── media-converter/      # High-performance Media & PDF MCP Server
├── uploads/                  # Temporary uploaded files
├── outputs/                  # Processed downloads & generated assets
├── Dockerfile                # Production Docker container image
├── docker-compose.yml        # Docker compose configuration
├── deploy.sh                 # Fast deployment script
└── package.json              # Root project dependencies & scripts
```

---

## 🐳 Deployment (Docker)

Project sudah dilengkapi konfigurasi Docker siap pakai (`Dockerfile` & `docker-compose.yml`).

### Opsi 1: Menjalankan via script deploy (Rekomendasi)
```bash
./deploy.sh
```

### Opsi 2: Menggunakan Docker Compose langsung
```bash
docker compose up -d --build
```

Setelah berjalan, Web Studio dapat diakses di:
- **Lokal:** `http://localhost:8080`
- **Publik / VPS:** `http://<IP_SERVER>:8080`

### Perintah Berguna:
- **Status Container:** `docker compose ps`
- **Real-time Logs:** `docker compose logs -f`
- **Stop Service:** `docker compose down`
- **Restart Service:** `docker compose restart`

---

## 🔌 Model Context Protocol (MCP) Servers

Dua MCP Server siap pakai disertakan di dalam folder [`mcp-servers/`](./mcp-servers):
1. **ATS Resume Maker MCP** (`mcp-servers/ats-resume`): Ditulis dengan TypeScript, mendukung pembuatan resume ATS compliant, 100-poin rubric score, job description matching, dan STAR bullet rewriting.
2. **Media Converter MCP** (`mcp-servers/media-converter`): Ditulis dengan TypeScript, ditenagai `sharp` (libvips) dan `pdf-lib` untuk konversi/kompresi gambar dan manipulasi PDF.

### Menjalankan MCP Secara Langsung:
```bash
# Menjalankan ATS Resume MCP
npm run mcp:ats

# Menjalankan Media Converter MCP
npm run mcp:media

# Build ulang TypeScript MCP
npm run build:mcp

# Jalankan test suite MCP
npm run test:mcp
```

### Konfigurasi MCP Client (Claude Desktop / Cursor):
Tambahkan konfigurasi berikut ke file client kamu (misal: `claude_desktop_config.json` atau `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "media-converter": {
      "command": "node",
      "args": ["/app/projects/microsaas-web-suite/mcp-servers/media-converter/dist/index.js"]
    },
    "ats-resume": {
      "command": "node",
      "args": ["/app/projects/microsaas-web-suite/mcp-servers/ats-resume/dist/index.js"]
    }
  }
}
```

---

## 🌐 Endpoint REST API

- `GET /api/health` - Health check & status service aktif
- `GET /api/ats/sample` - Data contoh resume & job description
- `POST /api/ats/review` - Review resume ATS (0-100 rubric)
- `POST /api/ats/match` - Match resume vs job description
- `POST /api/ats/optimize-bullet` - Rewrite bullet points metode STAR
- `POST /api/ats/generate` - Generate resume (Markdown, Text, HTML)
- `POST /api/media/convert-image` - Konversi format gambar
- `POST /api/media/compress-image` - Kompres gambar
- `POST /api/media/images-to-pdf` - Gabung koleksi gambar ke satu PDF
- `POST /api/media/compress-pdf` - Kompresi dokumen PDF
- `POST /api/media/merge-pdfs` - Gabung multiple file PDF
- `POST /api/media/extract-pdf-text` - Ekstraksi teks & metadata PDF

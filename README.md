# 🚀 Micro-SaaS Web Studio & REST API

Interactive Web Studio dan REST API terpadu untuk:
1. **ATS Resume Builder & Scorer** (Scoring 0–100, Job Description Matcher, STAR Bullet Optimizer, Export HTML/Markdown/Text).
2. **Media & PDF Converter/Compressor** (WebP/AVIF/PNG/JPEG converter, smart compressor, image-to-PDF, compress PDF, merge PDF, extract text).

---

## 🐳 Cara Deploy dengan Docker

Project ini sudah dilengkapi konfigurasi Docker siap pakai (`Dockerfile` & `docker-compose.yml`).

### Opsi 1: Menjalankan via script deploy (Paling Mudah)
Dari root server atau folder project:
```bash
cd projects/microsaas-web-suite
./deploy.sh
```

### Opsi 2: Menggunakan Docker Compose langsung
```bash
cd projects/microsaas-web-suite
docker compose up -d --build
```

Setelah dideploy, aplikasi web langsung dapat diakses di:
- **Lokal:** `http://localhost:8080`
- **Publik / VPS:** `http://<IP_SERVER>:8080` (atau IP server Anda)

---

## 🛠️ Perintah Berguna
- **Cek Status Container:** `docker compose ps`
- **Lihat Real-time Logs:** `docker compose logs -f`
- **Stop Service:** `docker compose down`
- **Restart Service:** `docker compose restart`

---

## 🌐 Endpoint REST API
- `GET /api/health` - Health check & daftar service aktif
- `GET /api/ats/sample` - Data contoh resume & job description
- `POST /api/ats/review` - Review resume ATS
- `POST /api/ats/match` - Match resume vs job description
- `POST /api/ats/optimize-bullet` - Rewrite bullet points metode STAR
- `POST /api/ats/generate` - Generate resume (Markdown, Text, HTML)
- `POST /api/media/convert-image` - Konversi format gambar
- `POST /api/media/compress-image` - Kompres gambar
- `POST /api/media/images-to-pdf` - Gabung gambar ke PDF
- `POST /api/media/compress-pdf` - Kompres PDF
- `POST /api/media/merge-pdfs` - Gabung file PDF
- `POST /api/media/extract-pdf-text` - Ekstraksi teks PDF

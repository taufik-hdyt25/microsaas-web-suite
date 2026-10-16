#!/usr/bin/env bash
set -e

echo "🚀 Deploying Micro-SaaS Web Suite via Docker..."

# Pastikan berada di folder project
cd "$(dirname "$0")"

# Build dan jalankan container di background
docker compose up -d --build

echo ""
echo "✅ Micro-SaaS Web Studio berhasil dideploy!"
echo "🌐 Akses web di: http://localhost:8080 atau http://<IP_SERVER>:8080"
echo "📊 Cek status container: docker compose ps"
echo "📜 Cek logs: docker compose logs -f"

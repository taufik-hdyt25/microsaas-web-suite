FROM node:22-bookworm-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy source code and assets
COPY . .

# Ensure upload and output directories exist
RUN mkdir -p uploads outputs

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "src/server.js"]

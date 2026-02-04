FROM node:20-alpine AS base

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm ci --only=production 2>/dev/null || npm install --production

# Copiar código
COPY src/ ./src/
COPY schema.sql ./schema.sql

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1

# Arranque
CMD ["node", "src/index.js"]

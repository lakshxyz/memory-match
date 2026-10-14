# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:24-alpine AS runtime

WORKDIR /app

# Only install production deps (no devDependencies, no native builds)
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy compiled JS from builder stage
COPY --from=builder /app/dist ./dist

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Expose API port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

ENV PORT=4000
ENV DB_DIR=/app/data
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]

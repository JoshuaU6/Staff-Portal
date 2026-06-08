# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /workspace

# Copy package manifests first so layer cache is reused on code-only changes
COPY package.json package-lock.json .npmrc ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/db/package.json                ./lib/db/
COPY lib/api-zod/package.json           ./lib/api-zod/
COPY lib/api-spec/package.json          ./lib/api-spec/
COPY lib/api-client-react/package.json  ./lib/api-client-react/
COPY scripts/package.json               ./scripts/

# Install all dependencies (dev + prod) — needed for esbuild
RUN npm ci --legacy-peer-deps --install-strategy=nested

# Copy source
COPY lib/   ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# Build the API server bundle
RUN npm run build -w @workspace/api-server

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:24-alpine AS runtime
WORKDIR /app

# Create non-root user
RUN addgroup -S mtc && adduser -S appuser -G mtc

# Copy bundled output (esbuild emits self-contained ESM + pino worker files)
COPY --from=builder /workspace/artifacts/api-server/dist ./dist

# Copy package.json so node resolves optional native modules gracefully
COPY --from=builder /workspace/artifacts/api-server/package.json ./package.json

# Install only the native optional runtime deps (pg-native etc.) if present
# The esbuild bundle is self-contained — this is a safety net only
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts 2>/dev/null || true

USER appuser

ENV NODE_ENV=production \
    PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/healthz || exit 1

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]

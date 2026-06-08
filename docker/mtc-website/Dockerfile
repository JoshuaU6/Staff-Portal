# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /workspace

COPY package.json package-lock.json .npmrc ./
COPY artifacts/mtc-website/package.json ./artifacts/mtc-website/
COPY scripts/package.json               ./scripts/

RUN npm ci --legacy-peer-deps --install-strategy=nested

COPY artifacts/mtc-website/ ./artifacts/mtc-website/

# Vite build — mtc-website has no shared lib dependencies
RUN PORT=3001 BASE_PATH=/ npm run build -w @workspace/mtc-website

# ── Stage 2: Static serve via nginx ──────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf

COPY docker/mtc-website/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /workspace/artifacts/mtc-website/dist/public /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /workspace

COPY package.json package-lock.json .npmrc ./
COPY artifacts/staff-portal/package.json ./artifacts/staff-portal/
COPY lib/api-zod/package.json            ./lib/api-zod/
COPY lib/api-client-react/package.json   ./lib/api-client-react/
COPY lib/db/package.json                 ./lib/db/
COPY lib/api-spec/package.json           ./lib/api-spec/
COPY scripts/package.json                ./scripts/

RUN npm ci --legacy-peer-deps --install-strategy=nested

COPY lib/             ./lib/
COPY artifacts/staff-portal/ ./artifacts/staff-portal/

# Clerk publishable key must be baked in at build time (Vite compile-time constant)
# Pass via: docker build --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}

# Vite build — produces dist/public/
RUN PORT=3000 BASE_PATH=/portal/ \
    VITE_CLERK_PUBLISHABLE_KEY="${VITE_CLERK_PUBLISHABLE_KEY}" \
    CLERK_PUBLISHABLE_KEY="${CLERK_PUBLISHABLE_KEY}" \
    npm run build -w @workspace/staff-portal

# ── Stage 2: Static serve via nginx ──────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY docker/staff-portal/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /workspace/artifacts/staff-portal/dist/public /usr/share/nginx/html/portal

# nginx master process must run as root to bind port 80; workers drop to nginx user
# automatically via the 'user nginx;' directive in the default nginx image config.
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/portal/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

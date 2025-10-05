FROM node:18-alpine AS builder

WORKDIR /build

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build and obfuscate
RUN npm run build 2>/dev/null || true

# Production stage
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only necessary files
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/public ./public
COPY --from=builder /build/config ./config

# Create flag directory structure
RUN mkdir -p /var/lib/securevault && \
    chown -R nodejs:nodejs /var/lib/securevault

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node dist/healthcheck.js || exit 1

CMD ["node", "dist/server.js"]
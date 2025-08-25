FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install SQLite3
RUN apk add --no-cache sqlite

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

# Create database directory
RUN mkdir -p /usr/src/app/database

# Create logs directory
RUN mkdir -p /usr/src/app/logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV JWT_SECRET=secret123
ENV FLAG="freshers{JWT_C00K13_M4N1PUL4T10N_1S_D4NG3R0US}"
ENV DATABASE_PATH=/usr/src/app/database/ctf.db

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})" || exit 1

# Run the application
CMD ["node", "src/server.js"]
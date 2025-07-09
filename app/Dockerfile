# Use Node.js Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat wget

# Use existing user with UID 1000 or create new one
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create data and logs directories with proper permissions
RUN mkdir -p data logs && \
    chmod 755 data logs

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Create startup script to ensure database file exists
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'mkdir -p /app/data /app/logs' >> /app/start.sh && \
    echo 'touch /app/data/treasury.db' >> /app/start.sh && \
    echo 'exec npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start with our custom script
CMD ["/app/start.sh"]
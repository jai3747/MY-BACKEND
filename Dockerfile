
# # # # my backend 
# # # FROM node:16-alpine

# # # WORKDIR /app

# # # COPY package*.json ./
# # # RUN npm install

# # # COPY . .

# # # EXPOSE 5000

# # # CMD ["node", "server.js"]
# # FROM node:18-alpine
# # WORKDIR /app
# # COPY package*.json ./
# # RUN npm install
# # COPY . .
# # RUN npm run build
# # EXPOSE 3000
# # CMD ["npm", "start"]
# # Build stage
# FROM node:18-alpine AS builder

# # Set working directory
# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install dependencies
# RUN npm ci

# # Copy source code
# COPY . .

# # Build application
# RUN npm run build

# # Production stage
# FROM node:18-alpine

# # Set working directory
# WORKDIR /app

# # Set Node environment
# ENV NODE_ENV=production

# # Install production dependencies
# COPY package*.json ./
# RUN npm ci --only=production

# # Copy built application from builder stage
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/.env* ./ 

# # Add security measures
# RUN addgroup -g 1001 -S nodejs && \
#     adduser -S nodejs -u 1001 && \
#     chown -R nodejs:nodejs /app

# # Switch to non-root user
# USER nodejs

# # Expose application port
# EXPOSE 5000

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
#   CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# # Start application
# CMD ["npm", "start"]
// Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nodemon.json ./
COPY server.ts ./

# Install dependencies
RUN npm ci

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Add non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["npm", "start"]

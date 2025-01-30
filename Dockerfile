# # # # FROM node:18-alpine AS builder
# # # # WORKDIR /app

# # # # # Copy package files
# # # # COPY package*.json ./
# # # # COPY tsconfig.json ./
# # # # COPY nodemon.json ./
# # # # COPY server.ts ./

# # # # # Install dependencies
# # # # RUN npm ci

# # # # # Build application
# # # # RUN npm run build

# # # # # Production stage
# # # # FROM node:18-alpine
# # # # WORKDIR /app

# # # # # Copy package files and install production dependencies
# # # # COPY package*.json ./
# # # # RUN npm ci --only=production

# # # # # Copy built application
# # # # COPY --from=builder /app/dist ./dist

# # # # # Add non-root user
# # # # RUN addgroup -g 1001 nodejs && \
# # # #     adduser -S nodejs -u 1001 && \
# # # #     chown -R nodejs:nodejs /app

# # # # USER nodejs

# # # # EXPOSE 5000

# # # # HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
# # # #   CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# # # # CMD ["npm", "start"]

# # # FROM node:18-alpine AS builder
# # # WORKDIR /app

# # # # Copy package files
# # # COPY package*.json ./
# # # COPY tsconfig.json ./
# # # COPY nodemon.json ./
# # # COPY server.ts ./

# # # # Install dependencies and build
# # # RUN npm install
# # # RUN npm run build

# # # # Production stage
# # # FROM node:18-alpine
# # # WORKDIR /app

# # # # Copy package files and install production dependencies
# # # COPY package*.json ./
# # # RUN npm ci --omit=dev

# # # # Copy built application
# # # COPY --from=builder /app/dist ./dist

# # # # Add non-root user
# # # RUN addgroup -g 1001 nodejs && \
# # #     adduser -S nodejs -u 1001 && \
# # #     chown -R nodejs:nodejs /app

# # # USER nodejs

# # # EXPOSE 5000

# # # HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
# # #   CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# # # CMD ["npm", "start"]
# # # Dockerfile
# # FROM node:18-alpine AS builder
# # WORKDIR /app

# # # Copy package files
# # COPY package*.json ./
# # COPY tsconfig.json ./
# # COPY nodemon.json ./
# # COPY server.ts ./

# # # Install dependencies and build
# # # Use --legacy-peer-deps to handle dependency conflicts
# # RUN npm install --legacy-peer-deps
# # RUN npm run build

# # # Production stage
# # FROM node:18-alpine
# # WORKDIR /app

# # # Copy package files and install production dependencies
# # COPY package*.json ./
# # # Use regular npm install for production dependencies instead of npm ci
# # RUN npm install --omit=dev --legacy-peer-deps

# # # Copy built application
# # COPY --from=builder /app/dist ./dist

# # # Add non-root user
# # RUN addgroup -g 1001 nodejs && \
# #     adduser -S nodejs -u 1001 && \
# #     chown -R nodejs:nodejs /app

# # USER nodejs
# # EXPOSE 5000

# # HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
# #   CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# # CMD ["npm", "start"]

# # # Steps to fix dependency issues:
# # # 1. Delete existing package-lock.json
# # # 2. Run npm install to generate fresh lock file
# # # 3. Commit the new package-lock.json
# # Dockerfile
# FROM node:18-alpine AS builder
# WORKDIR /app

# # Copy package files first to leverage Docker cache
# COPY package*.json ./
# COPY tsconfig.json ./
# COPY nodemon.json ./

# # Clean install of dependencies with exact versions
# RUN npm clean-install

# # Copy source code
# COPY server.ts ./

# # Build the application
# RUN npm run build

# # Production stage
# FROM node:18-alpine
# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install only production dependencies with exact versions
# RUN npm clean-install --omit=dev

# # Copy built application
# COPY --from=builder /app/dist ./dist

# # Add non-root user
# RUN addgroup -g 1001 nodejs && \
#     adduser -S nodejs -u 1001 && \
#     chown -R nodejs:nodejs /app

# USER nodejs
# EXPOSE 5000

# HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
#   CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# CMD ["npm", "start"]
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
COPY tsconfig.json ./
COPY nodemon.json ./

# Install dependencies with regular npm install to update package-lock.json if needed
RUN npm install

# Copy source code
COPY server.ts ./

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev
RUN npm install helmet express-rate-limit
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

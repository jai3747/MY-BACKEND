# FROM node:18-alpine AS builder
# WORKDIR /app

# # Copy package files first to leverage Docker cache
# COPY package*.json ./
# COPY tsconfig.json ./
# COPY nodemon.json ./

# # Install ALL dependencies including types
# RUN npm install
# RUN npm install --save-dev @types/helmet @types/express-rate-limit

# # Copy source code
# COPY server.ts ./

# # Build the application
# RUN npm run build

# # Production stage
# FROM node:18-alpine
# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install production dependencies
# RUN npm install --omit=dev
# RUN npm install helmet express-rate-limit

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

# Install ALL dependencies including types
RUN npm install
RUN npm install --save-dev @types/helmet @types/express-rate-limit

# Copy source code
COPY server.ts ./

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
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

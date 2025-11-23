# Use Node.js 20 Alpine
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY packages/db/package.json ./packages/db/
COPY packages/api/package.json ./packages/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/db ./packages/db
COPY packages/api ./packages/api

# Build the database package
WORKDIR /app/packages/db
RUN pnpm run build

# Build the API
WORKDIR /app/packages/api
RUN pnpm run build

# Expose port
EXPOSE 4000

# Start the server
CMD ["pnpm", "start"]
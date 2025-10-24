# Use official Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for Prisma
RUN apk add --no-cache openssl

# Copy package files and install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install

# Copy the rest of your app
COPY . .

# Build Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Expose port (default for Next.js)
EXPOSE 3002

# Start the app
CMD npx prisma migrate deploy && npm start
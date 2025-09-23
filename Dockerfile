# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build final image
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Copy dependencies from previous stage
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Add a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "index.js"]
